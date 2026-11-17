import {
  attributesModule,
  classModule,
  h,
  init,
  propsModule,
  VNode
} from "../../src/index";
import {
  compareChildren,
  dumpDomTree,
  dumpVNodeTree,
  Mismatch
} from "./compare";
import { createRng, createSeed, hashString, iterationSeed } from "./random";
import {
  generateChildren,
  mutate,
  Spec,
  toVNodes,
  GenerateOptions
} from "./tree";

/** Number of tests a run performs when it is not given a count. */
export const DEFAULT_TESTS = 25;

export const DEFAULT_GENERATE_OPTIONS: GenerateOptions = {
  maxDepth: 5,
  maxSiblings: 10,
  rounds: [2, 6]
};

export { iterationSeed } from "./random";

const patch = init([attributesModule, classModule, propsModule], undefined, {
  experimental: { fragments: true }
});

export type FuzzOptions = {
  /** Seed to use. A new seed is generated and reported when it is omitted. */
  seed?: string;
  /** Number of tests to run. */
  tests?: number;
  /**
   * Index of a single test to run on its own. Every test derives its own
   * generator from `<seed>-<index>`, so nothing before it has to run.
   */
  iteration?: number;
  /** Print the trees of `iteration` instead of checking anything. */
  dump?: boolean;
  maxDepth?: number;
  maxSiblings?: number;
  rounds?: [number, number];
};

export type FuzzFailure = {
  seed: string;
  tests: number;
  testIndex: number;
  round: number;
  rounds: number;
  operation: string;
  detail: string;
  vnodePath: string;
  domPath: string;
  message: string;
  expected: string[];
  actual: string[];
  vnodeDump: string;
  domDump: string;
};

export type FuzzResult = {
  ok: boolean;
  seed: string;
  tests: number;
  failure?: FuzzFailure;
  report: string;
};

/** Outcome of a run that keeps going after a failing iteration. */
export type FuzzSummary = {
  ok: boolean;
  seed: string;
  /** Number of iterations that were run. */
  tests: number;
  passed: number;
  failed: number;
  failures: FuzzFailure[];
  report: string;
};

/** One patch performed by a test, with the resulting trees. */
export type FuzzStep = {
  round: number;
  rounds: number;
  operation: string;
  detail: string;
  spec: Spec[];
  vnode: VNode;
  mismatch: Mismatch | null;
};

export function resolveSeed(options: FuzzOptions): string {
  return options.seed === undefined || options.seed === ""
    ? createSeed()
    : options.seed;
}

export function resolveTests(options: FuzzOptions): number {
  const tests = options.tests ?? DEFAULT_TESTS;
  if (!Number.isInteger(tests) || tests < 1) {
    throw new Error(`tests must be a positive integer, got ${tests}`);
  }
  return tests;
}

function resolveGenerateOptions(options: FuzzOptions): GenerateOptions {
  return {
    maxDepth: options.maxDepth ?? DEFAULT_GENERATE_OPTIONS.maxDepth,
    maxSiblings: options.maxSiblings ?? DEFAULT_GENERATE_OPTIONS.maxSiblings,
    rounds: options.rounds ?? DEFAULT_GENERATE_OPTIONS.rounds
  };
}

function reproduceCommand(seed: string, tests: number, index: number): string {
  return `npm run fuzz -- --seed ${seed} --tests ${tests} --iteration ${index}`;
}

function formatFailure(failure: FuzzFailure): string {
  return [
    "Snabbdom fuzz found a DOM that does not match its vnode tree",
    `  seed:       ${failure.seed}`,
    `  test seed:  ${iterationSeed(failure.seed, failure.testIndex)}`,
    `  tests:      ${failure.tests}`,
    `  test:       ${failure.testIndex} (zero based)`,
    `  round:      ${failure.round} of ${failure.rounds}`,
    `  operation:  ${failure.operation}`,
    `  detail:     ${failure.detail}`,
    `  vnode path: ${failure.vnodePath}`,
    `  dom path:   ${failure.domPath}`,
    `  reason:     ${failure.message}`,
    "",
    "expected siblings:",
    ...failure.expected,
    "",
    "actual siblings:",
    ...failure.actual,
    "",
    "vnode tree (paths are children of the patched root):",
    failure.vnodeDump,
    "",
    "dom tree (paths are children of the patched root element):",
    failure.domDump,
    "",
    `Reproduce with: ${reproduceCommand(failure.seed, failure.tests, failure.testIndex)}`
  ].join("\n");
}

/** How many failing iterations a summary lists by default. */
export const SUMMARY_SAMPLE_LIMIT = 10;

function formatSummary(summary: FuzzSummary): string {
  const lines = [
    "fuzz summary",
    `  seed:       ${summary.seed}`,
    `  iterations: ${summary.tests} run, ${summary.passed} passed, ${summary.failed} failed`
  ];
  const shown = summary.failures.slice(0, SUMMARY_SAMPLE_LIMIT);
  if (shown.length > 0) {
    lines.push("", `failed iterations (${summary.failed}):`);
    for (const failure of shown) {
      lines.push(
        `  ${reproduceCommand(failure.seed, failure.tests, failure.testIndex)}`
      );
    }
    const remaining = summary.failed - shown.length;
    if (remaining > 0) {
      lines.push(`  ... ${remaining} more`);
    }
  }
  return lines.join("\n");
}

function compareStep(vnode: VNode): Mismatch | null {
  return compareChildren(
    vnode.elm as Node,
    (vnode.children ?? []) as VNode[],
    "root",
    "dom"
  );
}

type RunTestParams = {
  seed: string;
  index: number;
  tests: number;
  /** Compare the DOM against the vnode tree after every patch. */
  verify: boolean;
  /** Abort at the first mismatch instead of only recording it. */
  stopOnMismatch?: boolean;
  options?: FuzzOptions;
  onStep?: (step: FuzzStep) => void;
};

function runTest(params: RunTestParams): FuzzResult {
  const { seed, index, tests, verify } = params;
  const stopOnMismatch = params.stopOnMismatch ?? verify;
  const generate = resolveGenerateOptions(params.options ?? {});
  const rng = createRng(hashString(iterationSeed(seed, index)));
  const container = document.createElement("div");
  document.body.appendChild(container);

  try {
    let spec: Spec[] = generateChildren(rng, 1, generate);
    let vnode = patch(container, h("div", toVNodes(spec)));
    const rounds = rng.range(generate.rounds[0], generate.rounds[1]);

    let failure: FuzzFailure | null = null;

    const record = (round: number, operation: string, detail: string): void => {
      const mismatch = verify ? compareStep(vnode) : null;
      params.onStep?.({
        round,
        rounds,
        operation,
        detail,
        spec,
        vnode,
        mismatch
      });
      if (mismatch === null || failure !== null || !stopOnMismatch) return;
      failure = {
        seed,
        tests,
        testIndex: index,
        round,
        rounds,
        operation,
        detail,
        vnodePath: mismatch.vnodePath,
        domPath: mismatch.domPath,
        message: mismatch.message,
        expected: mismatch.expected,
        actual: mismatch.actual,
        vnodeDump: dumpVNodeTree(
          (vnode.children ?? []) as VNode[],
          mismatch.vnodePath
        ),
        domDump: dumpDomTree(vnode.elm as Node, mismatch.domPath)
      };
    };

    record(0, "init", `initial tree with ${spec.length} root nodes`);

    for (let round = 1; round <= rounds; round++) {
      if (failure !== null) break;
      const mutation = mutate(rng, spec, generate);
      spec = mutation.children;
      vnode = patch(vnode, h("div", toVNodes(spec)));
      record(round, mutation.operation, mutation.detail);
    }

    if (failure !== null) {
      const reported: FuzzFailure = failure;
      return {
        ok: false,
        seed,
        tests,
        failure: reported,
        report: formatFailure(reported)
      };
    }
    return {
      ok: true,
      seed,
      tests,
      report: `fuzz passed: seed=${seed} test=${index} rounds=${rounds}`
    };
  } finally {
    container.remove();
  }
}

/**
 * Runs a single fuzz test: it generates a vnode tree, patches it into the DOM
 * and then applies between `rounds[0]` and `rounds[1]` random operations to the
 * tree, comparing the DOM against the vnode tree after every patch.
 */
export function runFuzzTest(params: {
  seed: string;
  index: number;
  tests: number;
  verify: boolean;
  options?: FuzzOptions;
  onStep?: (step: FuzzStep) => void;
}): FuzzResult {
  return runTest(params);
}

/**
 * Renders a trace of a single test: the initial tree, and for every round the
 * operation that was applied together with the resulting vnode and DOM trees.
 * Meant for looking at what a specific test of a run is doing.
 */
export function dumpFuzzTest(params: {
  seed: string;
  index: number;
  tests: number;
  options?: FuzzOptions;
}): string {
  const steps: FuzzStep[] = [];
  runTest({
    seed: params.seed,
    index: params.index,
    tests: params.tests,
    verify: true,
    stopOnMismatch: false,
    options: params.options,
    onStep: (step) => steps.push(step)
  });

  const lines: string[] = [
    `fuzz trace: seed=${params.seed} tests=${params.tests} test=${params.index}`
  ];
  let mismatches = 0;
  for (const step of steps) {
    const heading =
      step.round === 0
        ? "init"
        : `round ${step.round} of ${step.rounds}: ${step.operation}`;
    lines.push("", `=== ${heading} ===`, `change: ${step.detail}`, "");
    lines.push("vnode tree:");
    lines.push(
      dumpVNodeTree(
        (step.vnode.children ?? []) as VNode[],
        step.mismatch?.vnodePath
      )
    );
    lines.push("", "dom tree:");
    lines.push(dumpDomTree(step.vnode.elm as Node, step.mismatch?.domPath));
    if (step.mismatch !== null) {
      mismatches++;
      lines.push(
        "",
        `MISMATCH ${step.mismatch.vnodePath} / ${step.mismatch.domPath}: ${step.mismatch.message}`
      );
    }
  }
  lines.push("", `steps: ${steps.length}, mismatches: ${mismatches}`);
  return lines.join("\n");
}

/**
 * Runs the fuzz tests. Without `iteration` it runs `tests` tests, comparing the
 * DOM against the vnode tree after every patch. With `iteration` it runs that
 * one test only: every test draws from `<seed>-<index>`, so the tests before it
 * do not have to run to reach it.
 */
export function runFuzzSuite(options: FuzzOptions = {}): FuzzResult {
  const seed = resolveSeed(options);
  const tests = resolveTests(options);
  const iteration = options.iteration;
  if (options.dump === true) {
    if (iteration === undefined) {
      throw new Error(
        "dump needs an iteration number, e.g. dump=1&iteration=3"
      );
    }
    return {
      ok: true,
      seed,
      tests,
      report: dumpFuzzTest({ seed, index: iteration, tests, options })
    };
  }
  if (iteration !== undefined) {
    if (!Number.isInteger(iteration) || iteration < 0) {
      throw new Error(
        `iteration must be a non-negative integer, got ${iteration}`
      );
    }
    const result = runFuzzTest({
      seed,
      index: iteration,
      tests,
      verify: true,
      options
    });
    return result.ok
      ? {
          ok: true,
          seed,
          tests,
          report: `fuzz passed: seed=${seed} iteration=${iteration}`
        }
      : result;
  }
  for (let index = 0; index < tests; index++) {
    const result = runFuzzTest({ seed, index, tests, verify: true, options });
    if (!result.ok) return result;
  }
  return {
    ok: true,
    seed,
    tests,
    report: `fuzz passed: seed=${seed} tests=${tests}`
  };
}

/**
 * Runs every test, even when some of them fail. A failing test still stops at
 * its first mismatch; the iteration after it runs as usual. The report is a
 * summary with up to `SUMMARY_SAMPLE_LIMIT` commands that replay a failure.
 */
export function runFuzzAll(options: FuzzOptions = {}): FuzzSummary {
  const seed = resolveSeed(options);
  const tests = resolveTests(options);
  const failures: FuzzFailure[] = [];
  for (let index = 0; index < tests; index++) {
    const result = runFuzzTest({ seed, index, tests, verify: true, options });
    if (result.ok) continue;
    if (result.failure !== undefined) failures.push(result.failure);
  }
  const summary: FuzzSummary = {
    ok: failures.length === 0,
    seed,
    tests,
    passed: tests - failures.length,
    failed: failures.length,
    failures,
    report: ""
  };
  summary.report = formatSummary(summary);
  return summary;
}

export function describeOptions(options: FuzzOptions): string {
  const parts = [`seed=${resolveSeed(options)}`];
  if (options.tests !== undefined) parts.push(`tests=${options.tests}`);
  if (options.iteration !== undefined) {
    parts.push(`iteration=${options.iteration}`);
  }
  if (options.dump === true) parts.push("dump=1");
  if (options.maxDepth !== undefined)
    parts.push(`maxDepth=${options.maxDepth}`);
  if (options.maxSiblings !== undefined) {
    parts.push(`maxSiblings=${options.maxSiblings}`);
  }
  return parts.join(" ");
}
