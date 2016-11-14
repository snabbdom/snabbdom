var snabbdom = require('../../snabbdom.js');
var patch = snabbdom.init([
  require('../../modules/attributes').default,
]);
var h = require('../../h.js').default;

var vnode;

window.addEventListener('DOMContentLoaded', () => {
  var container = document.getElementById('container');
  var vnode = h('div', [
    h('svg', {attrs: {width: 100, height: 100}}, [
      h('circle', {attrs: {cx: 50, cy: 50, r: 40, stroke: 'green', 'stroke-width': 4, fill: 'yellow'}})
    ])
  ]);
  vnode = patch(container, vnode);
});
