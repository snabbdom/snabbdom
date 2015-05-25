var assert = require('assert');

var snabbdom = require('../snabbdom');
var patch = snabbdom.init([
]);
var h = require('../h');
var thunk = require('../thunk');

describe('thunk', function() {
  var elm, vnode0;
  beforeEach(function() {
    elm = document.createElement('div');
    vnode0 = elm;
  });
  it('returns vnode with data and render function', function() {
    function numberInSpan(n) {
      return h('span', 'Number is ' + n);
    }
    var vnode = thunk('num', numberInSpan, 22);
    assert.deepEqual(vnode.sel, 'thunknum');
    assert.deepEqual(vnode.data.args, [22]);
  });
  it('only calls render function on data change', function() {
    var called = 0;
    function numberInSpan(n) {
      called++;
      return h('span', 'Number is ' + n);
    }
    var vnode1 = h('div', [
      thunk('num', numberInSpan, 1)
    ]);
    var vnode2 = h('div', [
      thunk('num', numberInSpan, 1)
    ]);
    var vnode3 = h('div', [
      thunk('num', numberInSpan, 2)
    ]);
    patch(vnode0, vnode1);
    patch(vnode1, vnode2);
    patch(vnode2, vnode3);
    assert.equal(called, 2);
  });
  it('renders correctly', function() {
    var called = 0;
    function numberInSpan(n) {
      called++;
      return h('span', 'Number is ' + n);
    }
    var vnode1 = h('div', [
      thunk('num', numberInSpan, 1)
    ]);
    var vnode2 = h('div', [
      thunk('num', numberInSpan, 1)
    ]);
    var vnode3 = h('div', [
      thunk('num', numberInSpan, 2)
    ]);
    patch(vnode0, vnode1);
    assert.equal(elm.firstChild.innerHTML, 'Number is 1');
    patch(vnode1, vnode2);
    assert.equal(elm.firstChild.innerHTML, 'Number is 1');
    patch(vnode2, vnode3);
    assert.equal(elm.firstChild.innerHTML, 'Number is 2');
    assert.equal(called, 2);
  });
});
