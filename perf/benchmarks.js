var Benchmark = require('benchmark');
var a = require('../snabbdom.js');
var b = require('../oldsnabbdom.js');

global.a = a;
global.b = b;

var suite = new Benchmark.Suite();

a.spanNum = function spanNum(n) {
  return a.h('span', {key: n}, n.toString());
};

b.spanNum = function spanNum(n) {
  return b.h('span', {key: n}, n.toString());
};

var elms = global.elms = 10;
var arr = global.arr = [];
for (var n = 0; n < elms; ++n) { arr[n] = n; }

document.addEventListener('DOMContentLoaded', function() {
  var elm = global.elm = document.getElementById('container');
  // add tests
  suite.add('a/ insert first', {
    setup: function() {
      var vnode1 = a.h('div', arr.map(a.spanNum));
      var vnode2 = a.h('div', ['new'].concat(arr).map(a.spanNum));
    },
    fn: function() {
      var emptyNode = a.emptyNodeAt(elm);
      a.patch(emptyNode, vnode1);
      a.patch(vnode1, vnode2);
      a.patch(vnode2, a.emptyNode);
    },
  })
  .add('b/ insert first', {
    setup: function() {
      var vnode1 = b.h('div', arr.map(b.spanNum));
      var vnode2 = b.h('div', ['new'].concat(arr).map(b.spanNum));
    },
    fn: function() {
      var emptyNode = b.emptyNodeAt(elm);
      b.patch(emptyNode, vnode1);
      b.patch(vnode1, vnode2);
      b.patch(vnode2, b.emptyNode);
    },
  })
  // add listeners
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  })
  // run async
  .run({async: true});
});
