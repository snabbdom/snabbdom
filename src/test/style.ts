import assert from 'assert'

import { init } from '../snabbdom'
import styleModule from '../modules/style'
var patch = init([
  styleModule
]);
import h from '../h'
import toVNode from '../tovnode'

describe('style', function () {
  var elm: any, vnode0: any;
  beforeEach(function () {
    elm = document.createElement('div');
    vnode0 = elm;
  });
  it('is being styled', function () {
    elm = patch(vnode0, h('div', { style: { fontSize: '12px' } })).elm;
    assert.equal(elm.style.fontSize, '12px');
  });
  it('can be memoized', function () {
    var cachedStyles = { fontSize: '14px', display: 'inline' };
    var vnode1 = h('i', { style: cachedStyles });
    var vnode2 = h('i', { style: cachedStyles });
    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.style.fontSize, '14px');
    assert.equal(elm.style.display, 'inline');
    elm = patch(vnode1, vnode2).elm;
    assert.equal(elm.style.fontSize, '14px');
    assert.equal(elm.style.display, 'inline');
  });
  it('updates styles', function () {
    var vnode1 = h('i', { style: { fontSize: '14px', display: 'inline' } });
    var vnode2 = h('i', { style: { fontSize: '12px', display: 'block' } });
    var vnode3 = h('i', { style: { fontSize: '10px', display: 'block' } });
    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.style.fontSize, '14px');
    assert.equal(elm.style.display, 'inline');
    elm = patch(vnode1, vnode2).elm;
    assert.equal(elm.style.fontSize, '12px');
    assert.equal(elm.style.display, 'block');
    elm = patch(vnode2, vnode3).elm;
    assert.equal(elm.style.fontSize, '10px');
    assert.equal(elm.style.display, 'block');
  });
  it('explicialy removes styles', function () {
    var vnode1 = h('i', { style: { fontSize: '14px' } });
    var vnode2 = h('i', { style: { fontSize: '' } });
    var vnode3 = h('i', { style: { fontSize: '10px' } });
    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.style.fontSize, '14px');
    patch(vnode1, vnode2);
    assert.equal(elm.style.fontSize, '');
    patch(vnode2, vnode3);
    assert.equal(elm.style.fontSize, '10px');
  });
  it('implicially removes styles from element', function () {
    var vnode1 = h('div', [h('i', { style: { fontSize: '14px' } })]);
    var vnode2 = h('div', [h('i')]);
    var vnode3 = h('div', [h('i', { style: { fontSize: '10px' } })]);
    patch(vnode0, vnode1);
    assert.equal(elm.firstChild.style.fontSize, '14px');
    patch(vnode1, vnode2);
    assert.equal(elm.firstChild.style.fontSize, '');
    patch(vnode2, vnode3);
    assert.equal(elm.firstChild.style.fontSize, '10px');
  });
  it('updates css variables', function () {
    var vnode1 = h('div', { style: { '--myVar': 1 as any } });
    var vnode2 = h('div', { style: { '--myVar': 2 as any } });
    var vnode3 = h('div', { style: { '--myVar': 3 as any } });
    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.style.getPropertyValue('--myVar'), 1);
    elm = patch(vnode1, vnode2).elm;
    assert.equal(elm.style.getPropertyValue('--myVar'), 2);
    elm = patch(vnode2, vnode3).elm;
    assert.equal(elm.style.getPropertyValue('--myVar'), 3);
  });
  it('explicialy removes css variables', function () {
    var vnode1 = h('i', { style: { '--myVar': 1 as any } });
    var vnode2 = h('i', { style: { '--myVar': '' } });
    var vnode3 = h('i', { style: { '--myVar': 2 as any } });
    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.style.getPropertyValue('--myVar'), 1);
    patch(vnode1, vnode2);
    assert.equal(elm.style.getPropertyValue('--myVar'), '');
    patch(vnode2, vnode3);
    assert.equal(elm.style.getPropertyValue('--myVar'), 2);
  });
  it('implicially removes css variables from element', function () {
    var vnode1 = h('div', [h('i', { style: { '--myVar': 1 as any } })]);
    var vnode2 = h('div', [h('i')]);
    var vnode3 = h('div', [h('i', { style: { '--myVar': 2 as any } })]);
    patch(vnode0, vnode1);
    assert.equal(elm.firstChild.style.getPropertyValue('--myVar'), 1);
    patch(vnode1, vnode2);
    assert.equal(elm.firstChild.style.getPropertyValue('--myVar'), '');
    patch(vnode2, vnode3);
    assert.equal(elm.firstChild.style.getPropertyValue('--myVar'), 2);
  });
  it('updates delayed styles in next frame', function (done) {
    var vnode1 = h('i', { style: { fontSize: '14px', delayed: { fontSize: '16px' } as any } });
    var vnode2 = h('i', { style: { fontSize: '18px', delayed: { fontSize: '20px' } as any } });
    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.style.fontSize, '14px');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        assert.equal(elm.style.fontSize, '16px');
        elm = patch(vnode1, vnode2).elm;
        assert.equal(elm.style.fontSize, '18px');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            assert.equal(elm.style.fontSize, '20px');
            done()
          })
        })
      })
    })
  });
  it('applies tranform as transition on remove', function (done) {
    var btn = h('button', {
      style: {
        transition: 'transform 0.1s',
        remove: { transform: 'translateY(100%)' } as any
      }
    }, ['A button']);
    var vnode1 = h('div.parent', {}, [btn]);
    var vnode2 = h('div.parent', {}, [null]);
    document.body.appendChild(vnode0);
    patch(vnode0, vnode1);
    patch(vnode1, vnode2);
    const button = document.querySelector('button') as HTMLButtonElement;
    assert.notStrictEqual(button, null);
    button.addEventListener('transitionend', function () {
      assert.strictEqual(document.querySelector('button'), null);
      done();
    });
  });
  describe('using toVNode()', function () {
    it('handles (ignoring) comment nodes', function () {
      var comment = document.createComment('yolo');
      var prevElm = document.createElement('div');
      prevElm.appendChild(comment);
      var nextVNode = h('div', [h('span', 'Hi')]);
      elm = patch(toVNode(prevElm), nextVNode).elm;
      assert.strictEqual(elm, prevElm);
      assert.equal(elm.tagName, 'DIV');
      assert.strictEqual(elm.childNodes.length, 1);
      assert.strictEqual(elm.childNodes[0].tagName, 'SPAN');
      assert.strictEqual(elm.childNodes[0].textContent, 'Hi');
    });
  });
});
