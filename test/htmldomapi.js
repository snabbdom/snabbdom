var assert = require('assert');

var snabbdom = require('../snabbdom');
var h = snabbdom.h;
var patch = snabbdom.init([]);

describe('svg', function () {
 var elm, vnode0;
 beforeEach(function() {
   elm = document.createElement('svg');
   vnode0 = elm;
 });
 it('removes child svg elements', function(){
   var a = h('svg', {}, [
    h('g'),
    h('g')
   ]);
   var b = h('svg', {}, [
    h('g')
   ]);
   var result = patch(patch(vnode0, a), b).elm;
   assert.equal(result.childNodes.length, 1); 
 });
})