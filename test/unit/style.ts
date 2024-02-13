import { assert } from "@esm-bundle/chai";

import { init, styleModule, h, toVNode } from "../../src/index";

const patch = init([styleModule]);

const featureDiscoveryElm = document.createElement("div");
featureDiscoveryElm.style.setProperty("--foo", "foo");
const hasCssVariables =
  featureDiscoveryElm.style.getPropertyValue("--foo") === "foo";

describe("style", () => {
  let elm: any, vnode0: any;
  beforeEach(() => {
    elm = document.createElement("div");
    vnode0 = elm;
  });
  it("is being styled", () => {
    elm = patch(vnode0, h("div", { style: { fontSize: "12px" } })).elm;
    assert.strictEqual(elm.style.fontSize, "12px");
  });
  it("can be memoized", () => {
    const cachedStyles = { fontSize: "14px", display: "inline" };
    const vnode1 = h("i", { style: cachedStyles });
    const vnode2 = h("i", { style: cachedStyles });
    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.style.fontSize, "14px");
    assert.strictEqual(elm.style.display, "inline");
    elm = patch(vnode1, vnode2).elm;
    assert.strictEqual(elm.style.fontSize, "14px");
    assert.strictEqual(elm.style.display, "inline");
  });
  it("updates styles", () => {
    const vnode1 = h("i", { style: { fontSize: "14px", display: "inline" } });
    const vnode2 = h("i", { style: { fontSize: "12px", display: "block" } });
    const vnode3 = h("i", { style: { fontSize: "10px", display: "block" } });
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
  it("explicialy removes styles", () => {
    const vnode1 = h("i", { style: { fontSize: "14px" } });
    const vnode2 = h("i", { style: { fontSize: "" } });
    const vnode3 = h("i", { style: { fontSize: "10px" } });
    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.style.fontSize, "14px");
    patch(vnode1, vnode2);
    assert.strictEqual(elm.style.fontSize, "");
    patch(vnode2, vnode3);
    assert.strictEqual(elm.style.fontSize, "10px");
  });
  it("handles falsy values", () => {
    const vnode1 = h("i", { style: { flexShrink: 0 as any } });
    const vnode2 = h("i", { style: { flexShrink: 0 as any } });
    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.style.flexShrink, "0");
    patch(vnode1, vnode2);
    assert.strictEqual(elm.style.flexShrink, "0");
  });
  it("implicially removes styles from element", () => {
    const vnode1 = h("div", [h("i", { style: { fontSize: "14px" } })]);
    const vnode2 = h("div", [h("i")]);
    const vnode3 = h("div", [h("i", { style: { fontSize: "10px" } })]);
    patch(vnode0, vnode1);
    assert.strictEqual(elm.firstChild.style.fontSize, "14px");
    patch(vnode1, vnode2);
    assert.strictEqual(elm.firstChild.style.fontSize, "");
    patch(vnode2, vnode3);
    assert.strictEqual(elm.firstChild.style.fontSize, "10px");
  });
  it("updates css variables", () => {
    if (!hasCssVariables) {
      this.skip();
    } else {
      const vnode1 = h("div", { style: { "--myVar": 1 as any } });
      const vnode2 = h("div", { style: { "--myVar": 2 as any } });
      const vnode3 = h("div", { style: { "--myVar": 3 as any } });
      elm = patch(vnode0, vnode1).elm;
      assert.strictEqual(elm.style.getPropertyValue("--myVar"), "1");
      elm = patch(vnode1, vnode2).elm;
      assert.strictEqual(elm.style.getPropertyValue("--myVar"), "2");
      elm = patch(vnode2, vnode3).elm;
      assert.strictEqual(elm.style.getPropertyValue("--myVar"), "3");
    }
  });
  it("explicialy removes css variables", () => {
    if (!hasCssVariables) {
      this.skip();
    } else {
      const vnode1 = h("i", { style: { "--myVar": 1 as any } });
      const vnode2 = h("i", { style: { "--myVar": "" } });
      const vnode3 = h("i", { style: { "--myVar": 2 as any } });
      elm = patch(vnode0, vnode1).elm;
      assert.strictEqual(elm.style.getPropertyValue("--myVar"), "1");
      patch(vnode1, vnode2);
      assert.strictEqual(elm.style.getPropertyValue("--myVar"), "");
      patch(vnode2, vnode3);
      assert.strictEqual(elm.style.getPropertyValue("--myVar"), "2");
    }
  });
  it("implicially removes css variables from element", () => {
    if (!hasCssVariables) {
      this.skip();
    } else {
      const vnode1 = h("div", [h("i", { style: { "--myVar": 1 as any } })]);
      const vnode2 = h("div", [h("i")]);
      const vnode3 = h("div", [h("i", { style: { "--myVar": 2 as any } })]);
      patch(vnode0, vnode1);
      assert.strictEqual(elm.firstChild.style.getPropertyValue("--myVar"), "1");
      patch(vnode1, vnode2);
      assert.strictEqual(elm.firstChild.style.getPropertyValue("--myVar"), "");
      patch(vnode2, vnode3);
      assert.strictEqual(elm.firstChild.style.getPropertyValue("--myVar"), "2");
    }
  });
  it("updates delayed styles in next frame", (done) => {
    const vnode1 = h("i", {
      style: { fontSize: "14px", delayed: { fontSize: "16px" } as any }
    });
    const vnode2 = h("i", {
      style: { fontSize: "18px", delayed: { fontSize: "20px" } as any }
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
  it("applies tranform as transition on remove", (done) => {
    const btn = h(
      "button",
      {
        style: {
          transition: "transform 0.1s",
          remove: { transform: "translateY(100%)" } as any
        }
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
    button.addEventListener("transitionend", () => {
      assert.strictEqual(document.querySelector("button"), null);
      done();
    });
  });
  describe("using toVNode()", () => {
    it("handles (ignoring) comment nodes", () => {
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
