var assert = require('assert');
var snabbdom = require('../snabbdom');

var patch = snabbdom.init([]);
var attachTo = require('../helpers/attachto').default;
var h = require('../h').default;

describe('attachTo', function() {
  var elm, vnode0;
  beforeEach(function() {
    elm = document.createElement('div');
    vnode0 = elm;
  });
  it('adds element to target', function() {
    var vnode1 = h('div', [
       h('div#wrapper', [
         h('div', 'Some element'),
         attachTo(elm, h('div#attached', 'Test')),
       ]),
    ]);
    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.children.length, 2);
  });
  it('updates element at target', function() {
    var vnode1 = h('div', [
      h('div#wrapper', [
        h('div', 'Some element'),
        attachTo(elm, h('div#attached', 'First text')),
      ]),
    ]);
    var vnode2 = h('div', [
      h('div#wrapper', [
        h('div', 'Some element'),
        attachTo(elm, h('div#attached', 'New text')),
      ]),
    ]);
    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.children[0].innerHTML, 'First text');
    elm = patch(vnode1, vnode2).elm;
    assert.equal(elm.children[0].innerHTML, 'New text');
  });
  it('element can be inserted before modal', function() {
    var vnode1 = h('div', [
      h('div#wrapper', [
        h('div', 'Some element'),
        attachTo(elm, h('div#attached', 'Text')),
      ]),
    ]);
    var vnode2 = h('div', [
      h('div#wrapper', [
        h('div', 'Some element'),
        h('div', 'A new element'),
        attachTo(elm, h('div#attached', 'Text')),
      ]),
    ]);
    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.children[0].innerHTML, 'Text');
    elm = patch(vnode1, vnode2).elm;
    assert.equal(elm.children[0].innerHTML, 'Text');
  });
  it('removes element at target', function() {
    var vnode1 = h('div', [
      h('div#wrapper', [
        h('div', 'Some element'),
        attachTo(elm, h('div#attached', 'First text')),
      ]),
    ]);
    var vnode2 = h('div', [
      h('div#wrapper', [
        h('div', 'Some element'),
      ]),
    ]);
    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.children[0].innerHTML, 'First text');
    elm = patch(vnode1, vnode2).elm;
    assert.equal(elm.children.length, 1);
  });
  it('remove hook receives real element', function() {
    function rm(vnode, cb) {
      assert.equal(vnode.elm.tagName, 'DIV');
      assert.equal(vnode.elm.innerHTML, 'First text');
      cb();
    }
    var vnode1 = h('div', [
      h('div#wrapper', [
        h('div', 'Some element'),
        attachTo(elm, h('div#attached', {hook: {remove: rm}}, 'First text')),
      ]),
    ]);
    var vnode2 = h('div', [
      h('div#wrapper', [
        h('div', 'Some element'),
      ]),
    ]);
    elm = patch(vnode0, vnode1).elm;
    elm = patch(vnode1, vnode2).elm;
  });
});
