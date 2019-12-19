import assert from 'assert'
import { init } from '../snabbdom'
import { RemoveHook } from '../hooks';

var patch = init([]);
import attachTo from '../helpers/attachto'
import h from '../h'

describe('attachTo', function () {
  var elm: any, vnode0: any;
  beforeEach(function () {
    elm = document.createElement('div');
    vnode0 = elm;
  });
  it('adds element to target', function () {
    var vnode1 = h('div', [
      h('div#wrapper', [
        h('div', 'Some element'),
        attachTo(elm, h('div#attached', 'Test')),
      ]),
    ]);
    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.children.length, 2);
  });
  it('updates element at target', function () {
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
  it('element can be inserted before modal', function () {
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
  it('removes element at target', function () {
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
  it('remove hook receives real element', function () {
    const rm: RemoveHook = (vnode, cb) => {
      const elm = vnode.elm as HTMLDivElement;
      assert.equal(elm.tagName, 'DIV');
      assert.equal(elm.innerHTML, 'First text');
      cb();
    }
    var vnode1 = h('div', [
      h('div#wrapper', [
        h('div', 'Some element'),
        attachTo(elm, h('div#attached', { hook: { remove: rm } }, 'First text')),
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
