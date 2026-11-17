// Installs jsdom. Must stay first: the modules below read DOM globals while they
// are being evaluated.
import "./dom";
import type { FuzzOptions } from "./index";
import {
  describeOptions,
  dumpFuzzTest,
  resolveSeed,
  resolveTests,
  runFuzzAll,
  runFuzzSuite
} from "./index";

const USAGE = `Usage: npm run fuzz -- [options]

  --seed <seed>         Seed of the run. A new one is generated when omitted.
  --tests <count>       Number of tests to run, 25 by default.
  --iteration <index>   Run only this test instead of the whole suite.
  --run-all             Keep going after a failing test and print a summary of
                        the run instead of the first failure.
  --dump                With --iteration, print the trees of that test instead
                        of checking anything.
  --max-depth <level>   Deepest nesting level of a node, 5 by default.
  --max-siblings <n>    Most children a parent may have, 10 by default.
  --help                Show this help.

Reproduce a failure by passing the seed, the test count and the iteration that
the failure reported, e.g.

  npm run fuzz -- --seed 39yq931xe69p9 --tests 25 --iteration 6
`;

type Args = {
  options: FuzzOptions;
  help: boolean;
  runAll: boolean;
};

function parseNumber(name: string, value: string): number {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`--${name} needs a number, got ${JSON.stringify(value)}`);
  }
  return parsed;
}

function parseArgs(argv: string[]): Args {
  const options: FuzzOptions = {};
  let help = false;
  let runAll = false;
  for (let i = 0; i < argv.length; i++) {
    const argument = argv[i];
    const [flag, inlineValue] = argument.split("=", 2);
    const value = (): string => {
      if (inlineValue !== undefined) return inlineValue;
      const next = argv[++i];
      if (next === undefined) throw new Error(`${flag} needs a value`);
      return next;
    };
    switch (flag) {
      case "--seed":
        options.seed = value();
        break;
      case "--tests":
        options.tests = parseNumber("tests", value());
        break;
      case "--iteration":
        options.iteration = parseNumber("iteration", value());
        break;
      case "--max-depth":
        options.maxDepth = parseNumber("max-depth", value());
        break;
      case "--max-siblings":
        options.maxSiblings = parseNumber("max-siblings", value());
        break;
      case "--run-all":
        runAll = true;
        break;
      case "--dump":
        options.dump = true;
        break;
      case "--help":
      case "-h":
        help = true;
        break;
      default:
        throw new Error(`unknown option ${argument}`);
    }
  }
  return { options, help, runAll };
}

function formatTime(milliseconds: number): string {
  return `${(milliseconds / 1000).toFixed(2)}s`;
}

function writeTiming(startedAt: number, cpuAtStart: NodeJS.CpuUsage): void {
  // process.cpuUsage reports microseconds, performance.now milliseconds.
  const cpu = process.cpuUsage(cpuAtStart);
  const user = cpu.user / 1000;
  const system = cpu.system / 1000;
  process.stdout.write(
    `Time: ${formatTime(performance.now() - startedAt)} wall, ` +
      `${formatTime(user + system)} cpu ` +
      `(user ${formatTime(user)}, sys ${formatTime(system)})\n`
  );
}

function run(): number {
  let args: Args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${(error as Error).message}\n\n${USAGE}`);
    return 2;
  }
  if (args.help) {
    process.stdout.write(USAGE);
    return 0;
  }

  const { options: parsed, runAll } = args;
  if (parsed.dump === true && parsed.iteration === undefined) {
    process.stderr.write(`--dump needs --iteration\n\n${USAGE}`);
    return 2;
  }
  if (runAll && (parsed.iteration !== undefined || parsed.dump === true)) {
    process.stderr.write(
      `--run-all runs the whole suite, so it cannot be combined with --iteration or --dump\n\n${USAGE}`
    );
    return 2;
  }

  const startedAt = performance.now();
  const cpuAtStart = process.cpuUsage();

  // Resolve the seed once so the reported one is the one that was used.
  const options: FuzzOptions = { ...parsed, seed: resolveSeed(parsed) };
  const seed = options.seed as string;
  const tests = resolveTests(options);
  process.stdout.write(
    `[fuzz] ${describeOptions(options)}${runAll ? " run-all" : ""}\n`
  );

  let code: number;
  if (options.dump === true && options.iteration !== undefined) {
    process.stdout.write(
      `${dumpFuzzTest({ seed, index: options.iteration, tests, options })}\n`
    );
    code = 0;
  } else if (runAll) {
    const summary = runFuzzAll(options);
    process.stdout.write(`${summary.report}\n`);
    code = summary.ok ? 0 : 1;
  } else {
    const result = runFuzzSuite(options);
    process.stdout.write(`${result.report}\n`);
    code = result.ok ? 0 : 1;
  }

  writeTiming(startedAt, cpuAtStart);
  return code;
}

process.exitCode = run();
