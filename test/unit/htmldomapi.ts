import { assert } from "@esm-bundle/chai";

import { init, h, attributesModule } from "../../src/index";

const patch = init([attributesModule]);

describe("svg", () => {
  let elm: any, vnode0: any;
  beforeEach(() => {
    elm = document.createElement("svg");
    vnode0 = elm;
  });

  it("removes child svg elements", () => {
    const a = h("svg", {}, [h("g"), h("g")]);
    const b = h("svg", {}, [h("g")]);
    const result = patch(patch(vnode0, a), b).elm as SVGElement;
    assert.strictEqual(result.childNodes.length, 1);
  });

  it("adds correctly xlink namespaced attribute", () => {
    const xlinkNS = "http://www.w3.org/1999/xlink";
    const testUrl = "/test";
    const a = h("svg", {}, [
      h(
        "use",
        {
          attrs: { "xlink:href": testUrl }
        },
        []
      )
    ]);

    const result = patch(vnode0, a).elm as SVGElement;
    assert.strictEqual(result.childNodes.length, 1);
    const child = result.childNodes[0] as SVGUseElement;
    assert.strictEqual(child.getAttribute("xlink:href"), testUrl);
    assert.strictEqual(child.getAttributeNS(xlinkNS, "href"), testUrl);
  });

  it("adds correctly xml namespaced attribute", () => {
    const xmlNS = "http://www.w3.org/XML/1998/namespace";
    const testAttrValue = "und";
    const a = h("svg", { attrs: { "xml:lang": testAttrValue } }, []);

    const result = patch(vnode0, a).elm as SVGElement;
    assert.strictEqual(result.getAttributeNS(xmlNS, "lang"), testAttrValue);
    assert.strictEqual(result.getAttribute("xml:lang"), testAttrValue);
  });
});
