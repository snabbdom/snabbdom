import Benchmark from "benchmark";
import jsdom from "jsdom";
import { h, init } from "snabbdom";

const dom = new jsdom.JSDOM('<!doctype html><div id="container"></div>');

global.window = dom.window;
global.document = dom.window.document;

const patch = init([]);
const spanElemsTotal = 20;
const suite = new Benchmark.Suite();
const elm = dom.window.document.getElementById("container");

const vnode1 = h(
  "div",
  Array(spanElemsTotal).map((n, i) => h("span", { key: i }, String(i)))
);

const vnode2 = h(
  "div",
  [h("span", { key: "new" }, "new")].concat(
    Array(spanElemsTotal).map((n, i) => h("span", { key: i }, String(i)))
  )
);

suite
  .add("add, replace, remove span elems", () => {
    patch(elm, vnode1);
    patch(vnode1, vnode2);
    patch(vnode2, h("!"));
  })
  .on("cycle", (event) => console.log(String(event.target)))
  .run({ async: true });
