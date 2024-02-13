import { assert } from "@esm-bundle/chai";

import { init, RemoveHook, attachTo, h } from "../../src/index";

const patch = init([]);

describe("attachTo", () => {
  let elm: any, vnode0: any;
  beforeEach(() => {
    elm = document.createElement("div");
    vnode0 = elm;
  });
  it("adds element to target", () => {
    const vnode1 = h("div", [
      h("div#wrapper", [
        h("div", "Some element"),
        attachTo(elm, h("div#attached", "Test"))
      ])
    ]);
    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.children.length, 2);
  });
  it("updates element at target", () => {
    const vnode1 = h("div", [
      h("div#wrapper", [
        h("div", "Some element"),
        attachTo(elm, h("div#attached", "First text"))
      ])
    ]);
    const vnode2 = h("div", [
      h("div#wrapper", [
        h("div", "Some element"),
        attachTo(elm, h("div#attached", "New text"))
      ])
    ]);
    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.children[0].innerHTML, "First text");
    elm = patch(vnode1, vnode2).elm;
    assert.strictEqual(elm.children[0].innerHTML, "New text");
  });
  it("element can be inserted before modal", () => {
    const vnode1 = h("div", [
      h("div#wrapper", [
        h("div", "Some element"),
        attachTo(elm, h("div#attached", "Text"))
      ])
    ]);
    const vnode2 = h("div", [
      h("div#wrapper", [
        h("div", "Some element"),
        h("div", "A new element"),
        attachTo(elm, h("div#attached", "Text"))
      ])
    ]);
    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.children[0].innerHTML, "Text");
    elm = patch(vnode1, vnode2).elm;
    assert.strictEqual(elm.children[0].innerHTML, "Text");
  });
  it("removes element at target", () => {
    const vnode1 = h("div", [
      h("div#wrapper", [
        h("div", "Some element"),
        attachTo(elm, h("div#attached", "First text"))
      ])
    ]);
    const vnode2 = h("div", [h("div#wrapper", [h("div", "Some element")])]);
    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.children[0].innerHTML, "First text");
    elm = patch(vnode1, vnode2).elm;
    assert.strictEqual(elm.children.length, 1);
  });
  it("remove hook receives real element", () => {
    const rm: RemoveHook = (vnode, cb) => {
      const elm = vnode.elm as HTMLDivElement;
      assert.strictEqual(elm.tagName, "DIV");
      assert.strictEqual(elm.innerHTML, "First text");
      cb();
    };
    const vnode1 = h("div", [
      h("div#wrapper", [
        h("div", "Some element"),
        attachTo(elm, h("div#attached", { hook: { remove: rm } }, "First text"))
      ])
    ]);
    const vnode2 = h("div", [h("div#wrapper", [h("div", "Some element")])]);
    elm = patch(vnode0, vnode1).elm;
    elm = patch(vnode1, vnode2).elm;
  });
});
