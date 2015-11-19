var VNode = require('../vnode');
var is = require('../is');

function addNS(vnode) {
  vnode.data.ns = 'http://www.w3.org/2000/svg';
  if (vnode.children !== undefined) {
    for (var i = 0; i < vnode.children.length; ++i) {
      addNS(vnode.children[i]);
    }
  }
}

module.exports = function(b, c) {
  var data, children;
  if (arguments.length === 2) {
    data = b;
    children = c;
  } else if (is.array(b)) {
    children = b;
    data = {};
  } else {
    data = b;
    children = [];
  }
  var vnode = VNode('svg', data, children, undefined, undefined);
  addNS(vnode);
  return vnode;
};
