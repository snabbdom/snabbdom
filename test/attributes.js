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
    var vnode1 = h('div', {attrs: {href: '/foo', minlength: 1, selected: true, disabled: false}});
    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.getAttribute('href'), '/foo');
    assert.strictEqual(elm.getAttribute('minlength'), '1');
    assert.strictEqual(elm.hasAttribute('selected'), true);
    assert.strictEqual(elm.getAttribute('selected'), '');
    assert.strictEqual(elm.hasAttribute('disabled'), false);
  });
  it('can be memoized', function() {
    var cachedAttrs = {href: '/foo', minlength: 1, selected: true};
    var vnode1 = h('div', {attrs: cachedAttrs});
    var vnode2 = h('div', {attrs: cachedAttrs});
    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.getAttribute('href'), '/foo');
    assert.strictEqual(elm.getAttribute('minlength'), '1');
    assert.strictEqual(elm.getAttribute('selected'), '');
    elm = patch(vnode1, vnode2).elm;
    assert.strictEqual(elm.getAttribute('href'), '/foo');
    assert.strictEqual(elm.getAttribute('minlength'), '1');
    assert.strictEqual(elm.getAttribute('selected'), '');
  });
  it('are not omitted when falsy values are provided', function() {
    var vnode1 = h('div', {attrs: {href: null, minlength: 0, value: '', title:'undefined'}});
    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.getAttribute('href'), 'null');
    assert.strictEqual(elm.getAttribute('minlength'), '0');
    assert.strictEqual(elm.getAttribute('value'), '');
    assert.strictEqual(elm.getAttribute('title'), 'undefined');
  });
  it('are set correctly when namespaced', function() {
    var vnode1 = h('div', {attrs: {'xlink:href': '#foo'}});
    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.getAttributeNS('http://www.w3.org/1999/xlink', 'href'), '#foo');
  });
  it('should not touch class nor id fields', function() {
    elm = document.createElement('div');
    elm.id = 'myId';
    elm.className = 'myClass';
    vnode0 = elm;
    var vnode1 = h('div#myId.myClass', {attrs: {}}, ['Hello']);
    elm = patch(vnode0, vnode1).elm;
    assert.strictEqual(elm.tagName, 'DIV');
    assert.strictEqual(elm.id, 'myId');
    assert.strictEqual(elm.className, 'myClass');
    assert.strictEqual(elm.textContent, 'Hello');
  });
  describe('boolean attribute', function() {
    it('is present and empty string if the value is truthy', function() {
      var vnode1 = h('div', {attrs: {required: true, readonly: 1, noresize: 'truthy'}});
      elm = patch(vnode0, vnode1).elm;
      assert.strictEqual(elm.hasAttribute('required'), true);
      assert.strictEqual(elm.getAttribute('required'), '');
      assert.strictEqual(elm.hasAttribute('readonly'), true);
      assert.strictEqual(elm.getAttribute('readonly'), '1');
      assert.strictEqual(elm.hasAttribute('noresize'), true);
      assert.strictEqual(elm.getAttribute('noresize'), 'truthy');
    });
    it('is omitted if the value is false', function() {
      var vnode1 = h('div', {attrs: {required: false}});
      elm = patch(vnode0, vnode1).elm;
      assert.strictEqual(elm.hasAttribute('required'), false);
      assert.strictEqual(elm.getAttribute('required'), null);
    });
    it('is not omitted if the value is falsy but casted to string', function() {
      var vnode1 = h('div', {attrs: {readonly: 0, noresize: null}});
      elm = patch(vnode0, vnode1).elm;
      assert.strictEqual(elm.getAttribute('readonly'), '0');
      assert.strictEqual(elm.getAttribute('noresize'), 'null');
    });
  });
  describe('Object.prototype property', function() {
    it('is not considered as a boolean attribute and shouldn\'t be omitted', function() {
      var vnode1 = h('div', {attrs: {constructor: true}});
      elm = patch(vnode0, vnode1).elm;
      assert.strictEqual(elm.hasAttribute('constructor'), true);
      assert.strictEqual(elm.getAttribute('constructor'), '');
      var vnode2 = h('div', {attrs: {constructor: false}});
      elm = patch(vnode0, vnode2).elm;
      assert.strictEqual(elm.hasAttribute('constructor'), false);
    });
  });
});
