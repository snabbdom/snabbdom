var assert = require('assert');
var fakeRaf = require('fake-raf');

var snabbdom = require('../snabbdom');
fakeRaf.use();
var patch = snabbdom.init([
  require('../modules/style'),
]);
var h = require('../h');

describe('style', function() {
  var elm, vnode0;
  beforeEach(function() {
    elm = document.createElement('div');
    vnode0 = elm;
  });
  it('is being styled', function() {
    patch(vnode0, h('div', {style: {fontSize: '12px'}}));
    assert.equal(elm.style.fontSize, '12px');
  });
  it('updates styles', function() {
    var vnode1 = h('i', {style: {fontSize: '14px', display: 'inline'}});
    var vnode2 = h('i', {style: {fontSize: '12px', display: 'block'}});
    var vnode3 = h('i', {style: {fontSize: '10px', display: 'block'}});
    patch(vnode0, vnode1);
    assert.equal(elm.style.fontSize, '14px');
    assert.equal(elm.style.display, 'inline');
    patch(vnode1, vnode2);
    assert.equal(elm.style.fontSize, '12px');
    assert.equal(elm.style.display, 'block');
    patch(vnode2, vnode3);
    assert.equal(elm.style.fontSize, '10px');
    assert.equal(elm.style.display, 'block');
  });
  it('explicialy removes styles', function() {
    var vnode1 = h('i', {style: {fontSize: '14px'}});
    var vnode2 = h('i', {style: {fontSize: ''}});
    var vnode3 = h('i', {style: {fontSize: '10px'}});
    patch(vnode0, vnode1);
    assert.equal(elm.style.fontSize, '14px');
    patch(vnode1, vnode2);
    assert.equal(elm.style.fontSize, '');
    patch(vnode2, vnode3);
    assert.equal(elm.style.fontSize, '10px');
  });
  it('implicially removes styles from element with key', function() {
    var vnode1 = h('i', {key: '1', style: {fontSize: '14px'}});
    var vnode2 = h('i', {key: '2'});
    var vnode3 = h('i', {key: '1', style: {fontSize: '10px'}});
    patch(vnode0, vnode1);
    assert.equal(elm.style.fontSize, '14px');
    patch(vnode1, vnode2);
    assert.equal(elm.style.fontSize, '');
    patch(vnode2, vnode3);
    assert.equal(elm.style.fontSize, '10px');
  });
  it('implicially removes styles from child when parent element has key', function() {
    var vnode1 = h('div', {key: '1'}, [h('i', {style: {fontSize: '14px'}})]);
    var vnode2 = h('div', {key: '2'}, [h('i')]);
    var vnode3 = h('div', {key: '1'}, [h('i', {style: {fontSize: '10px'}})]);
    patch(vnode0, vnode1);
    assert.equal(elm.firstChild.style.fontSize, '14px');
    patch(vnode1, vnode2);
    assert.equal(elm.firstChild.style.fontSize, '');
    patch(vnode2, vnode3);
    assert.equal(elm.firstChild.style.fontSize, '10px');
  });
  it('updates delayed styles in next frame', function() {
    var patch = snabbdom.init([
      require('../modules/style'),
    ]);
    var vnode1 = h('i', {style: {fontSize: '14px', delayed: {fontSize: '16px'}}});
    var vnode2 = h('i', {style: {fontSize: '18px', delayed: {fontSize: '20px'}}});
    patch(vnode0, vnode1);
    assert.equal(elm.style.fontSize, '14px');
    fakeRaf.step();
    fakeRaf.step();
    assert.equal(elm.style.fontSize, '16px');
    patch(vnode1, vnode2);
    assert.equal(elm.style.fontSize, '18px');
    fakeRaf.step();
    fakeRaf.step();
    assert.equal(elm.style.fontSize, '20px');
  });
});

fakeRaf.restore();
