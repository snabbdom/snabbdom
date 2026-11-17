import { JSDOM } from "jsdom";

// Installing this on import keeps CLI imports simple: it has to run before
// snabbdom is imported, because its modules read globals such as `window` while
// they are evaluated.
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost/"
});
const globals = globalThis as unknown as Record<string, unknown>;
globals.document = dom.window.document;
globals.window = dom.window;
