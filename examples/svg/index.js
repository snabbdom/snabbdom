import { init } from '../../build/package/snabbdom.js'
import attrs from '../../build/package/modules/attributes.js'
import h from '../../build/package/h.js'

var patch = init([attrs])

window.addEventListener('DOMContentLoaded', () => {
  var container = document.getElementById('container')
  var vnode = h('div', [
    h('svg', { attrs: { width: 100, height: 100 } }, [
      h('circle', { attrs: { cx: 50, cy: 50, r: 40, stroke: 'green', 'stroke-width': 4, fill: 'yellow' } })
    ])
  ])
  patch(container, vnode)
})
