import { assert } from "chai";

import { init, attributesModule, h } from "../../src/index";

const patch = init([attributesModule]);

describe("attributes", function () {
  let elm: any, vnode0: any;
  beforeEach(function () {
    elm = document.createElement("div");
    vnode0 = elm;
  });
  it("have their provided values", function () {
    const vnode1 = h("div", {
      attrs: { href: "/foo", minlength: 1, selected: true, disabled: false },
    });
    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.getAttribute("href"), "/foo");
    assert.strictEqual(elm.getAttribute("minlength"), "1");
    assert.strictEqual(elm.hasAttribute("selected"), true);
    assert.strictEqual(elm.getAttribute("selected"), "");
    assert.strictEqual(elm.hasAttribute("disabled"), false);
  });
  it("can be memoized", function () {
    const cachedAttrs = { href: "/foo", minlength: 1, selected: true };
    const vnode1 = h("div", { attrs: cachedAttrs });
    const vnode2 = h("div", { attrs: cachedAttrs });
    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.getAttribute("href"), "/foo");
    assert.strictEqual(elm.getAttribute("minlength"), "1");
    assert.strictEqual(elm.getAttribute("selected"), "");
    elm = patch(vnode1, vnode2).elm;
    assert.strictEqual(elm.getAttribute("href"), "/foo");
    assert.strictEqual(elm.getAttribute("minlength"), "1");
    assert.strictEqual(elm.getAttribute("selected"), "");
  });
  it("are not omitted when falsy values are provided", function () {
    const vnode1 = h("div", {
      attrs: { href: null as any, minlength: 0, value: "", title: "undefined" },
    });
    elm = patch(vnode0, vnode1).elm;
    assert.ok(elm.hasAttribute("href"));
    assert.ok(elm.hasAttribute("minlength"));
    assert.ok(elm.hasAttribute("value"));
    assert.ok(elm.hasAttribute("title"));
  });
  it("are set correctly when namespaced", function () {
    const vnode1 = h("div", { attrs: { "xlink:href": "#foo" } });
    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(
      elm.getAttributeNS("http://www.w3.org/1999/xlink", "href"),
      "#foo"
    );
  });
  it("should not touch class nor id fields", function () {
    elm = document.createElement("div");
    elm.id = "myId";
    elm.className = "myClass";
    vnode0 = elm;
    const vnode1 = h("div#myId.myClass", { attrs: {} }, ["Hello"]);
    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.tagName, "DIV");
    assert.strictEqual(elm.id, "myId");
    assert.strictEqual(elm.className, "myClass");
    assert.strictEqual(elm.textContent, "Hello");
  });
  describe("boolean attribute", function () {
    it("is present and empty string if the value is truthy", function () {
      const vnode1 = h("div", {
        attrs: { required: true, readonly: 1, noresize: "truthy" },
      });
      elm = patch(vnode0, vnode1).elm;
      assert.strictEqual(elm.hasAttribute("required"), true);
      assert.strictEqual(elm.getAttribute("required"), "");
      assert.strictEqual(elm.hasAttribute("readonly"), true);
      assert.strictEqual(elm.getAttribute("readonly"), "1");
      assert.strictEqual(elm.hasAttribute("noresize"), true);
      assert.strictEqual(elm.getAttribute("noresize"), "truthy");
    });
    it("is omitted if the value is false", function () {
      const vnode1 = h("div", { attrs: { required: false } });
      elm = patch(vnode0, vnode1).elm;
      assert.strictEqual(elm.hasAttribute("required"), false);
      assert.strictEqual(elm.getAttribute("required"), null);
    });
    it("is not omitted if the value is falsy", function () {
      const vnode1 = h("div", {
        attrs: { readonly: 0, noresize: null as any },
      });
      elm = patch(vnode0, vnode1).elm;
      assert.ok(elm.hasAttribute("readonly"));
      assert.ok(elm.hasAttribute("noresize"));
    });
  });
  describe("Object.prototype property", function () {
    it("is not considered as a boolean attribute and shouldn't be omitted", function () {
      const vnode1 = h("div", { attrs: { constructor: true } });
      elm = patch(vnode0, vnode1).elm;
      assert.strictEqual(elm.hasAttribute("constructor"), true);
      assert.strictEqual(elm.getAttribute("constructor"), "");
      const vnode2 = h("div", { attrs: { constructor: false } });
      elm = patch(vnode0, vnode2).elm;
      assert.strictEqual(elm.hasAttribute("constructor"), false);
    });
  });
});
