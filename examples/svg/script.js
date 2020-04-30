import * as snabbdom from '../../es/snabbdom.js';
import attributes from '../../es/modules/attributes.js';
import h from '../../es/h.js';

const patch = snabbdom.init([
  attributes
]);

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('container');
  const vnode = h('div', [
    h('svg', { attrs: { width: 100, height: 100 } }, [
      h('circle', { attrs: { cx: 50, cy: 50, r: 40, stroke: 'green', 'stroke-width': 4, fill: 'yellow' } })
    ])
  ]);
  patch(container, vnode);
});
