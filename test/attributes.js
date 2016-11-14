var assert = require('assert');

var snabbdom = require('../snabbdom');
var patch = snabbdom.init([
  require('../modules/attributes').default,
]);
var h = require('../h').default;

describe('attributes', function() {
  var elm, vnode0;
  beforeEach(function() {
    elm = document.createElement('div');
    vnode0 = elm;
  });
  it('have their provided values', function() {
    var vnode1 = h('div', {attrs: {href: '/foo', minlength: 1, value: true}});
    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.getAttribute('href'), '/foo');
    assert.strictEqual(elm.getAttribute('minlength'), '1');
    assert.strictEqual(elm.getAttribute('value'), 'true');
  });
  it('are not omitted when falsy values are provided', function() {
    var vnode1 = h('div', {attrs: {href: null, minlength: 0, value: false}});
    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.getAttribute('href'), 'null');
    assert.strictEqual(elm.getAttribute('minlength'), '0');
    assert.strictEqual(elm.getAttribute('value'), 'false');
  });
  it('are set correctly when namespaced', function() {
    var vnode1 = h('div', {attrs: {'xlink:href': '#foo'}});
    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.getAttributeNS('http://www.w3.org/1999/xlink', 'href'), '#foo');
  });
  describe('boolean attribute', function() {
    it('is present if the value is truthy', function() {
      var vnode1 = h('div', {attrs: {required: true, readonly: 1, noresize: 'truthy'}});
      elm = patch(vnode0, vnode1).elm;
      assert.strictEqual(elm.getAttribute('required'), 'true');
      assert.strictEqual(elm.getAttribute('readonly'), '1');
      assert.strictEqual(elm.getAttribute('noresize'), 'truthy');
    });
    it('is omitted if the value is falsy', function() {
      var vnode1 = h('div', {attrs: {required: false, readonly: 0, noresize: null}});
      elm = patch(vnode0, vnode1).elm;
      assert.strictEqual(elm.getAttribute('required'), null);
      assert.strictEqual(elm.getAttribute('readonly'), null);
      assert.strictEqual(elm.getAttribute('noresize'), null);
    });
  });
  describe('Object.prototype property', function() {
    it('is not considered as a boolean attribute and shouldn\'t be omitted', function() {
      var vnode1 = h('div', {attrs: {valueOf: true, toString: 1, constructor: 'truthy'}});
      elm = patch(vnode0, vnode1).elm;
      assert.strictEqual(elm.getAttribute('valueOf'), 'true');
      assert.strictEqual(elm.getAttribute('toString'), '1');
      assert.strictEqual(elm.getAttribute('constructor'), 'truthy');
      var vnode2 = h('div', {attrs: {valueOf: false, toString: 0, constructor: null}});
      elm = patch(vnode0, vnode2).elm;
      assert.strictEqual(elm.getAttribute('valueOf'), 'false');
      assert.strictEqual(elm.getAttribute('toString'), '0');
      assert.strictEqual(elm.getAttribute('constructor'), 'null');
    })
  });
});
