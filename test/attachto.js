var assert = require('assert');
var snabbdom = require('../snabbdom');

var patch = snabbdom.init([]);
var attachTo = require('../helpers/attachto');
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
        attachTo(elm, h('div#attached', 'Test')),
      ]),
    ]));
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
    patch(vnode0, vnode1);
    assert.equal(elm.children[0].innerHTML, 'First text');
    patch(vnode1, vnode2);
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
    patch(vnode0, vnode1);
    assert.equal(elm.children[0].innerHTML, 'Text');
    patch(vnode1, vnode2);
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
    patch(vnode0, vnode1);
    assert.equal(elm.children[0].innerHTML, 'First text');
    patch(vnode1, vnode2);
    assert.equal(elm.children.length, 1);
  });
});
