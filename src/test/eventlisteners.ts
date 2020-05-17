import { assert } from 'chai';
import { VNode } from '../vnode';

import { init } from '../snabbdom';
import eventListenersModule from '../modules/eventlisteners';
import h from '../h';

var patch = init([
  eventListenersModule
]);

describe('event listeners', function () {
  var elm: any, vnode0: any;
  beforeEach(function () {
    elm = document.createElement('div');
    vnode0 = elm;
  });
  it('attaches click event handler to element', function () {
    var result = [];
    function clicked (ev: Event) {
      result.push(ev);
    }
    var vnode = h('div', { on: { click: clicked } }, [
      h('a', 'Click my parent'),
    ]);
    elm = patch(vnode0, vnode).elm;
    elm.click();
    assert.strictEqual(1, result.length);
  });
  it('does not attach new listener', function () {
    var result: number[] = [];
    // function clicked(ev) { result.push(ev); }
    var vnode1 = h('div', {
      on: {
        click: function (ev) {
          result.push(1);
        }
      }
    }, [
      h('a', 'Click my parent'),
    ]);
    var vnode2 = h('div', {
      on: {
        click: function (ev) {
          result.push(2);
        }
      }
    }, [
      h('a', 'Click my parent'),
    ]);
    elm = patch(vnode0, vnode1).elm;
    elm.click();
    elm = patch(vnode1, vnode2).elm;
    elm.click();
    assert.deepEqual(result, [1, 2]);
  });
  it('does calls handler for function in array', function () {
    var result: number[] = [];
    function clicked (n: number) {
      result.push(n);
    }
    var vnode = h('div', { on: { click: [clicked, 1] as any } }, [
      h('a', 'Click my parent'),
    ]);
    elm = patch(vnode0, vnode).elm;
    elm.click();
    assert.deepEqual(result, [1]);
  });
  it('handles changed value in array', function () {
    var result: number[] = [];
    function clicked (n: number) {
      result.push(n);
    }
    var vnode1 = h('div', { on: { click: [clicked, 1] as any } }, [
      h('a', 'Click my parent'),
    ]);
    var vnode2 = h('div', { on: { click: [clicked, 2] as any } }, [
      h('a', 'Click my parent'),
    ]);
    var vnode3 = h('div', { on: { click: [clicked, 3] as any } }, [
      h('a', 'Click my parent'),
    ]);
    elm = patch(vnode0, vnode1).elm;
    elm.click();
    elm = patch(vnode1, vnode2).elm;
    elm.click();
    elm = patch(vnode2, vnode3).elm;
    elm.click();
    assert.deepEqual(result, [1, 2, 3]);
  });
  it('handles changed several values in array', function () {
    var result: number[][] = [];
    function clicked () {
      result.push([].slice.call(arguments, 0, arguments.length - 2));
    }
    var vnode1 = h('div', { on: { click: [clicked, 1, 2, 3] as any } }, [
      h('a', 'Click my parent'),
    ]);
    var vnode2 = h('div', { on: { click: [clicked, 1, 2] as any } }, [
      h('a', 'Click my parent'),
    ]);
    var vnode3 = h('div', { on: { click: [clicked, 2, 3] as any } }, [
      h('a', 'Click my parent'),
    ]);
    elm = patch(vnode0, vnode1).elm;
    elm.click();
    elm = patch(vnode1, vnode2).elm;
    elm.click();
    elm = patch(vnode2, vnode3).elm;
    elm.click();
    assert.deepEqual(result, [[1, 2, 3], [1, 2], [2, 3]]);
  });
  it('detach attached click event handler to element', function () {
    var result: Event[] = [];
    function clicked (ev: Event) {
      result.push(ev);
    }
    var vnode1 = h('div', { on: { click: clicked } }, [
      h('a', 'Click my parent'),
    ]);
    elm = patch(vnode0, vnode1).elm;
    elm.click();
    assert.strictEqual(1, result.length);
    var vnode2 = h('div', { on: {} }, [
      h('a', 'Click my parent'),
    ]);
    elm = patch(vnode1, vnode2).elm;
    elm.click();
    assert.strictEqual(1, result.length);
  });
  it('multiple event handlers for same event on same element', function () {
    var called = 0;
    function clicked (ev: Event, vnode: VNode) {
      ++called;
      // Check that the first argument is an event
      assert.strictEqual(true, 'target' in ev);
      // Check that the second argument was a vnode
      assert.strictEqual(vnode.sel, 'div');
    }
    var vnode1 = h('div', { on: { click: [[clicked], [clicked], [clicked]] as any } }, [
      h('a', 'Click my parent'),
    ]);
    elm = patch(vnode0, vnode1).elm;
    elm.click();
    assert.strictEqual(3, called);
    var vnode2 = h('div', { on: { click: [[clicked], [clicked]] as any } }, [
      h('a', 'Click my parent'),
    ]);
    elm = patch(vnode1, vnode2).elm;
    elm.click();
    assert.strictEqual(5, called);
  });
  it('access to virtual node in event handler', function () {
    var result: Array<VNode | HTMLElement> = [];
    function clicked (this: HTMLElement, ev: Event, vnode: VNode) {
      result.push(this);
      result.push(vnode);
    }
    var vnode1 = h('div', { on: { click: clicked } as any }, [
      h('a', 'Click my parent'),
    ]);
    elm = patch(vnode0, vnode1).elm;
    elm.click();
    assert.strictEqual(2, result.length);
    assert.strictEqual(vnode1, result[0]);
    assert.strictEqual(vnode1, result[1]);
  });
  it('access to virtual node in event handler with argument', function () {
    var result: Array<VNode | HTMLElement> = [];
    function clicked (this: HTMLElement, arg: number, ev: Event, vnode: VNode) {
      result.push(this);
      result.push(vnode);
    }
    var vnode1 = h('div', { on: { click: [clicked, 1] as any } }, [
      h('a', 'Click my parent'),
    ]);
    elm = patch(vnode0, vnode1).elm;
    elm.click();
    assert.strictEqual(2, result.length);
    assert.strictEqual(vnode1, result[0]);
    assert.strictEqual(vnode1, result[1]);
  });
  it('access to virtual node in event handler with arguments', function () {
    var result: Array<VNode | HTMLElement> = [];
    function clicked (this: HTMLElement, arg1: number, arg2: string, ev: Event, vnode: VNode) {
      result.push(this);
      result.push(vnode);
    }
    var vnode1 = h('div', { on: { click: [clicked, 1, '2'] as any } }, [
      h('a', 'Click my parent'),
    ]);
    elm = patch(vnode0, vnode1).elm;
    elm.click();
    assert.strictEqual(2, result.length);
    assert.strictEqual(vnode1, result[0]);
    assert.strictEqual(vnode1, result[1]);
  });
  it('shared handlers in parent and child nodes', function () {
    var result = [];
    var sharedHandlers = {
      click: function (ev: Event) { result.push(ev); }
    };
    var vnode1 = h('div', { on: sharedHandlers }, [
      h('a', { on: sharedHandlers }, 'Click my parent'),
    ]);
    elm = patch(vnode0, vnode1).elm;
    elm.click();
    assert.strictEqual(1, result.length);
    elm.firstChild.click();
    assert.strictEqual(3, result.length);
  });
});
