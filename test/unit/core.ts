import { assert } from "chai";
import shuffle from "lodash.shuffle";

import {
  init,
  classModule,
  propsModule,
  styleModule,
  eventListenersModule,
  h,
  toVNode,
  vnode,
  VNode,
  htmlDomApi,
  CreateHook,
  InsertHook,
  PrePatchHook,
  RemoveHook,
  InitHook,
  DestroyHook,
  UpdateHook,
  Key,
  fragment,
} from "../../src/index";

const hasSvgClassList = "classList" in SVGElement.prototype;

const patch = init(
  [classModule, propsModule, eventListenersModule],
  undefined,
  { experimental: { fragments: true } }
);

function prop<T>(name: string) {
  return function (obj: { [index: string]: T }) {
    return obj[name];
  };
}

function map(fn: any, list: any[]) {
  const ret = [];
  for (let i = 0; i < list.length; ++i) {
    ret[i] = fn(list[i]);
  }
  return ret;
}

const inner = prop("innerHTML");

describe("snabbdom", function () {
  let elm: any, vnode0: any;
  beforeEach(function () {
    elm = document.createElement("div");
    vnode0 = elm;
  });

  describe("hyperscript", function () {
    it("can create vnode with proper tag", function () {
      assert.strictEqual(h("div").sel, "div");
      assert.strictEqual(h("a").sel, "a");
    });
    it("can create vnode with children", function () {
      const vnode = h("div", [h("span#hello"), h("b.world")]);
      assert.strictEqual(vnode.sel, "div");
      const children = vnode.children as [VNode, VNode];
      assert.strictEqual(children[0].sel, "span#hello");
      assert.strictEqual(children[1].sel, "b.world");
    });
    it("can create vnode with one child vnode", function () {
      const vnode = h("div", h("span#hello"));
      assert.strictEqual(vnode.sel, "div");
      const children = vnode.children as [VNode];
      assert.strictEqual(children[0].sel, "span#hello");
    });
    it("can create vnode with props and one child vnode", function () {
      const vnode = h("div", {}, h("span#hello"));
      assert.strictEqual(vnode.sel, "div");
      const children = vnode.children as [VNode];
      assert.strictEqual(children[0].sel, "span#hello");
    });
    it("can create vnode with text content", function () {
      const vnode = h("a", ["I am a string"]);
      const children = vnode.children as [VNode];
      assert.strictEqual(children[0].text, "I am a string");
    });
    it("can create vnode with text content in string", function () {
      const vnode = h("a", "I am a string");
      assert.strictEqual(vnode.text, "I am a string");
    });
    it("can create vnode with props and text content in string", function () {
      const vnode = h("a", {}, "I am a string");
      assert.strictEqual(vnode.text, "I am a string");
    });
    it("can create vnode with String obj content", function () {
      const vnode = h("a", new String("b"));
      assert.equal(vnode.text, "b");
    });
    it("can create vnode with props and String obj content", function () {
      const vnode = h("a", {}, new String("b"));
      assert.equal(vnode.text, "b");
    });
    it("can create vnode with Number obj content", function () {
      const vnode = h("a", new Number(1));
      assert.equal(vnode.text, "1");
    });
    it("can create vnode with null props", function () {
      let vnode = h("a", null);
      assert.deepEqual(vnode.data, {});
      vnode = h("a", null, ["I am a string"]);
      const children = vnode.children as [VNode];
      assert.strictEqual(children[0].text, "I am a string");
    });
    it("can create vnode for comment", function () {
      const vnode = h("!", "test");
      assert.strictEqual(vnode.sel, "!");
      assert.strictEqual(vnode.text, "test");
    });
  });
  describe("created element", function () {
    it("has tag", function () {
      elm = patch(vnode0, h("div")).elm;
      assert.strictEqual(elm.tagName, "DIV");
    });
    it("has different tag and id", function () {
      const elm = document.createElement("div");
      vnode0.appendChild(elm);
      const vnode1 = h("span#id");
      const patched = patch(elm, vnode1).elm as HTMLSpanElement;
      assert.strictEqual(patched.tagName, "SPAN");
      assert.strictEqual(patched.id, "id");
    });
    it("has id", function () {
      elm = patch(vnode0, h("div", [h("div#unique")])).elm;
      assert.strictEqual(elm.firstChild.id, "unique");
    });
    it("has correct namespace", function () {
      const SVGNamespace = "http://www.w3.org/2000/svg";
      const XHTMLNamespace = "http://www.w3.org/1999/xhtml";

      elm = patch(vnode0, h("div", [h("div", { ns: SVGNamespace })])).elm;
      assert.strictEqual(elm.firstChild.namespaceURI, SVGNamespace);

      // verify that svg tag automatically gets svg namespace
      elm = patch(
        vnode0,
        h("svg", [
          h("foreignObject", [h("div", ["I am HTML embedded in SVG"])]),
        ])
      ).elm;
      assert.strictEqual(elm.namespaceURI, SVGNamespace);
      assert.strictEqual(elm.firstChild.namespaceURI, SVGNamespace);
      assert.strictEqual(
        elm.firstChild.firstChild.namespaceURI,
        XHTMLNamespace
      );

      // verify that svg tag with extra selectors gets svg namespace
      elm = patch(vnode0, h("svg#some-id")).elm;
      assert.strictEqual(elm.namespaceURI, SVGNamespace);

      // verify that non-svg tag beginning with 'svg' does NOT get namespace
      elm = patch(vnode0, h("svg-custom-el")).elm;
      assert.notStrictEqual(elm.namespaceURI, SVGNamespace);
    });
    it("receives classes in selector", function () {
      elm = patch(vnode0, h("div", [h("i.am.a.class")])).elm;
      assert(elm.firstChild.classList.contains("am"));
      assert(elm.firstChild.classList.contains("a"));
      assert(elm.firstChild.classList.contains("class"));
    });
    it("receives classes in class property", function () {
      elm = patch(
        vnode0,
        h("i", { class: { am: true, a: true, class: true, not: false } })
      ).elm;
      assert(elm.classList.contains("am"));
      assert(elm.classList.contains("a"));
      assert(elm.classList.contains("class"));
      assert(!elm.classList.contains("not"));
    });
    it("receives classes in selector when namespaced", function () {
      if (!hasSvgClassList) {
        this.skip();
      } else {
        elm = patch(vnode0, h("svg", [h("g.am.a.class.too")])).elm;
        assert(elm.firstChild.classList.contains("am"));
        assert(elm.firstChild.classList.contains("a"));
        assert(elm.firstChild.classList.contains("class"));
      }
    });
    it("receives classes in class property when namespaced", function () {
      if (!hasSvgClassList) {
        this.skip();
      } else {
        elm = patch(
          vnode0,
          h("svg", [
            h("g", {
              class: { am: true, a: true, class: true, not: false, too: true },
            }),
          ])
        ).elm;
        assert(elm.firstChild.classList.contains("am"));
        assert(elm.firstChild.classList.contains("a"));
        assert(elm.firstChild.classList.contains("class"));
        assert(!elm.firstChild.classList.contains("not"));
      }
    });
    it("handles classes from both selector and property", function () {
      elm = patch(
        vnode0,
        h("div", [h("i.has", { class: { classes: true } })])
      ).elm;
      assert(elm.firstChild.classList.contains("has"), "has `has` class");
      assert(
        elm.firstChild.classList.contains("classes"),
        "has `classes` class"
      );
    });
    it("can create elements with text content", function () {
      elm = patch(vnode0, h("div", ["I am a string"])).elm;
      assert.strictEqual(elm.innerHTML, "I am a string");
    });
    it("can create elements with span and text content", function () {
      elm = patch(vnode0, h("a", [h("span"), "I am a string"])).elm;
      assert.strictEqual(elm.childNodes[0].tagName, "SPAN");
      assert.strictEqual(elm.childNodes[1].textContent, "I am a string");
    });
    it("can create vnode with array String obj content", function () {
      elm = patch(vnode0, h("a", ["b", new String("c")])).elm;
      assert.strictEqual(elm.innerHTML, "bc");
    });
    it("can create elements with props", function () {
      elm = patch(vnode0, h("a", { props: { src: "http://localhost/" } })).elm;
      assert.strictEqual(elm.src, "http://localhost/");
    });
    it("can create an element created inside an iframe", function (done) {
      // Only run if srcdoc is supported.
      const frame = document.createElement("iframe");
      if (typeof frame.srcdoc !== "undefined") {
        frame.srcdoc = "<div>Thing 1</div>";
        frame.onload = function () {
          const div0 = frame.contentDocument!.body.querySelector(
            "div"
          ) as HTMLDivElement;
          patch(div0, h("div", "Thing 2"));
          const div1 = frame.contentDocument!.body.querySelector(
            "div"
          ) as HTMLDivElement;
          assert.strictEqual(div1.textContent, "Thing 2");
          frame.remove();
          done();
        };
        document.body.appendChild(frame);
      } else {
        done();
      }
    });
    it("is a patch of the root element", function () {
      const elmWithIdAndClass = document.createElement("div");
      elmWithIdAndClass.id = "id";
      elmWithIdAndClass.className = "class";
      const vnode1 = h("div#id.class", [h("span", "Hi")]);
      elm = patch(elmWithIdAndClass, vnode1).elm;
      assert.strictEqual(elm, elmWithIdAndClass);
      assert.strictEqual(elm.tagName, "DIV");
      assert.strictEqual(elm.id, "id");
      assert.strictEqual(elm.className, "class");
    });
    it("can create comments", function () {
      elm = patch(vnode0, h("!", "test")).elm;
      assert.strictEqual(elm.nodeType, document.COMMENT_NODE);
      assert.strictEqual(elm.textContent, "test");
    });
  });
  describe("created document fragment", function () {
    it("is an instance of DocumentFragment", function () {
      const vnode1 = fragment(["I am", h("span", [" a", " fragment"])]);

      elm = patch(vnode0, vnode1).elm;
      assert.strictEqual(elm.nodeType, document.DOCUMENT_FRAGMENT_NODE);
      assert.strictEqual(elm.textContent, "I am a fragment");
    });
  });
  describe("patching an element", function () {
    it("changes the elements classes", function () {
      const vnode1 = h("i", { class: { i: true, am: true, horse: true } });
      const vnode2 = h("i", { class: { i: true, am: true, horse: false } });
      patch(vnode0, vnode1);
      elm = patch(vnode1, vnode2).elm;
      assert(elm.classList.contains("i"));
      assert(elm.classList.contains("am"));
      assert(!elm.classList.contains("horse"));
    });
    it("changes classes in selector", function () {
      const vnode1 = h("i", { class: { i: true, am: true, horse: true } });
      const vnode2 = h("i", { class: { i: true, am: true, horse: false } });
      patch(vnode0, vnode1);
      elm = patch(vnode1, vnode2).elm;
      assert(elm.classList.contains("i"));
      assert(elm.classList.contains("am"));
      assert(!elm.classList.contains("horse"));
    });
    it("preserves memoized classes", function () {
      const cachedClass = { i: true, am: true, horse: false };
      const vnode1 = h("i", { class: cachedClass });
      const vnode2 = h("i", { class: cachedClass });
      elm = patch(vnode0, vnode1).elm;
      assert(elm.classList.contains("i"));
      assert(elm.classList.contains("am"));
      assert(!elm.classList.contains("horse"));
      elm = patch(vnode1, vnode2).elm;
      assert(elm.classList.contains("i"));
      assert(elm.classList.contains("am"));
      assert(!elm.classList.contains("horse"));
    });
    it("removes missing classes", function () {
      const vnode1 = h("i", { class: { i: true, am: true, horse: true } });
      const vnode2 = h("i", { class: { i: true, am: true } });
      patch(vnode0, vnode1);
      elm = patch(vnode1, vnode2).elm;
      assert(elm.classList.contains("i"));
      assert(elm.classList.contains("am"));
      assert(!elm.classList.contains("horse"));
    });
    it("changes an elements props", function () {
      const vnode1 = h("a", { props: { src: "http://other/" } });
      const vnode2 = h("a", { props: { src: "http://localhost/" } });
      patch(vnode0, vnode1);
      elm = patch(vnode1, vnode2).elm;
      assert.strictEqual(elm.src, "http://localhost/");
    });
    it("can set prop value to `0`", function () {
      const patch = init([propsModule, styleModule]);
      const view = (scrollTop: number) =>
        h(
          "div",
          {
            style: { height: "100px", overflowY: "scroll" },
            props: { scrollTop },
          },
          [h("div", { style: { height: "200px" } })]
        );
      const vnode1 = view(0);
      const mountPoint = document.body.appendChild(
        document.createElement("div")
      );
      const { elm } = patch(mountPoint, vnode1);
      if (!(elm instanceof HTMLDivElement)) throw new Error();
      assert.strictEqual(elm.scrollTop, 0);
      const vnode2 = view(20);
      patch(vnode1, vnode2);
      assert.isAtLeast(elm.scrollTop, 18);
      assert.isAtMost(elm.scrollTop, 20);
      const vnode3 = view(0);
      patch(vnode2, vnode3);
      assert.strictEqual(elm.scrollTop, 0);
      document.body.removeChild(mountPoint);
    });
    it("can set prop value to empty string", function () {
      const vnode1 = h("p", { props: { textContent: "foo" } });
      const { elm } = patch(vnode0, vnode1);
      if (!(elm instanceof HTMLParagraphElement)) throw new Error();
      assert.strictEqual(elm.textContent, "foo");
      const vnode2 = h("p", { props: { textContent: "" } });
      patch(vnode1, vnode2);
      assert.strictEqual(elm.textContent, "");
    });
    it("preserves memoized props", function () {
      const cachedProps = { src: "http://other/" };
      const vnode1 = h("a", { props: cachedProps });
      const vnode2 = h("a", { props: cachedProps });
      elm = patch(vnode0, vnode1).elm;
      assert.strictEqual(elm.src, "http://other/");
      elm = patch(vnode1, vnode2).elm;
      assert.strictEqual(elm.src, "http://other/");
    });
    it("removes custom props", function () {
      const vnode1 = h("a", { props: { src: "http://other/" } });
      const vnode2 = h("a");
      patch(vnode0, vnode1);
      patch(vnode1, vnode2);
      assert.strictEqual(elm.src, undefined);
    });
    it("cannot remove native props", function () {
      const vnode1 = h("a", { props: { href: "http://example.com/" } });
      const vnode2 = h("a");
      const { elm: elm1 } = patch(vnode0, vnode1);
      if (!(elm1 instanceof HTMLAnchorElement)) throw new Error();
      assert.strictEqual(elm1.href, "http://example.com/");
      const { elm: elm2 } = patch(vnode1, vnode2);
      if (!(elm2 instanceof HTMLAnchorElement)) throw new Error();
      assert.strictEqual(elm2.href, "http://example.com/");
    });
    it("does not delete custom props", function () {
      const vnode1 = h("p", { props: { a: "foo" } });
      const vnode2 = h("p");
      const { elm } = patch(vnode0, vnode1);
      if (!(elm instanceof HTMLParagraphElement)) throw new Error();
      assert.strictEqual((elm as any).a, "foo");
      patch(vnode1, vnode2);
      assert.strictEqual((elm as any).a, "foo");
    });
    describe("custom elements", function () {
      if ("customElements" in window) {
        describe("customized built-in element", function () {
          const isSafari = /^((?!chrome|android).)*safari/i.test(
            navigator.userAgent
          );

          if (!isSafari) {
            class A extends HTMLParagraphElement {}
            class B extends HTMLParagraphElement {}

            before(function () {
              if ("customElements" in window) {
                customElements.define("p-a", A, { extends: "p" });
                customElements.define("p-b", B, { extends: "p" });
              }
            });
            it("can create custom elements", function () {
              if ("customElements" in window) {
                const vnode1 = h("p", { is: "p-a" });
                elm = patch(vnode0, vnode1).elm;
                assert(elm instanceof A);
              } else {
                this.skip();
              }
            });
            it("handles changing is attribute", function () {
              const vnode1 = h("p", { is: "p-a" });
              const vnode2 = h("p", { is: "p-b" });

              elm = patch(vnode0, vnode1).elm;
              assert(elm instanceof A);
              elm = patch(vnode1, vnode2).elm;
              assert(elm instanceof B);
            });
          } else {
            it.skip("safari does not support customized built-in elements", () => {
              assert(false);
            });
          }
        });
      } else {
        it.skip("browser does not support custom elements", () => {
          assert(false);
        });
      }
    });
    describe("using toVNode()", function () {
      it("can remove previous children of the root element", function () {
        const h2 = document.createElement("h2");
        h2.textContent = "Hello";
        const prevElm = document.createElement("div");
        prevElm.id = "id";
        prevElm.className = "class";
        prevElm.appendChild(h2);
        const nextVNode = h("div#id.class", [h("span", "Hi")]);
        elm = patch(toVNode(prevElm), nextVNode).elm;
        assert.strictEqual(elm, prevElm);
        assert.strictEqual(elm.tagName, "DIV");
        assert.strictEqual(elm.id, "id");
        assert.strictEqual(elm.className, "class");
        assert.strictEqual(elm.childNodes.length, 1);
        assert.strictEqual(elm.childNodes[0].tagName, "SPAN");
        assert.strictEqual(elm.childNodes[0].textContent, "Hi");
      });
      it("can support patching in a DocumentFragment", function () {
        const prevElm = document.createDocumentFragment();
        const nextVNode = vnode(
          "",
          {},
          [h("div#id.class", [h("span", "Hi")])],
          undefined,
          prevElm as any
        );
        elm = patch(toVNode(prevElm), nextVNode).elm;
        assert.strictEqual(elm, prevElm);
        assert.strictEqual(elm.nodeType, 11);
        assert.strictEqual(elm.childNodes.length, 1);
        assert.strictEqual(elm.childNodes[0].tagName, "DIV");
        assert.strictEqual(elm.childNodes[0].id, "id");
        assert.strictEqual(elm.childNodes[0].className, "class");
        assert.strictEqual(elm.childNodes[0].childNodes.length, 1);
        assert.strictEqual(elm.childNodes[0].childNodes[0].tagName, "SPAN");
        assert.strictEqual(elm.childNodes[0].childNodes[0].textContent, "Hi");
      });
      it("can remove some children of the root element", function () {
        const h2 = document.createElement("h2");
        h2.textContent = "Hello";
        const prevElm = document.createElement("div");
        prevElm.id = "id";
        prevElm.className = "class";
        const text = document.createTextNode("Foobar");
        const reference = {};
        (text as any).testProperty = reference; // ensures we dont recreate the Text Node
        prevElm.appendChild(text);
        prevElm.appendChild(h2);
        const nextVNode = h("div#id.class", ["Foobar"]);
        elm = patch(toVNode(prevElm), nextVNode).elm;
        assert.strictEqual(elm, prevElm);
        assert.strictEqual(elm.tagName, "DIV");
        assert.strictEqual(elm.id, "id");
        assert.strictEqual(elm.className, "class");
        assert.strictEqual(elm.childNodes.length, 1);
        assert.strictEqual(elm.childNodes[0].nodeType, 3);
        assert.strictEqual(elm.childNodes[0].wholeText, "Foobar");
        assert.strictEqual(elm.childNodes[0].testProperty, reference);
      });
      it("can remove text elements", function () {
        const h2 = document.createElement("h2");
        h2.textContent = "Hello";
        const prevElm = document.createElement("div");
        prevElm.id = "id";
        prevElm.className = "class";
        const text = document.createTextNode("Foobar");
        prevElm.appendChild(text);
        prevElm.appendChild(h2);
        const nextVNode = h("div#id.class", [h("h2", "Hello")]);
        elm = patch(toVNode(prevElm), nextVNode).elm;
        assert.strictEqual(elm, prevElm);
        assert.strictEqual(elm.tagName, "DIV");
        assert.strictEqual(elm.id, "id");
        assert.strictEqual(elm.className, "class");
        assert.strictEqual(elm.childNodes.length, 1);
        assert.strictEqual(elm.childNodes[0].nodeType, 1);
        assert.strictEqual(elm.childNodes[0].textContent, "Hello");
      });
      it("can work with domApi", function () {
        const domApi = {
          ...htmlDomApi,
          tagName: function (elm: Element) {
            return "x-" + elm.tagName.toUpperCase();
          },
        };
        const h2 = document.createElement("h2");
        h2.id = "hx";
        h2.setAttribute("data-env", "xyz");
        const text = document.createTextNode("Foobar");
        const elm = document.createElement("div");
        elm.id = "id";
        elm.className = "class other";
        elm.setAttribute("data", "value");
        elm.appendChild(h2);
        elm.appendChild(text);
        const vnode = toVNode(elm, domApi);
        assert.strictEqual(vnode.sel, "x-div#id.class.other");
        assert.deepEqual(vnode.data, { attrs: { data: "value" } });
        const children = vnode.children as [VNode, VNode];
        assert.strictEqual(children[0].sel, "x-h2#hx");
        assert.deepEqual(children[0].data, { dataset: { env: "xyz" } });
        assert.strictEqual(children[1].text, "Foobar");
      });

      it("can parsing dataset and attrs", function () {
        const onlyAttrs = document.createElement("div");
        onlyAttrs.setAttribute("foo", "bar");
        assert.deepEqual(toVNode(onlyAttrs).data, { attrs: { foo: "bar" } });
        const onlyDataset = document.createElement("div");
        onlyDataset.setAttribute("data-foo", "bar");
        assert.deepEqual(toVNode(onlyDataset).data, {
          dataset: { foo: "bar" },
        });
        const onlyDatasets2 = document.createElement("div");
        onlyDatasets2.dataset.foo = "bar";
        assert.deepEqual(toVNode(onlyDatasets2).data, {
          dataset: { foo: "bar" },
        });
        const bothAttrsAndDatasets = document.createElement("div");
        bothAttrsAndDatasets.setAttribute("foo", "bar");
        bothAttrsAndDatasets.setAttribute("data-foo", "bar");
        bothAttrsAndDatasets.dataset.again = "again";
        assert.deepEqual(toVNode(bothAttrsAndDatasets).data, {
          attrs: { foo: "bar" },
          dataset: { foo: "bar", again: "again" },
        });
      });
    });
    describe("updating children with keys", function () {
      function spanNum(n?: null | Key) {
        if (n == null) {
          return n;
        } else if (typeof n === "string") {
          return h("span", {}, n);
        } else if (typeof n === "number") {
          return h("span", { key: n }, n.toString());
        } else {
          return h("span", { key: n }, "symbol");
        }
      }
      describe("addition of elements", function () {
        it("appends elements", function () {
          const vnode1 = h("span", [1].map(spanNum));
          const vnode2 = h("span", [1, 2, 3].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          assert.strictEqual(elm.children.length, 1);
          elm = patch(vnode1, vnode2).elm;
          assert.strictEqual(elm.children.length, 3);
          assert.strictEqual(elm.children[1].innerHTML, "2");
          assert.strictEqual(elm.children[2].innerHTML, "3");
        });
        it("prepends elements", function () {
          const vnode1 = h("span", [4, 5].map(spanNum));
          const vnode2 = h("span", [1, 2, 3, 4, 5].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          assert.strictEqual(elm.children.length, 2);
          elm = patch(vnode1, vnode2).elm;
          assert.deepEqual(map(inner, elm.children), ["1", "2", "3", "4", "5"]);
        });
        it("add elements in the middle", function () {
          const vnode1 = h("span", [1, 2, 4, 5].map(spanNum));
          const vnode2 = h("span", [1, 2, 3, 4, 5].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          assert.strictEqual(elm.children.length, 4);
          assert.strictEqual(elm.children.length, 4);
          elm = patch(vnode1, vnode2).elm;
          assert.deepEqual(map(inner, elm.children), ["1", "2", "3", "4", "5"]);
        });
        it("add elements at begin and end", function () {
          const vnode1 = h("span", [2, 3, 4].map(spanNum));
          const vnode2 = h("span", [1, 2, 3, 4, 5].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          assert.strictEqual(elm.children.length, 3);
          elm = patch(vnode1, vnode2).elm;
          assert.deepEqual(map(inner, elm.children), ["1", "2", "3", "4", "5"]);
        });
        it("adds children to parent with no children", function () {
          const vnode1 = h("span", { key: "span" });
          const vnode2 = h("span", { key: "span" }, [1, 2, 3].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          assert.strictEqual(elm.children.length, 0);
          elm = patch(vnode1, vnode2).elm;
          assert.deepEqual(map(inner, elm.children), ["1", "2", "3"]);
        });
        it("removes all children from parent", function () {
          const vnode1 = h("span", { key: "span" }, [1, 2, 3].map(spanNum));
          const vnode2 = h("span", { key: "span" });
          elm = patch(vnode0, vnode1).elm;
          assert.deepEqual(map(inner, elm.children), ["1", "2", "3"]);
          elm = patch(vnode1, vnode2).elm;
          assert.strictEqual(elm.children.length, 0);
        });
        it("update one child with same key but different sel", function () {
          const vnode1 = h("span", { key: "span" }, [1, 2, 3].map(spanNum));
          const vnode2 = h("span", { key: "span" }, [
            spanNum(1),
            h("i", { key: 2 }, "2"),
            spanNum(3),
          ]);
          elm = patch(vnode0, vnode1).elm;
          assert.deepEqual(map(inner, elm.children), ["1", "2", "3"]);
          elm = patch(vnode1, vnode2).elm;
          assert.deepEqual(map(inner, elm.children), ["1", "2", "3"]);
          assert.strictEqual(elm.children.length, 3);
          assert.strictEqual(elm.children[1].tagName, "I");
        });
      });
      describe("removal of elements", function () {
        it("removes elements from the beginning", function () {
          const vnode1 = h("span", [1, 2, 3, 4, 5].map(spanNum));
          const vnode2 = h("span", [3, 4, 5].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          assert.strictEqual(elm.children.length, 5);
          elm = patch(vnode1, vnode2).elm;
          assert.deepEqual(map(inner, elm.children), ["3", "4", "5"]);
        });
        it("removes elements from the end", function () {
          const vnode1 = h("span", [1, 2, 3, 4, 5].map(spanNum));
          const vnode2 = h("span", [1, 2, 3].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          assert.strictEqual(elm.children.length, 5);
          elm = patch(vnode1, vnode2).elm;
          assert.strictEqual(elm.children.length, 3);
          assert.strictEqual(elm.children[0].innerHTML, "1");
          assert.strictEqual(elm.children[1].innerHTML, "2");
          assert.strictEqual(elm.children[2].innerHTML, "3");
        });
        it("removes elements from the middle", function () {
          const vnode1 = h("span", [1, 2, 3, 4, 5].map(spanNum));
          const vnode2 = h("span", [1, 2, 4, 5].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          assert.strictEqual(elm.children.length, 5);
          elm = patch(vnode1, vnode2).elm;
          assert.strictEqual(elm.children.length, 4);
          assert.deepEqual(elm.children[0].innerHTML, "1");
          assert.strictEqual(elm.children[0].innerHTML, "1");
          assert.strictEqual(elm.children[1].innerHTML, "2");
          assert.strictEqual(elm.children[2].innerHTML, "4");
          assert.strictEqual(elm.children[3].innerHTML, "5");
        });
      });
      describe("element reordering", function () {
        it("moves element forward", function () {
          const vnode1 = h("span", [1, 2, 3, 4].map(spanNum));
          const vnode2 = h("span", [2, 3, 1, 4].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          assert.strictEqual(elm.children.length, 4);
          elm = patch(vnode1, vnode2).elm;
          assert.strictEqual(elm.children.length, 4);
          assert.strictEqual(elm.children[0].innerHTML, "2");
          assert.strictEqual(elm.children[1].innerHTML, "3");
          assert.strictEqual(elm.children[2].innerHTML, "1");
          assert.strictEqual(elm.children[3].innerHTML, "4");
        });
        it("moves element to end", function () {
          const vnode1 = h("span", [1, 2, 3].map(spanNum));
          const vnode2 = h("span", [2, 3, 1].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          assert.strictEqual(elm.children.length, 3);
          elm = patch(vnode1, vnode2).elm;
          assert.strictEqual(elm.children.length, 3);
          assert.strictEqual(elm.children[0].innerHTML, "2");
          assert.strictEqual(elm.children[1].innerHTML, "3");
          assert.strictEqual(elm.children[2].innerHTML, "1");
        });
        it("moves element backwards", function () {
          const vnode1 = h("span", [1, 2, 3, 4].map(spanNum));
          const vnode2 = h("span", [1, 4, 2, 3].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          assert.strictEqual(elm.children.length, 4);
          elm = patch(vnode1, vnode2).elm;
          assert.strictEqual(elm.children.length, 4);
          assert.strictEqual(elm.children[0].innerHTML, "1");
          assert.strictEqual(elm.children[1].innerHTML, "4");
          assert.strictEqual(elm.children[2].innerHTML, "2");
          assert.strictEqual(elm.children[3].innerHTML, "3");
        });
        it("swaps first and last", function () {
          const vnode1 = h("span", [1, 2, 3, 4].map(spanNum));
          const vnode2 = h("span", [4, 2, 3, 1].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          assert.strictEqual(elm.children.length, 4);
          elm = patch(vnode1, vnode2).elm;
          assert.strictEqual(elm.children.length, 4);
          assert.strictEqual(elm.children[0].innerHTML, "4");
          assert.strictEqual(elm.children[1].innerHTML, "2");
          assert.strictEqual(elm.children[2].innerHTML, "3");
          assert.strictEqual(elm.children[3].innerHTML, "1");
        });
      });
      describe("combinations of additions, removals and reorderings", function () {
        it("move to left and replace", function () {
          const vnode1 = h("span", [1, 2, 3, 4, 5].map(spanNum));
          const vnode2 = h("span", [4, 1, 2, 3, 6].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          assert.strictEqual(elm.children.length, 5);
          elm = patch(vnode1, vnode2).elm;
          assert.strictEqual(elm.children.length, 5);
          assert.strictEqual(elm.children[0].innerHTML, "4");
          assert.strictEqual(elm.children[1].innerHTML, "1");
          assert.strictEqual(elm.children[2].innerHTML, "2");
          assert.strictEqual(elm.children[3].innerHTML, "3");
          assert.strictEqual(elm.children[4].innerHTML, "6");
        });
        it("moves to left and leaves hole", function () {
          const vnode1 = h("span", [1, 4, 5].map(spanNum));
          const vnode2 = h("span", [4, 6].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          assert.strictEqual(elm.children.length, 3);
          elm = patch(vnode1, vnode2).elm;
          assert.deepEqual(map(inner, elm.children), ["4", "6"]);
        });
        it("handles moved and set to undefined element ending at the end", function () {
          const vnode1 = h("span", [2, 4, 5].map(spanNum));
          const vnode2 = h("span", [4, 5, 3].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          assert.strictEqual(elm.children.length, 3);
          elm = patch(vnode1, vnode2).elm;
          assert.strictEqual(elm.children.length, 3);
          assert.strictEqual(elm.children[0].innerHTML, "4");
          assert.strictEqual(elm.children[1].innerHTML, "5");
          assert.strictEqual(elm.children[2].innerHTML, "3");
        });
        it("moves a key in non-keyed nodes with a size up", function () {
          const vnode1 = h("span", [1, "a", "b", "c"].map(spanNum));
          const vnode2 = h("span", ["d", "a", "b", "c", 1, "e"].map(spanNum));
          elm = patch(vnode0, vnode1).elm;
          assert.strictEqual(elm.childNodes.length, 4);
          assert.strictEqual(elm.textContent, "1abc");
          elm = patch(vnode1, vnode2).elm;
          assert.strictEqual(elm.childNodes.length, 6);
          assert.strictEqual(elm.textContent, "dabc1e");
        });
        it("accepts symbol as key", function () {
          const vnode1 = h("span", [Symbol()].map(spanNum));
          const vnode2 = h(
            "span",
            [Symbol("1"), Symbol("2"), Symbol("3")].map(spanNum)
          );
          elm = patch(vnode0, vnode1).elm;
          assert.equal(elm.children.length, 1);
          elm = patch(vnode1, vnode2).elm;
          assert.equal(elm.children.length, 3);
          assert.equal(elm.children[1].innerHTML, "symbol");
          assert.equal(elm.children[2].innerHTML, "symbol");
        });
      });
      it("reverses elements", function () {
        const vnode1 = h("span", [1, 2, 3, 4, 5, 6, 7, 8].map(spanNum));
        const vnode2 = h("span", [8, 7, 6, 5, 4, 3, 2, 1].map(spanNum));
        elm = patch(vnode0, vnode1).elm;
        assert.strictEqual(elm.children.length, 8);
        elm = patch(vnode1, vnode2).elm;
        assert.deepEqual(map(inner, elm.children), [
          "8",
          "7",
          "6",
          "5",
          "4",
          "3",
          "2",
          "1",
        ]);
      });
      it("something", function () {
        const vnode1 = h("span", [0, 1, 2, 3, 4, 5].map(spanNum));
        const vnode2 = h("span", [4, 3, 2, 1, 5, 0].map(spanNum));
        elm = patch(vnode0, vnode1).elm;
        assert.strictEqual(elm.children.length, 6);
        elm = patch(vnode1, vnode2).elm;
        assert.deepEqual(map(inner, elm.children), [
          "4",
          "3",
          "2",
          "1",
          "5",
          "0",
        ]);
      });
      it("handles random shuffles", function () {
        let n;
        let i;
        const arr = [];
        const opacities: string[] = [];
        const elms = 14;
        const samples = 5;
        function spanNumWithOpacity(n: number, o: string) {
          return h("span", { key: n, style: { opacity: o } }, n.toString());
        }
        for (n = 0; n < elms; ++n) {
          arr[n] = n;
        }
        for (n = 0; n < samples; ++n) {
          const vnode1 = h(
            "span",
            arr.map(function (n) {
              return spanNumWithOpacity(n, "1");
            })
          );
          const shufArr = shuffle(arr.slice(0));
          let elm: HTMLDivElement | HTMLSpanElement =
            document.createElement("div");
          elm = patch(elm, vnode1).elm as HTMLSpanElement;
          for (i = 0; i < elms; ++i) {
            assert.strictEqual(elm.children[i].innerHTML, i.toString());
            opacities[i] = Math.random().toFixed(5).toString();
          }
          const vnode2 = h(
            "span",
            arr.map(function (n) {
              return spanNumWithOpacity(shufArr[n], opacities[n]);
            })
          );
          elm = patch(vnode1, vnode2).elm as HTMLSpanElement;
          for (i = 0; i < elms; ++i) {
            assert.strictEqual(
              elm.children[i].innerHTML,
              shufArr[i].toString()
            );
            const opacity = (elm.children[i] as HTMLSpanElement).style.opacity;
            assert.strictEqual(opacities[i].indexOf(opacity), 0);
          }
        }
      });
      it("supports null/undefined children", function () {
        const vnode1 = h("i", [0, 1, 2, 3, 4, 5].map(spanNum));
        const vnode2 = h(
          "i",
          [null, 2, undefined, null, 1, 0, null, 5, 4, null, 3, undefined].map(
            spanNum
          )
        );
        elm = patch(vnode0, vnode1).elm;
        assert.strictEqual(elm.children.length, 6);
        elm = patch(vnode1, vnode2).elm;
        assert.deepEqual(map(inner, elm.children), [
          "2",
          "1",
          "0",
          "5",
          "4",
          "3",
        ]);
      });
      it("supports all null/undefined children", function () {
        const vnode1 = h("i", [0, 1, 2, 3, 4, 5].map(spanNum));
        const vnode2 = h("i", [null, null, undefined, null, null, undefined]);
        const vnode3 = h("i", [5, 4, 3, 2, 1, 0].map(spanNum));
        patch(vnode0, vnode1);
        elm = patch(vnode1, vnode2).elm;
        assert.strictEqual(elm.children.length, 0);
        elm = patch(vnode2, vnode3).elm;
        assert.deepEqual(map(inner, elm.children), [
          "5",
          "4",
          "3",
          "2",
          "1",
          "0",
        ]);
      });
      it("handles random shuffles with null/undefined children", function () {
        let i;
        let j;
        let r;
        let len;
        let arr;
        const maxArrLen = 15;
        const samples = 5;
        let vnode1 = vnode0;
        let vnode2;
        for (i = 0; i < samples; ++i, vnode1 = vnode2) {
          len = Math.floor(Math.random() * maxArrLen);
          arr = [];
          for (j = 0; j < len; ++j) {
            if ((r = Math.random()) < 0.5) arr[j] = String(j);
            else if (r < 0.75) arr[j] = null;
            else arr[j] = undefined;
          }
          shuffle(arr);
          vnode2 = h("div", arr.map(spanNum));
          elm = patch(vnode1, vnode2).elm;
          assert.deepEqual(
            map(inner, elm.children),
            arr.filter(function (x) {
              return x != null;
            })
          );
        }
      });
    });
    describe("updating children without keys", function () {
      it("appends elements", function () {
        const vnode1 = h("div", [h("span", "Hello")]);
        const vnode2 = h("div", [h("span", "Hello"), h("span", "World")]);
        elm = patch(vnode0, vnode1).elm;
        assert.deepEqual(map(inner, elm.children), ["Hello"]);
        elm = patch(vnode1, vnode2).elm;
        assert.deepEqual(map(inner, elm.children), ["Hello", "World"]);
      });
      it("handles unmoved text nodes", function () {
        const vnode1 = h("div", ["Text", h("span", "Span")]);
        const vnode2 = h("div", ["Text", h("span", "Span")]);
        elm = patch(vnode0, vnode1).elm;
        assert.strictEqual(elm.childNodes[0].textContent, "Text");
        elm = patch(vnode1, vnode2).elm;
        assert.strictEqual(elm.childNodes[0].textContent, "Text");
      });
      it("handles changing text children", function () {
        const vnode1 = h("div", ["Text", h("span", "Span")]);
        const vnode2 = h("div", ["Text2", h("span", "Span")]);
        elm = patch(vnode0, vnode1).elm;
        assert.strictEqual(elm.childNodes[0].textContent, "Text");
        elm = patch(vnode1, vnode2).elm;
        assert.strictEqual(elm.childNodes[0].textContent, "Text2");
      });
      it("handles unmoved comment nodes", function () {
        const vnode1 = h("div", [h("!", "Text"), h("span", "Span")]);
        const vnode2 = h("div", [h("!", "Text"), h("span", "Span")]);
        elm = patch(vnode0, vnode1).elm;
        assert.strictEqual(elm.childNodes[0].textContent, "Text");
        elm = patch(vnode1, vnode2).elm;
        assert.strictEqual(elm.childNodes[0].textContent, "Text");
      });
      it("handles changing comment text", function () {
        const vnode1 = h("div", [h("!", "Text"), h("span", "Span")]);
        const vnode2 = h("div", [h("!", "Text2"), h("span", "Span")]);
        elm = patch(vnode0, vnode1).elm;
        assert.strictEqual(elm.childNodes[0].textContent, "Text");
        elm = patch(vnode1, vnode2).elm;
        assert.strictEqual(elm.childNodes[0].textContent, "Text2");
      });
      it("handles changing empty comment", function () {
        const vnode1 = h("div", [h("!"), h("span", "Span")]);
        const vnode2 = h("div", [h("!", "Test"), h("span", "Span")]);
        elm = patch(vnode0, vnode1).elm;
        assert.strictEqual(elm.childNodes[0].textContent, "");
        elm = patch(vnode1, vnode2).elm;
        assert.strictEqual(elm.childNodes[0].textContent, "Test");
      });
      it("prepends element", function () {
        const vnode1 = h("div", [h("span", "World")]);
        const vnode2 = h("div", [h("span", "Hello"), h("span", "World")]);
        elm = patch(vnode0, vnode1).elm;
        assert.deepEqual(map(inner, elm.children), ["World"]);
        elm = patch(vnode1, vnode2).elm;
        assert.deepEqual(map(inner, elm.children), ["Hello", "World"]);
      });
      it("prepends element of different tag type", function () {
        const vnode1 = h("div", [h("span", "World")]);
        const vnode2 = h("div", [h("div", "Hello"), h("span", "World")]);
        elm = patch(vnode0, vnode1).elm;
        assert.deepEqual(map(inner, elm.children), ["World"]);
        elm = patch(vnode1, vnode2).elm;
        assert.deepEqual(map(prop("tagName"), elm.children), ["DIV", "SPAN"]);
        assert.deepEqual(map(inner, elm.children), ["Hello", "World"]);
      });
      it("removes elements", function () {
        const vnode1 = h("div", [
          h("span", "One"),
          h("span", "Two"),
          h("span", "Three"),
        ]);
        const vnode2 = h("div", [h("span", "One"), h("span", "Three")]);
        elm = patch(vnode0, vnode1).elm;
        assert.deepEqual(map(inner, elm.children), ["One", "Two", "Three"]);
        elm = patch(vnode1, vnode2).elm;
        assert.deepEqual(map(inner, elm.children), ["One", "Three"]);
      });
      it("removes a single text node", function () {
        const vnode1 = h("div", "One");
        const vnode2 = h("div");
        patch(vnode0, vnode1);
        assert.strictEqual(elm.textContent, "One");
        patch(vnode1, vnode2);
        assert.strictEqual(elm.textContent, "");
      });
      it("removes a single text node when children are updated", function () {
        const vnode1 = h("div", "One");
        const vnode2 = h("div", [h("div", "Two"), h("span", "Three")]);
        patch(vnode0, vnode1);
        assert.strictEqual(elm.textContent, "One");
        patch(vnode1, vnode2);
        assert.deepEqual(map(prop("textContent"), elm.childNodes), [
          "Two",
          "Three",
        ]);
      });
      it("removes a text node among other elements", function () {
        const vnode1 = h("div", ["One", h("span", "Two")]);
        const vnode2 = h("div", [h("div", "Three")]);
        patch(vnode0, vnode1);
        assert.deepEqual(map(prop("textContent"), elm.childNodes), [
          "One",
          "Two",
        ]);
        patch(vnode1, vnode2);
        assert.strictEqual(elm.childNodes.length, 1);
        assert.strictEqual(elm.childNodes[0].tagName, "DIV");
        assert.strictEqual(elm.childNodes[0].textContent, "Three");
      });
      it("reorders elements", function () {
        const vnode1 = h("div", [
          h("span", "One"),
          h("div", "Two"),
          h("b", "Three"),
        ]);
        const vnode2 = h("div", [
          h("b", "Three"),
          h("span", "One"),
          h("div", "Two"),
        ]);
        elm = patch(vnode0, vnode1).elm;
        assert.deepEqual(map(inner, elm.children), ["One", "Two", "Three"]);
        elm = patch(vnode1, vnode2).elm;
        assert.deepEqual(map(prop("tagName"), elm.children), [
          "B",
          "SPAN",
          "DIV",
        ]);
        assert.deepEqual(map(inner, elm.children), ["Three", "One", "Two"]);
      });
      it("supports null/undefined children", function () {
        const vnode1 = h("i", [null, h("i", "1"), h("i", "2"), null]);
        const vnode2 = h("i", [
          h("i", "2"),
          undefined,
          undefined,
          h("i", "1"),
          undefined,
        ]);
        const vnode3 = h("i", [
          null,
          h("i", "1"),
          undefined,
          null,
          h("i", "2"),
          undefined,
          null,
        ]);
        elm = patch(vnode0, vnode1).elm;
        assert.deepEqual(map(inner, elm.children), ["1", "2"]);
        elm = patch(vnode1, vnode2).elm;
        assert.deepEqual(map(inner, elm.children), ["2", "1"]);
        elm = patch(vnode2, vnode3).elm;
        assert.deepEqual(map(inner, elm.children), ["1", "2"]);
      });
      it("supports all null/undefined children", function () {
        const vnode1 = h("i", [h("i", "1"), h("i", "2")]);
        const vnode2 = h("i", [null, undefined]);
        const vnode3 = h("i", [h("i", "2"), h("i", "1")]);
        patch(vnode0, vnode1);
        elm = patch(vnode1, vnode2).elm;
        assert.strictEqual(elm.children.length, 0);
        elm = patch(vnode2, vnode3).elm;
        assert.deepEqual(map(inner, elm.children), ["2", "1"]);
      });
    });
  });
  describe("patching a fragment", function () {
    it("can patch on document fragments", function () {
      let firstChild: HTMLElement;
      const root = document.createElement("div");
      const vnode1 = fragment(["I am", h("span", [" a", " fragment"])]);
      const vnode2 = h("div", ["I am an element"]);
      const vnode3 = fragment(["fragment ", "again"]);

      root.appendChild(vnode0);
      firstChild = root.firstChild as HTMLElement;
      assert.strictEqual(firstChild, vnode0);

      elm = patch(vnode0, vnode1).elm;
      firstChild = root.firstChild as HTMLElement;
      assert.strictEqual(firstChild.textContent, "I am");
      assert.strictEqual(elm.nodeType, document.DOCUMENT_FRAGMENT_NODE);
      assert.strictEqual(elm.parent, root);

      elm = patch(vnode1, vnode2).elm;
      firstChild = root.firstChild as HTMLElement;
      assert.strictEqual(firstChild.tagName, "DIV");
      assert.strictEqual(firstChild.textContent, "I am an element");
      assert.strictEqual(elm.tagName, "DIV");
      assert.strictEqual(elm.textContent, "I am an element");
      assert.strictEqual(elm.parentNode, root);

      elm = patch(vnode2, vnode3).elm;
      firstChild = root.firstChild as HTMLElement;
      assert.strictEqual(elm.nodeType, document.DOCUMENT_FRAGMENT_NODE);
      assert.strictEqual(firstChild.textContent, "fragment ");
      assert.strictEqual(elm.parent, root);
    });
    it("allows a document fragment as a container", function () {
      const vnode0 = document.createDocumentFragment();
      const vnode1 = fragment(["I", "am", "a", h("span", ["fragment"])]);
      const vnode2 = h("div", "I am an element");

      elm = patch(vnode0, vnode1).elm;
      assert.strictEqual(elm.nodeType, document.DOCUMENT_FRAGMENT_NODE);

      elm = patch(vnode1, vnode2).elm;
      assert.strictEqual(elm.tagName, "DIV");
    });
  });
  describe("hooks", function () {
    describe("element hooks", function () {
      it("calls `create` listener before inserted into parent but after children", function () {
        const result = [];
        const cb: CreateHook = (empty, vnode) => {
          assert(vnode.elm instanceof Element);
          assert.strictEqual(vnode.elm.children.length, 2);
          assert.strictEqual(vnode.elm.parentNode, null);
          result.push(vnode);
        };
        const vnode1 = h("div", [
          h("span", "First sibling"),
          h("div", { hook: { create: cb } }, [
            h("span", "Child 1"),
            h("span", "Child 2"),
          ]),
          h("span", "Can't touch me"),
        ]);
        patch(vnode0, vnode1);
        assert.strictEqual(1, result.length);
      });
      it("calls `insert` listener after both parents, siblings and children have been inserted", function () {
        const result = [];
        const cb: InsertHook = (vnode) => {
          assert(vnode.elm instanceof Element);
          assert.strictEqual(vnode.elm.children.length, 2);
          assert.strictEqual(vnode.elm.parentNode!.children.length, 3);
          result.push(vnode);
        };
        const vnode1 = h("div", [
          h("span", "First sibling"),
          h("div", { hook: { insert: cb } }, [
            h("span", "Child 1"),
            h("span", "Child 2"),
          ]),
          h("span", "Can touch me"),
        ]);
        patch(vnode0, vnode1);
        assert.strictEqual(1, result.length);
      });
      it("calls `prepatch` listener", function () {
        const result = [];
        const cb: PrePatchHook = (oldVnode, vnode) => {
          assert.strictEqual(oldVnode, vnode1.children![1]);
          assert.strictEqual(vnode, vnode2.children![1]);
          result.push(vnode);
        };
        const vnode1 = h("div", [
          h("span", "First sibling"),
          h("div", { hook: { prepatch: cb } }, [
            h("span", "Child 1"),
            h("span", "Child 2"),
          ]),
        ]);
        const vnode2 = h("div", [
          h("span", "First sibling"),
          h("div", { hook: { prepatch: cb } }, [
            h("span", "Child 1"),
            h("span", "Child 2"),
          ]),
        ]);
        patch(vnode0, vnode1);
        patch(vnode1, vnode2);
        assert.strictEqual(result.length, 1);
      });
      it("calls `postpatch` after `prepatch` listener", function () {
        let pre = 0;
        let post = 0;
        function preCb() {
          pre++;
        }
        function postCb() {
          assert.strictEqual(pre, post + 1);
          post++;
        }
        const vnode1 = h("div", [
          h("span", "First sibling"),
          h("div", { hook: { prepatch: preCb, postpatch: postCb } }, [
            h("span", "Child 1"),
            h("span", "Child 2"),
          ]),
        ]);
        const vnode2 = h("div", [
          h("span", "First sibling"),
          h("div", { hook: { prepatch: preCb, postpatch: postCb } }, [
            h("span", "Child 1"),
            h("span", "Child 2"),
          ]),
        ]);
        patch(vnode0, vnode1);
        patch(vnode1, vnode2);
        assert.strictEqual(pre, 1);
        assert.strictEqual(post, 1);
      });
      it("calls `update` listener", function () {
        const result1: VNode[] = [];
        const result2: VNode[] = [];
        function cb(result: VNode[], oldVnode: VNode, vnode: VNode) {
          if (result.length > 0) {
            console.log(result[result.length - 1]);
            console.log(oldVnode);
            assert.strictEqual(result[result.length - 1], oldVnode);
          }
          result.push(vnode);
        }
        const vnode1 = h("div", [
          h("span", "First sibling"),
          h("div", { hook: { update: cb.bind(null, result1) } }, [
            h("span", "Child 1"),
            h("span", { hook: { update: cb.bind(null, result2) } }, "Child 2"),
          ]),
        ]);
        const vnode2 = h("div", [
          h("span", "First sibling"),
          h("div", { hook: { update: cb.bind(null, result1) } }, [
            h("span", "Child 1"),
            h("span", { hook: { update: cb.bind(null, result2) } }, "Child 2"),
          ]),
        ]);
        patch(vnode0, vnode1);
        patch(vnode1, vnode2);
        assert.strictEqual(result1.length, 1);
        assert.strictEqual(result2.length, 1);
      });
      it("calls `remove` listener", function () {
        const result = [];
        const cb: RemoveHook = (vnode, rm) => {
          const parent = vnode.elm!.parentNode as HTMLDivElement;
          assert(vnode.elm instanceof Element);
          assert.strictEqual((vnode.elm as HTMLDivElement).children.length, 2);
          assert.strictEqual(parent.children.length, 2);
          result.push(vnode);
          rm();
          assert.strictEqual(parent.children.length, 1);
        };
        const vnode1 = h("div", [
          h("span", "First sibling"),
          h("div", { hook: { remove: cb } }, [
            h("span", "Child 1"),
            h("span", "Child 2"),
          ]),
        ]);
        const vnode2 = h("div", [h("span", "First sibling")]);
        patch(vnode0, vnode1);
        patch(vnode1, vnode2);
        assert.strictEqual(1, result.length);
      });
      it("calls `destroy` listener when patching text node over node with children", function () {
        let calls = 0;
        function cb() {
          calls++;
        }
        const vnode1 = h("div", [
          h("div", { hook: { destroy: cb } }, [h("span", "Child 1")]),
        ]);
        const vnode2 = h("div", "Text node");
        patch(vnode0, vnode1);
        patch(vnode1, vnode2);
        assert.strictEqual(calls, 1);
      });
      it("calls `init` and `prepatch` listeners on root", function () {
        let count = 0;
        const init: InitHook = (vnode) => {
          assert.strictEqual(vnode, vnode2);
          count += 1;
        };
        const prepatch: PrePatchHook = (oldVnode, vnode) => {
          assert.strictEqual(vnode, vnode1);
          count += 1;
        };
        const vnode1 = h("div", { hook: { init: init, prepatch: prepatch } });
        patch(vnode0, vnode1);
        assert.strictEqual(1, count);
        const vnode2 = h("span", { hook: { init: init, prepatch: prepatch } });
        patch(vnode1, vnode2);
        assert.strictEqual(2, count);
      });
      it("removes element when all remove listeners are done", function () {
        let rm1, rm2, rm3;
        const patch = init([
          {
            remove: function (_, rm) {
              rm1 = rm;
            },
          },
          {
            remove: function (_, rm) {
              rm2 = rm;
            },
          },
        ]);
        const vnode1 = h("div", [
          h("a", {
            hook: {
              remove: function (_, rm) {
                rm3 = rm;
              },
            },
          }),
        ]);
        const vnode2 = h("div", []);
        elm = patch(vnode0, vnode1).elm;
        assert.strictEqual(elm.children.length, 1);
        elm = patch(vnode1, vnode2).elm;
        assert.strictEqual(elm.children.length, 1);
        (rm1 as any)();
        assert.strictEqual(elm.children.length, 1);
        (rm3 as any)();
        assert.strictEqual(elm.children.length, 1);
        (rm2 as any)();
        assert.strictEqual(elm.children.length, 0);
      });
      it("invokes remove hook on replaced root", function () {
        const result = [];
        const parent = document.createElement("div");
        const vnode0 = document.createElement("div");
        parent.appendChild(vnode0);
        const cb: RemoveHook = (vnode, rm) => {
          result.push(vnode);
          rm();
        };
        const vnode1 = h("div", { hook: { remove: cb } }, [
          h("b", "Child 1"),
          h("i", "Child 2"),
        ]);
        const vnode2 = h("span", [h("b", "Child 1"), h("i", "Child 2")]);
        patch(vnode0, vnode1);
        patch(vnode1, vnode2);
        assert.strictEqual(1, result.length);
      });
    });
    describe("module hooks", function () {
      it("invokes `pre` and `post` hook", function () {
        const result: string[] = [];
        const patch = init([
          {
            pre: function () {
              result.push("pre");
            },
          },
          {
            post: function () {
              result.push("post");
            },
          },
        ]);
        const vnode1 = h("div");
        patch(vnode0, vnode1);
        assert.deepEqual(result, ["pre", "post"]);
      });
      it("invokes global `destroy` hook for all removed children", function () {
        const result = [];
        const cb: DestroyHook = (vnode) => {
          result.push(vnode);
        };
        const vnode1 = h("div", [
          h("span", "First sibling"),
          h("div", [
            h("span", { hook: { destroy: cb } }, "Child 1"),
            h("span", "Child 2"),
          ]),
        ]);
        const vnode2 = h("div");
        patch(vnode0, vnode1);
        patch(vnode1, vnode2);
        assert.strictEqual(result.length, 1);
      });
      it("handles text vnodes with `undefined` `data` property", function () {
        const vnode1 = h("div", [" "]);
        const vnode2 = h("div", []);
        patch(vnode0, vnode1);
        patch(vnode1, vnode2);
      });
      it("invokes `destroy` module hook for all removed children", function () {
        let created = 0;
        let destroyed = 0;
        const patch = init([
          {
            create: function () {
              created++;
            },
          },
          {
            destroy: function () {
              destroyed++;
            },
          },
        ]);
        const vnode1 = h("div", [
          h("span", "First sibling"),
          h("div", [h("span", "Child 1"), h("span", "Child 2")]),
        ]);
        const vnode2 = h("div");
        patch(vnode0, vnode1);
        patch(vnode1, vnode2);
        assert.strictEqual(created, 4);
        assert.strictEqual(destroyed, 4);
      });
      it("does not invoke `create` and `remove` module hook for text nodes", function () {
        let created = 0;
        let removed = 0;
        const patch = init([
          {
            create: function () {
              created++;
            },
          },
          {
            remove: function () {
              removed++;
            },
          },
        ]);
        const vnode1 = h("div", [
          h("span", "First child"),
          "",
          h("span", "Third child"),
        ]);
        const vnode2 = h("div");
        patch(vnode0, vnode1);
        patch(vnode1, vnode2);
        assert.strictEqual(created, 2);
        assert.strictEqual(removed, 2);
      });
      it("does not invoke `destroy` module hook for text nodes", function () {
        let created = 0;
        let destroyed = 0;
        const patch = init([
          {
            create: function () {
              created++;
            },
          },
          {
            destroy: function () {
              destroyed++;
            },
          },
        ]);
        const vnode1 = h("div", [
          h("span", "First sibling"),
          h("div", [h("span", "Child 1"), h("span", ["Text 1", "Text 2"])]),
        ]);
        const vnode2 = h("div");
        patch(vnode0, vnode1);
        patch(vnode1, vnode2);
        assert.strictEqual(created, 4);
        assert.strictEqual(destroyed, 4);
      });
    });
  });
  describe("short circuiting", function () {
    it("does not update strictly equal vnodes", function () {
      const result = [];
      const cb: UpdateHook = (vnode) => {
        result.push(vnode);
      };
      const vnode1 = h("div", [
        h("span", { hook: { update: cb } }, "Hello"),
        h("span", "there"),
      ]);
      patch(vnode0, vnode1);
      patch(vnode1, vnode1);
      assert.strictEqual(result.length, 0);
    });
    it("does not update strictly equal children", function () {
      const result = [];
      function cb(vnode: VNode) {
        result.push(vnode);
      }
      const vnode1 = h("div", [
        h("span", { hook: { patch: cb } as any }, "Hello"),
        h("span", "there"),
      ]);
      const vnode2 = h("div");
      vnode2.children = vnode1.children;
      patch(vnode0, vnode1);
      patch(vnode1, vnode2);
      assert.strictEqual(result.length, 0);
    });
  });
});
