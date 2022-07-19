import { assert } from "chai";

import { init, styleModule, h, toVNode } from "../../src/index";

const patch = init([styleModule]);

const featureDiscoveryElm = document.createElement("div");
featureDiscoveryElm.style.setProperty("--foo", "foo");
const hasCssVariables =
  featureDiscoveryElm.style.getPropertyValue("--foo") === "foo";

describe("style", function () {
  let elm: any, vnode0: any;
  beforeEach(function () {
    elm = document.createElement("div");
    vnode0 = elm;
  });
  it("is being styled", function () {
    elm = patch(
      vnode0,
      h("div", { style: { base: { fontSize: "12px" } } })
    ).elm;
    assert.strictEqual(elm.style.fontSize, "12px");
  });
  it("can be memoized", function () {
    const cachedStyles = { fontSize: "14px", display: "inline" };
    const vnode1 = h("i", { style: { base: cachedStyles } });
    const vnode2 = h("i", { style: { base: cachedStyles } });
    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.style.fontSize, "14px");
    assert.strictEqual(elm.style.display, "inline");
    elm = patch(vnode1, vnode2).elm;
    assert.strictEqual(elm.style.fontSize, "14px");
    assert.strictEqual(elm.style.display, "inline");
  });
  it("updates styles", function () {
    const vnode1 = h("i", {
      style: { base: { fontSize: "14px", display: "inline" } },
    });
    const vnode2 = h("i", {
      style: { base: { fontSize: "12px", display: "block" } },
    });
    const vnode3 = h("i", {
      style: { base: { fontSize: "10px", display: "block" } },
    });
    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.style.fontSize, "14px");
    assert.strictEqual(elm.style.display, "inline");
    elm = patch(vnode1, vnode2).elm;
    assert.strictEqual(elm.style.fontSize, "12px");
    assert.strictEqual(elm.style.display, "block");
    elm = patch(vnode2, vnode3).elm;
    assert.strictEqual(elm.style.fontSize, "10px");
    assert.strictEqual(elm.style.display, "block");
  });
  it("explicialy removes styles", function () {
    const vnode1 = h("i", { style: { base: { fontSize: "14px" } } });
    const vnode2 = h("i", { style: { base: { fontSize: "" } } });
    const vnode3 = h("i", { style: { base: { fontSize: "10px" } } });
    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.style.fontSize, "14px");
    patch(vnode1, vnode2);
    assert.strictEqual(elm.style.fontSize, "");
    patch(vnode2, vnode3);
    assert.strictEqual(elm.style.fontSize, "10px");
  });
  it("implicially removes styles from element", function () {
    const vnode1 = h("div", [
      h("i", { style: { base: { fontSize: "14px" } } }),
    ]);
    const vnode2 = h("div", [h("i")]);
    const vnode3 = h("div", [
      h("i", { style: { base: { fontSize: "10px" } } }),
    ]);
    patch(vnode0, vnode1);
    assert.strictEqual(elm.firstChild.style.fontSize, "14px");
    patch(vnode1, vnode2);
    assert.strictEqual(elm.firstChild.style.fontSize, "");
    patch(vnode2, vnode3);
    assert.strictEqual(elm.firstChild.style.fontSize, "10px");
  });
  it("updates css variables", function () {
    if (!hasCssVariables) {
      this.skip();
    } else {
      const vnode1 = h("div", { style: { base: { "--myVar": 1 } } });
      const vnode2 = h("div", { style: { base: { "--myVar": 2 } } });
      const vnode3 = h("div", { style: { base: { "--myVar": 3 } } });
      elm = patch(vnode0, vnode1).elm;
      assert.strictEqual(elm.style.getPropertyValue("--myVar"), "1");
      elm = patch(vnode1, vnode2).elm;
      assert.strictEqual(elm.style.getPropertyValue("--myVar"), "2");
      elm = patch(vnode2, vnode3).elm;
      assert.strictEqual(elm.style.getPropertyValue("--myVar"), "3");
    }
  });
  it("explicialy removes css variables", function () {
    if (!hasCssVariables) {
      this.skip();
    } else {
      const vnode1 = h("i", { style: { base: { "--myVar": 1 } } });
      const vnode2 = h("i", { style: { base: { "--myVar": "" } } });
      const vnode3 = h("i", { style: { base: { "--myVar": 2 } } });
      elm = patch(vnode0, vnode1).elm;
      assert.strictEqual(elm.style.getPropertyValue("--myVar"), "1");
      patch(vnode1, vnode2);
      assert.strictEqual(elm.style.getPropertyValue("--myVar"), "");
      patch(vnode2, vnode3);
      assert.strictEqual(elm.style.getPropertyValue("--myVar"), "2");
    }
  });
  it("implicially removes css variables from element", function () {
    if (!hasCssVariables) {
      this.skip();
    } else {
      const vnode1 = h("div", [h("i", { style: { base: { "--myVar": 1 } } })]);
      const vnode2 = h("div", [h("i")]);
      const vnode3 = h("div", [h("i", { style: { base: { "--myVar": 2 } } })]);
      patch(vnode0, vnode1);
      assert.strictEqual(elm.firstChild.style.getPropertyValue("--myVar"), "1");
      patch(vnode1, vnode2);
      assert.strictEqual(elm.firstChild.style.getPropertyValue("--myVar"), "");
      patch(vnode2, vnode3);
      assert.strictEqual(elm.firstChild.style.getPropertyValue("--myVar"), "2");
    }
  });
  describe("delayed", function () {
    it("updates delayed styles in next frame", function (done) {
      const vnode1 = h("i", {
        style: { base: { fontSize: "14px" }, delayed: { fontSize: "16px" } },
      });
      const vnode2 = h("i", {
        style: { base: { fontSize: "14px" }, delayed: { fontSize: "18px" } },
      });
      elm = patch(vnode0, vnode1).elm;
      assert.strictEqual(elm.style.fontSize, "14px");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          assert.strictEqual(elm.style.fontSize, "16px");
          elm = patch(vnode1, vnode2).elm;
          assert.strictEqual(elm.style.fontSize, "16px");
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              assert.strictEqual(elm.style.fontSize, "18px");
              done();
            });
          });
        });
      });
    });
    it("updates delayed styles in next frame when default styles also change", function (done) {
      const vnode1 = h("i", {
        style: { base: { fontSize: "14px" }, delayed: { fontSize: "16px" } },
      });
      const vnode2 = h("i", {
        style: { base: { fontSize: "18px" }, delayed: { fontSize: "20px" } },
      });
      elm = patch(vnode0, vnode1).elm;
      assert.strictEqual(elm.style.fontSize, "14px");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          assert.strictEqual(elm.style.fontSize, "16px");
          elm = patch(vnode1, vnode2).elm;
          assert.strictEqual(elm.style.fontSize, "18px");
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              assert.strictEqual(elm.style.fontSize, "20px");
              done();
            });
          });
        });
      });
    });
    it("handles multiple delayed style changes before next frame", function (done) {
      const vnode1 = h("i", {
        style: { base: { fontSize: "14px" }, delayed: { fontSize: "16px" } },
      });
      const vnode2 = h("i", {
        style: { base: { fontSize: "14px" }, delayed: { fontSize: "18px" } },
      });
      elm = patch(vnode0, vnode1).elm;
      elm = patch(vnode1, vnode2).elm;
      assert.strictEqual(elm.style.fontSize, "14px");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          assert.strictEqual(elm.style.fontSize, "18px");
          done();
        });
      });
    });
    it("handles delayed style change that gets removed before next frame", function (done) {
      const vnode1 = h("i", {
        style: { base: { fontSize: "14px" }, delayed: { fontSize: "16px" } },
      });
      const vnode2 = h("i", {
        style: { base: { fontSize: "14px" }, delayed: {} },
      });
      elm = patch(vnode0, vnode1).elm;
      elm = patch(vnode1, vnode2).elm;
      assert.strictEqual(elm.style.fontSize, "14px");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          assert.strictEqual(elm.style.fontSize, "14px");
          done();
        });
      });
    });
    it("applies base style immediately and reschedules delayed change", function (done) {
      const vnode1 = h("i", {
        style: { base: { fontSize: "14px" }, delayed: { fontSize: "16px" } },
      });
      const vnode2 = h("i", {
        style: { base: { fontSize: "18px" }, delayed: { fontSize: "16px" } },
      });
      elm = patch(vnode0, vnode1).elm;
      assert.strictEqual(elm.style.fontSize, "14px");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          assert.strictEqual(elm.style.fontSize, "16px");
          elm = patch(vnode1, vnode2).elm;
          assert.strictEqual(elm.style.fontSize, "18px");
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              assert.strictEqual(elm.style.fontSize, "16px");
              done();
            });
          });
        });
      });
    });
    it("reverts a delayed style synchronously", function (done) {
      const vnode1 = h("i", {
        style: { base: { fontSize: "14px" }, delayed: { fontSize: "16px" } },
      });
      const vnode2 = h("i", {
        style: { base: { fontSize: "14px" }, delayed: {} },
      });
      elm = patch(vnode0, vnode1).elm;
      assert.strictEqual(elm.style.fontSize, "14px");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          assert.strictEqual(elm.style.fontSize, "16px");
          elm = patch(vnode1, vnode2).elm;
          assert.strictEqual(elm.style.fontSize, "14px");
          done();
        });
      });
    });
    it("removes a delayed style synchronously", function (done) {
      const vnode1 = h("i", {
        style: { delayed: { fontSize: "16px" } },
      });
      const vnode2 = h("i", {
        style: { delayed: {} },
      });
      elm = patch(vnode0, vnode1).elm;
      assert.strictEqual(elm.style.fontSize, "");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          assert.strictEqual(elm.style.fontSize, "16px");
          elm = patch(vnode1, vnode2).elm;
          assert.strictEqual(elm.style.fontSize, "");
          done();
        });
      });
    });
  });
  it("applies tranform as transition on remove", function (done) {
    const btn = h(
      "button",
      {
        style: {
          base: {
            transition: "transform 0.1s",
          },
          remove: { transform: "translateY(100%)" },
        },
      },
      ["A button"]
    );
    const vnode1 = h("div.parent", {}, [btn]);
    const vnode2 = h("div.parent", {}, [null]);
    document.body.appendChild(vnode0);
    patch(vnode0, vnode1);
    patch(vnode1, vnode2);
    const button = document.querySelector("button") as HTMLButtonElement;
    assert.notStrictEqual(button, null);
    button.addEventListener("transitionend", function () {
      assert.strictEqual(document.querySelector("button"), null);
      done();
    });
  });
  describe("using toVNode()", function () {
    it("handles (ignoring) comment nodes", function () {
      const comment = document.createComment("yolo");
      const prevElm = document.createElement("div");
      prevElm.appendChild(comment);
      const nextVNode = h("div", [h("span", "Hi")]);
      elm = patch(toVNode(prevElm), nextVNode).elm;
      assert.strictEqual(elm, prevElm);
      assert.strictEqual(elm.tagName, "DIV");
      assert.strictEqual(elm.childNodes.length, 1);
      assert.strictEqual(elm.childNodes[0].tagName, "SPAN");
      assert.strictEqual(elm.childNodes[0].textContent, "Hi");
    });
  });
});
