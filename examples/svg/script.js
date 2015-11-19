var snabbdom = require('../../snabbdom.js');
var patch = snabbdom.init([
  require('../../modules/attributes'),
]);
var h = require('../../h.js');
var svg = require('../../helpers/svg.js');

var vnode;

window.addEventListener('DOMContentLoaded', () => {
  var container = document.getElementById('container');
  var vnode = h('div', [
    svg({attrs: {width: 100, height: 100}}, [
      h('circle', {attrs: {cx: 50, cy: 50, r: 40, stroke: 'green', 'stroke-width': 4, fill: 'yellow'}})
    ])
  ]);
  console.log(vnode);
  vnode = patch(container, vnode);
});
