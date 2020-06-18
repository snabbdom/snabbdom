import { VNode, VNodeData } from '../vnode'
import { Module } from './module'

export type Props = Record<string, any>

function updateProps (oldVnode: VNode, vnode: VNode): void {
  var key: string
  var cur: any
  var old: any
  var elm = vnode.elm
  var oldProps = (oldVnode.data as VNodeData).props
  var props = (vnode.data as VNodeData).props

  if (!oldProps && !props) return
  if (oldProps === props) return
  oldProps = oldProps || {}
  props = props || {}

  for (key in props) {
    cur = props[key]
    old = oldProps[key]
    if (old !== cur && (key !== 'value' || (elm as any)[key] !== cur)) {
      (elm as any)[key] = cur
    }
  }
}

export const propsModule: Module = { create: updateProps, update: updateProps }
