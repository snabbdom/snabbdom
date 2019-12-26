import assert from 'assert'

import { init } from '../snabbdom'
var patch = init([
]);
import h from '../h'
import thunk from '../thunk'
import { VNode } from '../vnode';

describe('thunk', function () {
  var elm: any, vnode0: any;
  beforeEach(function () {
    elm = vnode0 = document.createElement('div');
  });
  it('returns vnode with data and render function', function () {
    function numberInSpan (n: number) {
      return h('span', 'Number is ' + n);
    }
    var vnode = thunk('span', 'num', numberInSpan, [22]);
    assert.deepEqual(vnode.sel, 'span');
    assert.deepEqual(vnode.data.key, 'num');
    assert.deepEqual(vnode.data.args, [22]);
  });
  it('calls render function once on data change', function () {
    var called = 0;
    function numberInSpan (n: number) {
      called++;
      return h('span', { key: 'num' }, 'Number is ' + n);
    }
    var vnode1 = h('div', [
      thunk('span', 'num', numberInSpan, [1])
    ]);
    var vnode2 = h('div', [
      thunk('span', 'num', numberInSpan, [2])
    ]);
    patch(vnode0, vnode1);
    assert.equal(called, 1);
    patch(vnode1, vnode2);
    assert.equal(called, 2);
  });
  it('does not call render function on data unchanged', function () {
    var called = 0;
    function numberInSpan (n: number) {
      called++;
      return h('span', { key: 'num' }, 'Number is ' + n);
    }
    var vnode1 = h('div', [
      thunk('span', 'num', numberInSpan, [1])
    ]);
    var vnode2 = h('div', [
      thunk('span', 'num', numberInSpan, [1])
    ]);
    patch(vnode0, vnode1);
    assert.equal(called, 1);
    patch(vnode1, vnode2);
    assert.equal(called, 1);
  });
  it('calls render function once on data-length change', function () {
    var called = 0;
    function numberInSpan (n: number) {
      called++;
      return h('span', { key: 'num' }, 'Number is ' + n);
    }
    var vnode1 = h('div', [
      thunk('span', 'num', numberInSpan, [1])
    ]);
    var vnode2 = h('div', [
      thunk('span', 'num', numberInSpan, [1, 2])
    ]);
    patch(vnode0, vnode1);
    assert.equal(called, 1);
    patch(vnode1, vnode2);
    assert.equal(called, 2);
  });
  it('calls render function once on function change', function () {
    var called = 0;
    function numberInSpan (n: number) {
      called++;
      return h('span', { key: 'num' }, 'Number is ' + n);
    }
    function numberInSpan2 (n: number) {
      called++;
      return h('span', { key: 'num' }, 'Number really is ' + n);
    }
    var vnode1 = h('div', [
      thunk('span', 'num', numberInSpan, [1])
    ]);
    var vnode2 = h('div', [
      thunk('span', 'num', numberInSpan2, [1])
    ]);
    patch(vnode0, vnode1);
    assert.equal(called, 1);
    patch(vnode1, vnode2);
    assert.equal(called, 2);
  });
  it('renders correctly', function () {
    var called = 0;
    function numberInSpan (n: number) {
      called++;
      return h('span', { key: 'num' }, 'Number is ' + n);
    }
    var vnode1 = h('div', [
      thunk('span', 'num', numberInSpan, [1])
    ]);
    var vnode2 = h('div', [
      thunk('span', 'num', numberInSpan, [1])
    ]);
    var vnode3 = h('div', [
      thunk('span', 'num', numberInSpan, [2])
    ]);
    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.firstChild.tagName.toLowerCase(), 'span');
    assert.equal(elm.firstChild.innerHTML, 'Number is 1');
    elm = patch(vnode1, vnode2).elm;
    assert.equal(elm.firstChild.tagName.toLowerCase(), 'span');
    assert.equal(elm.firstChild.innerHTML, 'Number is 1');
    elm = patch(vnode2, vnode3).elm;
    assert.equal(elm.firstChild.tagName.toLowerCase(), 'span');
    assert.equal(elm.firstChild.innerHTML, 'Number is 2');
    assert.equal(called, 2);
  });
  it('supports leaving out the `key` argument', function () {
    function vnodeFn (s: string) {
      return h('span.number', 'Hello ' + s);
    }
    var vnode1 = thunk('span.number', vnodeFn, ['World!']);
    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.innerText, 'Hello World!');
  });
  it('renders correctly when root', function () {
    var called = 0;
    function numberInSpan (n: number) {
      called++;
      return h('span', { key: 'num' }, 'Number is ' + n);
    }
    var vnode1 = thunk('span', 'num', numberInSpan, [1]);
    var vnode2 = thunk('span', 'num', numberInSpan, [1]);
    var vnode3 = thunk('span', 'num', numberInSpan, [2]);

    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.tagName.toLowerCase(), 'span');
    assert.equal(elm.innerHTML, 'Number is 1');

    elm = patch(vnode1, vnode2).elm;
    assert.equal(elm.tagName.toLowerCase(), 'span');
    assert.equal(elm.innerHTML, 'Number is 1');

    elm = patch(vnode2, vnode3).elm;
    assert.equal(elm.tagName.toLowerCase(), 'span');
    assert.equal(elm.innerHTML, 'Number is 2');
    assert.equal(called, 2);
  });
  it('can be replaced and removed', function () {
    function numberInSpan (n: number) {
      return h('span', { key: 'num' }, 'Number is ' + n);
    }
    function oddEven (n: number): VNode {
      var prefix = (n % 2) === 0 ? 'Even' : 'Odd';
      return h('div', { key: oddEven as any }, prefix + ': ' + n);
    }
    var vnode1 = h('div', [thunk('span', 'num', numberInSpan, [1])]);
    var vnode2 = h('div', [thunk('div', 'oddEven', oddEven, [4])]);

    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.firstChild.tagName.toLowerCase(), 'span');
    assert.equal(elm.firstChild.innerHTML, 'Number is 1');

    elm = patch(vnode1, vnode2).elm;
    assert.equal(elm.firstChild.tagName.toLowerCase(), 'div');
    assert.equal(elm.firstChild.innerHTML, 'Even: 4');
  });
  it('can be replaced and removed when root', function () {
    function numberInSpan (n: number) {
      return h('span', { key: 'num' }, 'Number is ' + n);
    }
    function oddEven (n: number): VNode {
      var prefix = (n % 2) === 0 ? 'Even' : 'Odd';
      return h('div', { key: oddEven as any }, prefix + ': ' + n);
    }
    var vnode1 = thunk('span', 'num', numberInSpan, [1]);
    var vnode2 = thunk('div', 'oddEven', oddEven, [4]);

    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.tagName.toLowerCase(), 'span');
    assert.equal(elm.innerHTML, 'Number is 1');

    elm = patch(vnode1, vnode2).elm;
    assert.equal(elm.tagName.toLowerCase(), 'div');
    assert.equal(elm.innerHTML, 'Even: 4');
  });
  it('invokes destroy hook on thunks', function () {
    var called = 0;
    function destroyHook () {
      called++;
    }
    function numberInSpan (n: number) {
      return h('span', { key: 'num', hook: { destroy: destroyHook } }, 'Number is ' + n);
    }
    var vnode1 = h('div', [
      h('div', 'Foo'),
      thunk('span', 'num', numberInSpan, [1]),
      h('div', 'Foo')
    ]);
    var vnode2 = h('div', [
      h('div', 'Foo'),
      h('div', 'Foo')
    ]);
    patch(vnode0, vnode1);
    patch(vnode1, vnode2);
    assert.equal(called, 1);
  });
  it('invokes remove hook on thunks', function () {
    var called = 0;
    function hook () {
      called++;
    }
    function numberInSpan (n: number) {
      return h('span', { key: 'num', hook: { remove: hook } }, 'Number is ' + n);
    }
    var vnode1 = h('div', [
      h('div', 'Foo'),
      thunk('span', 'num', numberInSpan, [1]),
      h('div', 'Foo')
    ]);
    var vnode2 = h('div', [
      h('div', 'Foo'),
      h('div', 'Foo')
    ]);
    patch(vnode0, vnode1);
    patch(vnode1, vnode2);
    assert.equal(called, 1);
  });
});
