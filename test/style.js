var assert = require('assert');
var fakeRaf = require('fake-raf');

var snabbdom = require('../snabbdom');
fakeRaf.use();
var patch = snabbdom.init([
  require('../modules/style').default,
]);
var h = require('../h').default;
var toVNode = require('../tovnode').default;

describe('style', function() {
  var elm, vnode0;
  beforeEach(function() {
    elm = document.createElement('div');
    vnode0 = elm;
  });
  it('is being styled', function() {
    elm = patch(vnode0, h('div', {style: {fontSize: '12px'}})).elm;
    assert.equal(elm.style.fontSize, '12px');
  });
  it('can be memoized', function() {
    var cachedStyles = {fontSize: '14px', display: 'inline'};
    var vnode1 = h('i', {style: cachedStyles});
    var vnode2 = h('i', {style: cachedStyles});
    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.style.fontSize, '14px');
    assert.equal(elm.style.display, 'inline');
    elm = patch(vnode1, vnode2).elm;
    assert.equal(elm.style.fontSize, '14px');
    assert.equal(elm.style.display, 'inline');
  });
  it('updates styles', function() {
    var vnode1 = h('i', {style: {fontSize: '14px', display: 'inline'}});
    var vnode2 = h('i', {style: {fontSize: '12px', display: 'block'}});
    var vnode3 = h('i', {style: {fontSize: '10px', display: 'block'}});
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
  it('explicialy removes styles', function() {
    var vnode1 = h('i', {style: {fontSize: '14px'}});
    var vnode2 = h('i', {style: {fontSize: ''}});
    var vnode3 = h('i', {style: {fontSize: '10px'}});
    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.style.fontSize, '14px');
    patch(vnode1, vnode2);
    assert.equal(elm.style.fontSize, '');
    patch(vnode2, vnode3);
    assert.equal(elm.style.fontSize, '10px');
  });
  it('implicially removes styles from element', function() {
    var vnode1 = h('div', [h('i', {style: {fontSize: '14px'}})]);
    var vnode2 = h('div', [h('i')]);
    var vnode3 = h('div', [h('i', {style: {fontSize: '10px'}})]);
    patch(vnode0, vnode1);
    assert.equal(elm.firstChild.style.fontSize, '14px');
    patch(vnode1, vnode2);
    assert.equal(elm.firstChild.style.fontSize, '');
    patch(vnode2, vnode3);
    assert.equal(elm.firstChild.style.fontSize, '10px');
  });
  it('updates css variables', function() {
    var vnode1 = h('div', {style: {'--myVar': 1}});
    var vnode2 = h('div', {style: {'--myVar': 2}});
    var vnode3 = h('div', {style: {'--myVar': 3}});
    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.style.getPropertyValue('--myVar'), 1);
    elm = patch(vnode1, vnode2).elm;
    assert.equal(elm.style.getPropertyValue('--myVar'), 2);
    elm = patch(vnode2, vnode3).elm;
    assert.equal(elm.style.getPropertyValue('--myVar'), 3);
  });
  it('explicialy removes css variables', function() {
    var vnode1 = h('i', {style: {'--myVar': 1}});
    var vnode2 = h('i', {style: {'--myVar': ''}});
    var vnode3 = h('i', {style: {'--myVar': 2}});
    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.style.getPropertyValue('--myVar'), 1);
    patch(vnode1, vnode2);
    assert.equal(elm.style.getPropertyValue('--myVar'), '');
    patch(vnode2, vnode3);
    assert.equal(elm.style.getPropertyValue('--myVar'), 2);
  });
  it('implicially removes css variables from element', function() {
    var vnode1 = h('div', [h('i', {style: {'--myVar': 1}})]);
    var vnode2 = h('div', [h('i')]);
    var vnode3 = h('div', [h('i', {style: {'--myVar': 2}})]);
    patch(vnode0, vnode1);
    assert.equal(elm.firstChild.style.getPropertyValue('--myVar'), 1);
    patch(vnode1, vnode2);
    assert.equal(elm.firstChild.style.getPropertyValue('--myVar'), '');
    patch(vnode2, vnode3);
    assert.equal(elm.firstChild.style.getPropertyValue('--myVar'), 2);
  });
  it('updates delayed styles in next frame', function() {
    var patch = snabbdom.init([
      require('../modules/style').default,
    ]);
    var vnode1 = h('i', {style: {fontSize: '14px', delayed: {fontSize: '16px'}}});
    var vnode2 = h('i', {style: {fontSize: '18px', delayed: {fontSize: '20px'}}});
    elm = patch(vnode0, vnode1).elm;
    assert.equal(elm.style.fontSize, '14px');
    fakeRaf.step();
    fakeRaf.step();
    assert.equal(elm.style.fontSize, '16px');
    elm = patch(vnode1, vnode2).elm;
    assert.equal(elm.style.fontSize, '18px');
    fakeRaf.step();
    fakeRaf.step();
    assert.equal(elm.style.fontSize, '20px');
  });
  it('applies tranform as transition on remove', function(done) {
    var btn = h('button', { style: {
        transition: 'transform 0.5s',
        remove: { transform: 'translateY(100%)' }
    }}, ['A button']);
    var vnode1 = h('div.parent', {}, [btn]);
    var vnode2 = h('div.parent', {}, [null]);
    document.body.appendChild(vnode0);
    patch(vnode0, vnode1);
    patch(vnode1, vnode2);
    assert.strictEqual(document.querySelectorAll('button').length, 1);
    setTimeout(function () {
        assert.strictEqual(document.querySelectorAll('button').length, 0);
        done();
    }, 700);
  });
  describe('using toVNode()', function () {
    it('handles (ignoring) comment nodes', function() {
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

fakeRaf.restore();
