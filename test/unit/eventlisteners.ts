import { assert } from "@esm-bundle/chai";

import { VNode, init, eventListenersModule, h } from "../../src/index";

const patch = init([eventListenersModule]);

describe("event listeners", () => {
  let elm: any, vnode0: any;
  beforeEach(() => {
    elm = document.createElement("div");
    vnode0 = elm;
  });
  it("attaches click event handler to element", () => {
    const result = [];
    function clicked(ev: Event) {
      result.push(ev);
    }
    const vnode = h("div", { on: { click: clicked } }, [
      h("a", "Click my parent")
    ]);
    elm = patch(vnode0, vnode).elm;
    elm.click();
    assert.strictEqual(1, result.length);
  });
  it("does not attach new listener", () => {
    const result: number[] = [];
    // function clicked(ev) { result.push(ev); }
    const vnode1 = h(
      "div",
      {
        on: {
          click: () => {
            result.push(1);
          }
        }
      },
      [h("a", "Click my parent")]
    );
    const vnode2 = h(
      "div",
      {
        on: {
          click: () => {
            result.push(2);
          }
        }
      },
      [h("a", "Click my parent")]
    );
    elm = patch(vnode0, vnode1).elm;
    elm.click();
    elm = patch(vnode1, vnode2).elm;
    elm.click();
    assert.deepEqual(result, [1, 2]);
  });
  it("detach attached click event handler to element", () => {
    const result: Event[] = [];
    function clicked(ev: Event) {
      result.push(ev);
    }
    const vnode1 = h("div", { on: { click: clicked } }, [
      h("a", "Click my parent")
    ]);
    elm = patch(vnode0, vnode1).elm;
    elm.click();
    assert.strictEqual(1, result.length);
    const vnode2 = h("div", { on: {} }, [h("a", "Click my parent")]);
    elm = patch(vnode1, vnode2).elm;
    elm.click();
    assert.strictEqual(1, result.length);
  });
  it("multiple event handlers for same event on same element", () => {
    let called = 0;
    function clicked(ev: Event, vnode: VNode) {
      ++called;
      // Check that the first argument is an event
      assert.strictEqual(true, "target" in ev);
      // Check that the second argument was a vnode
      assert.strictEqual(vnode.sel, "div");
    }
    const vnode1 = h("div", { on: { click: [clicked, clicked, clicked] } }, [
      h("a", "Click my parent")
    ]);
    elm = patch(vnode0, vnode1).elm;
    elm.click();
    assert.strictEqual(3, called);
    const vnode2 = h("div", { on: { click: [clicked, clicked] } }, [
      h("a", "Click my parent")
    ]);
    elm = patch(vnode1, vnode2).elm;
    elm.click();
    assert.strictEqual(5, called);
  });
  it("access to virtual node in event handler", () => {
    const result: VNode[] = [];
    function clicked(this: VNode, ev: Event, vnode: VNode) {
      result.push(this);
      result.push(vnode);
    }
    const vnode1 = h("div", { on: { click: clicked } }, [
      h("a", "Click my parent")
    ]);
    elm = patch(vnode0, vnode1).elm;
    elm.click();
    assert.strictEqual(2, result.length);
    assert.strictEqual(vnode1, result[0]);
    assert.strictEqual(vnode1, result[1]);
  });
  it("shared handlers in parent and child nodes", () => {
    const result = [];
    const sharedHandlers = {
      click: (ev: Event) => {
        result.push(ev);
      }
    };
    const vnode1 = h("div", { on: sharedHandlers }, [
      h("a", { on: sharedHandlers }, "Click my parent")
    ]);
    elm = patch(vnode0, vnode1).elm;
    elm.click();
    assert.strictEqual(1, result.length);
    elm.firstChild.click();
    assert.strictEqual(3, result.length);
  });
});
