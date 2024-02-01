import { assert } from "@esm-bundle/chai";

import { datasetModule, init, h, toVNode } from "../../src/index";

const patch = init([datasetModule]);

describe("dataset", () => {
  before(() => {
    if (!Object.hasOwnProperty.call(HTMLElement.prototype, "dataset")) {
      this.skip();
    }
  });

  let elm: any, vnode0: any;
  beforeEach(() => {
    elm = document.createElement("div");
    vnode0 = elm;
  });
  it("is set on initial element creation", () => {
    elm = patch(vnode0, h("div", { dataset: { foo: "foo" } })).elm;
    assert.strictEqual(elm.dataset.foo, "foo");
  });
  it("toVNode & dataset", () => {
    const elem1 = document.createElement("div");
    elem1.innerHTML = '<div data-foo="foo"></div>';
    const elem2 = document.createElement("div");
    elem2.innerHTML = '<div data-foo="foo-new"></div>';
    const oldNode = toVNode(elem1);
    const newNode = toVNode(elem2);
    patch(oldNode, newNode);
    assert.strictEqual(elem1.innerHTML, '<div data-foo="foo-new"></div>');
  });
  it("updates dataset", () => {
    const vnode1 = h("i", { dataset: { foo: "foo", bar: "bar" } });
    const vnode2 = h("i", { dataset: { baz: "baz" } });
    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.dataset.foo, "foo");
    assert.strictEqual(elm.dataset.bar, "bar");
    elm = patch(vnode1, vnode2).elm;
    assert.strictEqual(elm.dataset.baz, "baz");
    assert.strictEqual(elm.dataset.foo, undefined);
  });
  it("handles falsy values", () => {
    const vnode1 = h("i", { dataset: { foo: "" } });
    const vnode2 = h("i", { dataset: { foo: "" } });
    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.dataset.foo, "");
    elm = patch(vnode1, vnode2).elm;
    assert.strictEqual(elm.dataset.foo, "");
  });
  it("can be memoized", () => {
    const cachedDataset = { foo: "foo", bar: "bar" };
    const vnode1 = h("i", { dataset: cachedDataset });
    const vnode2 = h("i", { dataset: cachedDataset });
    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.dataset.foo, "foo");
    assert.strictEqual(elm.dataset.bar, "bar");
    elm = patch(vnode1, vnode2).elm;
    assert.strictEqual(elm.dataset.foo, "foo");
    assert.strictEqual(elm.dataset.bar, "bar");
  });
  it("handles string conversions", () => {
    const vnode1 = h("i", {
      dataset: {
        empty: "",
        dash: "-",
        dashed: "foo-bar",
        camel: "fooBar",
        integer: 0 as any,
        float: 0.1 as any
      }
    });
    elm = patch(vnode0, vnode1).elm;

    assert.strictEqual(elm.dataset.empty, "");
    assert.strictEqual(elm.dataset.dash, "-");
    assert.strictEqual(elm.dataset.dashed, "foo-bar");
    assert.strictEqual(elm.dataset.camel, "fooBar");
    assert.strictEqual(elm.dataset.integer, "0");
    assert.strictEqual(elm.dataset.float, "0.1");
  });
});
