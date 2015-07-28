var assert = require('assert');

var snabbdom = require('../snabbdom');
var patch = snabbdom.init([
  require('../modules/eventlisteners.js'),
]);
var h = require('../h');

describe('event listeners', function() {
  var elm, vnode0;
  beforeEach(function() {
    elm = document.createElement('div');
    vnode0 = elm;
  });
  it('attaches click event handler to element', function() {
    var result = [];
    function clicked(ev) { result.push(ev); }
    var vnode = h('div', {on: {click: clicked}}, [
      h('a', 'Click my parent'),
    ]);
    patch(vnode0, vnode);
    elm.click();
    assert.equal(1, result.length);
  });
  it('does not attach new listener', function() {
    var result = [];
    //function clicked(ev) { result.push(ev); }
    var vnode1 = h('div', {on: {click: function(ev) { result.push(1); }}}, [
      h('a', 'Click my parent'),
    ]);
    var vnode2 = h('div', {on: {click: function(ev) { result.push(2); }}}, [
      h('a', 'Click my parent'),
    ]);
    patch(vnode0, vnode1);
    elm.click();
    patch(vnode1, vnode2);
    elm.click();
    assert.deepEqual(result, [1, 2]);
  });
  it('does calls handler for function in array', function() {
    var result = [];
    function clicked(ev) { result.push(ev); }
    var vnode = h('div', {on: {click: [clicked, 1]}}, [
      h('a', 'Click my parent'),
    ]);
    patch(vnode0, vnode);
    elm.click();
    assert.deepEqual(result, [1]);
  });
  it('handles changed value in array', function() {
    var result = [];
    function clicked(ev) { result.push(ev); }
    var vnode1 = h('div', {on: {click: [clicked, 1]}}, [
      h('a', 'Click my parent'),
    ]);
    var vnode2 = h('div', {on: {click: [clicked, 2]}}, [
      h('a', 'Click my parent'),
    ]);
    var vnode3 = h('div', {on: {click: [clicked, 3]}}, [
      h('a', 'Click my parent'),
    ]);
    patch(vnode0, vnode1);
    elm.click();
    patch(vnode1, vnode2);
    elm.click();
    patch(vnode2, vnode3);
    elm.click();
    assert.deepEqual(result, [1, 2, 3]);
  });
  it('handles changed several values in array', function() {
    var result = [];
    function clicked() { result.push([].slice.call(arguments)); }
    var vnode1 = h('div', {on: {click: [clicked, 1, 2, 3]}}, [
      h('a', 'Click my parent'),
    ]);
    var vnode2 = h('div', {on: {click: [clicked, 1, 2]}}, [
      h('a', 'Click my parent'),
    ]);
    var vnode3 = h('div', {on: {click: [clicked, 2, 3]}}, [
      h('a', 'Click my parent'),
    ]);
    patch(vnode0, vnode1);
    elm.click();
    patch(vnode1, vnode2);
    elm.click();
    patch(vnode2, vnode3);
    elm.click();
    assert.deepEqual(result, [[1, 2, 3], [1, 2], [2, 3]]);
  });
});
