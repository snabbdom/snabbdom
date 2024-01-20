import { assert } from "@esm-bundle/chai";

import { init, h, thunk, VNode } from "../../src/index";

const patch = init([]);

describe("thunk", function () {
  let elm: any, vnode0: any;
  beforeEach(function () {
    elm = vnode0 = document.createElement("div");
  });
  it("returns vnode with selector and key function", function () {
    function numberInSpan(n: number) {
      return h("span", `Number is ${n}`);
    }
    const vnode = thunk("span", { key: "num" }, numberInSpan, [22]);
    assert.deepEqual(vnode.sel, "span");
    assert.deepEqual(vnode.data?.key, "num");
  });
  it("calls render function once on data change", function () {
    let called = 0;
    function numberInSpan(n: number) {
      called++;
      return h("span", { key: "num" }, `Number is ${n}`);
    }
    const vnode1 = h("div", [thunk("span", { key: "num" }, numberInSpan, [1])]);
    const vnode2 = h("div", [thunk("span", { key: "num" }, numberInSpan, [2])]);
    patch(vnode0, vnode1);
    assert.strictEqual(called, 1);
    patch(vnode1, vnode2);
    assert.strictEqual(called, 2);
  });
  it("does not call render function when data is unchanged", function () {
    let called = 0;
    function numberInSpan(n: number) {
      called++;
      return h("span", { key: "num" }, `Number is ${n}`);
    }
    const vnode1 = h("div", [thunk("span", { key: "num" }, numberInSpan, [1])]);
    const vnode2 = h("div", [thunk("span", { key: "num" }, numberInSpan, [1])]);
    patch(vnode0, vnode1);
    assert.strictEqual(called, 1);
    patch(vnode1, vnode2);
    assert.strictEqual(called, 1);
  });
  it("calls render function once on data-length change", function () {
    let called = 0;
    function numberInSpan(...ns: number[]) {
      called++;
      return h("span", { key: "num" }, `Length is ${ns.length}`);
    }
    const vnode1 = h("div", [thunk("span", { key: "num" }, numberInSpan, [1])]);
    const vnode2 = h("div", [
      thunk("span", { key: "num" }, numberInSpan, [1, 2])
    ]);
    patch(vnode0, vnode1);
    assert.strictEqual(called, 1);
    patch(vnode1, vnode2);
    assert.strictEqual(called, 2);
  });
  it("does not call render function on function change", function () {
    let called = 0;
    function numberInSpan(n: number) {
      called++;
      return h("span", { key: "num" }, `Number is ${n}`);
    }
    function numberInSpan2(n: number) {
      called++;
      return h("span", { key: "num" }, `Number really is ${n}`);
    }
    const vnode1 = h("div", [thunk("span", { key: "num" }, numberInSpan, [1])]);
    const vnode2 = h("div", [
      thunk("span", { key: "num" }, numberInSpan2, [1])
    ]);
    patch(vnode0, vnode1);
    assert.strictEqual(called, 1);
    patch(vnode1, vnode2);
    assert.strictEqual(called, 1);
  });
  it("renders correctly", function () {
    let called = 0;
    function sumInSpan(n: number, m: number) {
      called++;
      return h("span", { key: "num" }, `Sum is ${n + m}`);
    }
    const vnode1 = h("div", [thunk("span", { key: "num" }, sumInSpan, [1, 2])]);
    const vnode2 = h("div", [thunk("span", { key: "num" }, sumInSpan, [1, 2])]);
    const vnode3 = h("div", [thunk("span", { key: "num" }, sumInSpan, [2, 3])]);
    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.firstChild.tagName.toLowerCase(), "span");
    assert.strictEqual(elm.firstChild.innerHTML, "Sum is 3");
    elm = patch(vnode1, vnode2).elm;
    assert.strictEqual(elm.firstChild.tagName.toLowerCase(), "span");
    assert.strictEqual(elm.firstChild.innerHTML, "Sum is 3");
    elm = patch(vnode2, vnode3).elm;
    assert.strictEqual(elm.firstChild.tagName.toLowerCase(), "span");
    assert.strictEqual(elm.firstChild.innerHTML, "Sum is 5");
    assert.strictEqual(called, 2);
  });
  it("supports leaving out the `key` argument", function () {
    function vnodeFn(s: string) {
      return h("span.number", "Hello " + s);
    }
    const vnode1 = thunk("span.number", {}, vnodeFn, ["World!"]);
    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.innerText, "Hello World!");
  });
  it("renders correctly when root", function () {
    let called = 0;
    function numberInSpan(n: number) {
      called++;
      return h("span", { key: "num" }, `Number is ${n}`);
    }
    const vnode1 = thunk("span", { key: "num" }, numberInSpan, [1]);
    const vnode2 = thunk("span", { key: "num" }, numberInSpan, [1]);
    const vnode3 = thunk("span", { key: "num" }, numberInSpan, [2]);

    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.tagName.toLowerCase(), "span");
    assert.strictEqual(elm.innerHTML, "Number is 1");

    elm = patch(vnode1, vnode2).elm;
    assert.strictEqual(elm.tagName.toLowerCase(), "span");
    assert.strictEqual(elm.innerHTML, "Number is 1");

    elm = patch(vnode2, vnode3).elm;
    assert.strictEqual(elm.tagName.toLowerCase(), "span");
    assert.strictEqual(elm.innerHTML, "Number is 2");
    assert.strictEqual(called, 2);
  });
  it("can be replaced and removed", function () {
    function numberInSpan(n: number) {
      return h("span", { key: "num" }, `Number is ${n}`);
    }
    function oddEven(n: number): VNode {
      const prefix = n % 2 === 0 ? "Even" : "Odd";
      return h("div", { key: oddEven as any }, `${prefix}: ${n}`);
    }
    const vnode1 = h("div", [thunk("span", { key: "num" }, numberInSpan, [1])]);
    const vnode2 = h("div", [thunk("div", { key: "oddEven" }, oddEven, [4])]);

    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.firstChild.tagName.toLowerCase(), "span");
    assert.strictEqual(elm.firstChild.innerHTML, "Number is 1");

    elm = patch(vnode1, vnode2).elm;
    assert.strictEqual(elm.firstChild.tagName.toLowerCase(), "div");
    assert.strictEqual(elm.firstChild.innerHTML, "Even: 4");
  });
  it("can be replaced and removed when root", function () {
    function numberInSpan(n: number) {
      return h("span", { key: "num" }, `Number is ${n}`);
    }
    function oddEven(n: number): VNode {
      const prefix = n % 2 === 0 ? "Even" : "Odd";
      return h("div", { key: oddEven as any }, `${prefix}: ${n}`);
    }
    const vnode1 = thunk("span", { key: "num" }, numberInSpan, [1]);
    const vnode2 = thunk("div", { key: "oddEven" }, oddEven, [4]);

    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.tagName.toLowerCase(), "span");
    assert.strictEqual(elm.innerHTML, "Number is 1");

    elm = patch(vnode1, vnode2).elm;
    assert.strictEqual(elm.tagName.toLowerCase(), "div");
    assert.strictEqual(elm.innerHTML, "Even: 4");
  });
  it("invokes destroy hook on thunks", function () {
    let called = 0;
    function destroyHook() {
      called++;
    }
    function numberInSpan(n: number) {
      return h(
        "span",
        { key: "num", hook: { destroy: destroyHook } },
        `Number is ${n}`
      );
    }
    const vnode1 = h("div", [
      h("div", "Foo"),
      thunk("span", { key: "num" }, numberInSpan, [1]),
      h("div", "Foo")
    ]);
    const vnode2 = h("div", [h("div", "Foo"), h("div", "Foo")]);
    patch(vnode0, vnode1);
    patch(vnode1, vnode2);
    assert.strictEqual(called, 1);
  });
  it("invokes remove hook on thunks", function () {
    let called = 0;
    function hook() {
      called++;
    }
    function numberInSpan(n: number) {
      return h(
        "span",
        { key: "num", hook: { remove: hook } },
        `Number is ${n}`
      );
    }
    const vnode1 = h("div", [
      h("div", "Foo"),
      thunk("span", { key: "num" }, numberInSpan, [1]),
      h("div", "Foo")
    ]);
    const vnode2 = h("div", [h("div", "Foo"), h("div", "Foo")]);
    patch(vnode0, vnode1);
    patch(vnode1, vnode2);
    assert.strictEqual(called, 1);
  });
  it("causes type-error when argument list does not match function", function () {
    function view(name: string, year: number) {
      return h("span", { key: "num" }, `${name} was created in ${year}`);
    }
    thunk("div", {}, view, ["JavaScript", 1995]);
    // @ts-expect-error Too few arguments
    thunk("div", {}, view, ["JavaScript"]);
    // @ts-expect-error Too many arguments
    thunk("div", {}, view, ["JavaScript", 1995, 1996]);
    // @ts-expect-error Wrong type of arguments
    thunk("div", {}, view, ["JavaScript", "1995"]);
  });
  describe("custom equality comparison", function () {
    it("only calls render function when comparator indicates change", function () {
      let called = 0;
      function view(n: number, s: string) {
        called++;
        return h("span", {}, `number: ${Math.round(n)}, char: ${s[0]}`);
      }
      function comparator(pre: [number, string], cur: [number, string]) {
        const [n1, s1] = pre;
        const [n2, s2] = cur;
        return Math.round(n1) == Math.round(n2) && s1[0] === s2[0];
      }
      const vnode1 = h("div", [
        thunk("span", { comparator }, view, [1.1, "hello"])
      ]);
      const vnode2 = h("div", [
        thunk("span", { comparator }, view, [1.4, "hi"])
      ]);
      const vnode3 = h("div", [
        thunk("span", { comparator }, view, [1.6, "hi"])
      ]);
      const vnode4 = h("div", [
        thunk("span", { comparator }, view, [1.7, "hey"])
      ]);
      patch(vnode0, vnode1);
      assert.strictEqual(called, 1);
      patch(vnode1, vnode2);
      assert.strictEqual(called, 1);
      patch(vnode2, vnode3);
      assert.strictEqual(called, 2);
      patch(vnode3, vnode4);
      assert.strictEqual(called, 2);
    });
    it("does not invoke comparator when the number of arguments change", function () {
      let viewCalled = 0;
      function viewNumbers(...ns: number[]) {
        viewCalled++;
        return h("span", {}, `Numbers: ${ns.map((n) => Math.round(n)).join()}`);
      }
      let comparatorCalled = 0;
      function comparator(pre: number[], cur: number[]) {
        comparatorCalled++;
        return pre.every((n, i) => Math.round(n) === Math.round(cur[i]));
      }
      const vnode1 = h("div", [
        thunk("span", { comparator }, viewNumbers, [1.1, 1.2])
      ]);
      const vnode2 = h("div", [
        thunk("span", { comparator }, viewNumbers, [1.3, 1.4])
      ]);
      const vnode3 = h("div", [
        thunk("span", { comparator }, viewNumbers, [1.3, 1.4, 2])
      ]);
      const vnode4 = h("div", [
        thunk("span", { comparator }, viewNumbers, [1.3, 1.4, 2.6])
      ]);
      patch(vnode0, vnode1);
      assert.strictEqual(viewCalled, 1);
      assert.strictEqual(comparatorCalled, 0);
      patch(vnode1, vnode2);
      assert.strictEqual(viewCalled, 1);
      assert.strictEqual(comparatorCalled, 1);
      patch(vnode2, vnode3);
      assert.strictEqual(viewCalled, 2);
      assert.strictEqual(comparatorCalled, 1);
      patch(vnode3, vnode4);
      assert.strictEqual(viewCalled, 3);
      assert.strictEqual(comparatorCalled, 2);
    });
  });
});
