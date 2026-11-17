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
  /**
   * `mismatch` when the DOM and the vnode tree disagreed, `exception` when
   * patching threw before there was anything to compare.
   */
  kind?: "mismatch" | "exception";
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
  vnode: VNode | null;
  mismatch: Mismatch | null;
  /** Set when the patch or the comparison threw instead of returning. */
  error?: string;
};

function describeThrown(error: unknown): string {
  if (error instanceof Error) {
    const name = error.name === "" ? "Error" : error.name;
    return name === "Error" ? error.message : `${name}: ${error.message}`;
  }
  return String(error);
}

/** Renders a dump, so that a tree that cannot be walked still gets reported. */
function dumpOr(dump: () => string, what: string): string {
  try {
    return dump();
  } catch (error) {
    return `(${what} could not be dumped: ${describeThrown(error)})`;
  }
}

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
  const heading =
    failure.kind === "exception"
      ? "Snabbdom fuzz was thrown out of patching"
      : "Snabbdom fuzz found a DOM that does not match its vnode tree";
  const lines = [
    heading,
    `  seed:       ${failure.seed}`,
    `  test seed:  ${iterationSeed(failure.seed, failure.testIndex)}`,
    `  tests:      ${failure.tests}`,
    `  test:       ${failure.testIndex} (zero based)`,
    `  round:      ${failure.round} of ${failure.rounds}`,
    `  operation:  ${failure.operation}`,
    `  detail:     ${failure.detail}`,
    `  vnode path: ${failure.vnodePath}`,
    `  dom path:   ${failure.domPath}`,
    `  reason:     ${failure.message}`
  ];
  if (failure.kind === "exception") {
    lines.push(
      `  note:       the trees below are the state before the operation that threw`
    );
  }
  if (failure.expected.length > 0 || failure.actual.length > 0) {
    lines.push(
      "",
      "expected siblings:",
      ...failure.expected,
      "",
      "actual siblings:",
      ...failure.actual
    );
  }
  lines.push(
    "",
    "vnode tree (paths are children of the patched root):",
    failure.vnodeDump,
    "",
    "dom tree (paths are children of the patched root element):",
    failure.domDump,
    "",
    `Reproduce with: ${reproduceCommand(failure.seed, failure.tests, failure.testIndex)}`
  );
  return lines.join("\n");
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

type Step = { round: number; operation: string; detail: string };

function runTest(params: RunTestParams): FuzzResult {
  const { seed, index, tests, verify } = params;
  const stopOnMismatch = params.stopOnMismatch ?? verify;
  const generate = resolveGenerateOptions(params.options ?? {});
  const rng = createRng(hashString(iterationSeed(seed, index)));
  const container = document.createElement("div");
  document.body.appendChild(container);

  try {
    let spec: Spec[] = generateChildren(rng, 1, generate);
    let vnode: VNode | null = null;
    const rounds = rng.range(generate.rounds[0], generate.rounds[1]);

    let failure: FuzzFailure | null = null;

    // The vnode tree of the last successful patch, or the tree that was about
    // to be patched when the patch threw.
    const treeToDump = (): VNode[] =>
      vnode === null ? toVNodes(spec) : ((vnode.children ?? []) as VNode[]);

    const makeFailure = (
      step: Step,
      kind: "mismatch" | "exception",
      message: string,
      vnodePath: string,
      domPath: string,
      expected: string[],
      actual: string[]
    ): FuzzFailure => ({
      seed,
      tests,
      testIndex: index,
      round: step.round,
      rounds,
      operation: step.operation,
      detail: step.detail,
      kind,
      vnodePath,
      domPath,
      message,
      expected,
      actual,
      vnodeDump: dumpOr(
        () => dumpVNodeTree(treeToDump(), vnodePath),
        "the vnode tree"
      ),
      domDump: dumpOr(
        () => dumpDomTree(vnode?.elm as Node | undefined as Node, domPath),
        "the dom tree"
      )
    });

    const record = (step: Step): void => {
      let mismatch: Mismatch | null = null;
      let error: string | undefined;
      if (verify) {
        try {
          if (vnode !== null) mismatch = compareStep(vnode);
        } catch (thrown) {
          error = describeThrown(thrown);
        }
      }
      params.onStep?.({
        ...step,
        rounds,
        spec,
        vnode,
        mismatch,
        error
      });
      if (failure !== null) return;
      if (error !== undefined) {
        failure = makeFailure(
          step,
          "exception",
          `comparing the DOM against the vnode tree threw ${error}`,
          "root",
          "dom",
          [],
          []
        );
        return;
      }
      if (mismatch === null || !stopOnMismatch) return;
      failure = makeFailure(
        step,
        "mismatch",
        mismatch.message,
        mismatch.vnodePath,
        mismatch.domPath,
        mismatch.expected,
        mismatch.actual
      );
    };

    // A patch that throws is a result of its own: snabbdom asked the DOM for
    // something the DOM refused, which is a finding, not a broken test.
    const runStep = (step: Step, run: () => void): void => {
      if (failure !== null) return;
      try {
        run();
      } catch (thrown) {
        const error = describeThrown(thrown);
        params.onStep?.({
          ...step,
          rounds,
          spec,
          vnode,
          mismatch: null,
          error
        });
        failure = makeFailure(
          step,
          "exception",
          `the patch threw ${error}`,
          "root",
          "dom",
          [],
          []
        );
        return;
      }
      record(step);
    };

    runStep(
      {
        round: 0,
        operation: "init",
        detail: `initial tree with ${spec.length} root nodes`
      },
      () => {
        vnode = patch(container, h("div", toVNodes(spec)));
      }
    );

    for (let round = 1; round <= rounds; round++) {
      if (failure !== null) break;
      const mutation = mutate(rng, spec, generate);
      spec = mutation.children;
      runStep(
        { round, operation: mutation.operation, detail: mutation.detail },
        () => {
          vnode = patch(vnode as VNode, h("div", toVNodes(spec)));
        }
      );
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
 * Runs a test and turns anything that escapes it into a failure, so that an
 * unexpected exception is reported for its iteration instead of ending the run.
 */
function runTestSafely(params: RunTestParams): FuzzResult {
  try {
    return runTest(params);
  } catch (error) {
    const failure: FuzzFailure = {
      seed: params.seed,
      tests: params.tests,
      testIndex: params.index,
      round: 0,
      rounds: 0,
      operation: "setup",
      detail: "the test could not be set up",
      kind: "exception",
      message: `the fuzzer threw ${describeThrown(error)}`,
      vnodePath: "root",
      domPath: "dom",
      expected: [],
      actual: [],
      vnodeDump: "(the test failed before any tree could be built)",
      domDump: "(the test failed before any node could be patched)"
    };
    return {
      ok: false,
      seed: params.seed,
      tests: params.tests,
      failure,
      report: formatFailure(failure)
    };
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
  return runTestSafely(params);
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
  let errors = 0;
  for (const step of steps) {
    const heading =
      step.round === 0
        ? "init"
        : `round ${step.round} of ${step.rounds}: ${step.operation}`;
    lines.push("", `=== ${heading} ===`, `change: ${step.detail}`, "");
    if (step.vnode === null) {
      lines.push("(no trees: the patch threw before it produced a vnode)");
    } else {
      lines.push("vnode tree:");
      lines.push(
        dumpVNodeTree(
          (step.vnode.children ?? []) as VNode[],
          step.mismatch?.vnodePath
        )
      );
      lines.push("", "dom tree:");
      lines.push(dumpDomTree(step.vnode.elm as Node, step.mismatch?.domPath));
    }
    if (step.mismatch !== null) {
      mismatches++;
      lines.push(
        "",
        `MISMATCH ${step.mismatch.vnodePath} / ${step.mismatch.domPath}: ${step.mismatch.message}`
      );
    }
    if (step.error !== undefined) {
      errors++;
      lines.push("", `ERROR ${step.error}`);
    }
  }
  lines.push(
    "",
    `steps: ${steps.length}, mismatches: ${mismatches}, errors: ${errors}`
  );
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
