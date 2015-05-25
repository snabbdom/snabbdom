var assert = require('assert');

var snabbdom = require('../snabbdom');
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
});
