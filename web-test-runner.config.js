import { esbuildPlugin } from "@web/dev-server-esbuild";
import { browserstackLauncher } from "@web/test-runner-browserstack";
import browsers from "./browserstack-browsers.js";

const ci = !!process.env.CI;

const sharedCapabilities = {
  "browserstack.user": process.env.BROWSER_STACK_USERNAME,
  "browserstack.key": process.env.BROWSER_STACK_ACCESS_KEY,
  project: "snabbdom",
  name: "CI",
  build: `build ${process.env.GITHUB_RUN_NUMBER || "unknown"}`
};

export default {
  concurrentBrowsers: 2,
  browserStartTimeout: 90000, // 90 seconds
  concurrency: ci ? 2 : 1,
  browsers: !ci
    ? undefined
    : Object.values(browsers).map((cap) =>
        browserstackLauncher({
          capabilities: {
            ...sharedCapabilities,
            ...cap
          }
        })
      ),
  files: ["src/**/*.ts", "test/unit/*.ts", "test/unit/*.tsx"],
  plugins: [
    esbuildPlugin({ ts: true, tsx: true, tsconfig: "./test/tsconfig.json" })
  ]
};
