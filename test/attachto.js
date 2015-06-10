var assert = require('assert');
var snabbdom = require('../snabbdom');

var patch = snabbdom.init([
  require('../modules/attachto'),
]);
var h = require('../h');

describe('attachTo', function() {
  var elm, vnode0;
  beforeEach(function() {
    elm = document.createElement('div');
    vnode0 = elm;
  });
  it('adds element to target', function() {
    patch(vnode0, h('div', [
      h('div#wrapper', [
        h('div', 'Some element'),
        h('div#attached', {attachTo: elm}, 'Test'),
      ]),
    ]));
    console.log(elm.children);
    assert.equal(elm.children.length, 2);
  });
  it('updates element at target', function() {
    var vnode1 = h('div', [
      h('div#wrapper', [
        h('div', 'Some element'),
        h('div#attached', {attachTo: elm}, 'First text'),
      ]),
    ]);
    var vnode2 = h('div', [
      h('div#wrapper', [
        h('div', 'Some element'),
        h('div#attached', {attachTo: elm}, 'New text'),
      ]),
    ]);
    patch(vnode0, vnode1);
    assert.equal(elm.children[0].innerHTML, 'First text');
    patch(vnode1, vnode2);
    assert.equal(elm.children[0].innerHTML, 'New text');
  });
  it('removes element at target', function() {
    var vnode1 = h('div', [
      h('div#wrapper', [
        h('div', 'Some element'),
        h('div#attached', {attachTo: elm}, 'First text'),
      ]),
    ]);
    var vnode2 = h('div', [
      h('div#wrapper', [
        h('div', 'Some element'),
      ]),
    ]);
    patch(vnode0, vnode1);
    assert.equal(elm.children[0].innerHTML, 'First text');
    patch(vnode1, vnode2);
    assert.equal(elm.children.length, 1);
  });
});
