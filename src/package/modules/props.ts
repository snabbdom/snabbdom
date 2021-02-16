import { VNode, VNodeData } from "../vnode";
import { Module } from "./module";

export type Props = Record<string, any>;

function updateProps(oldVnode: VNode, vnode: VNode): void {
  let key: string;
  let cur: any;
  let old: any;
  const elm = vnode.elm;
  let oldProps = (oldVnode.data as VNodeData).props;
  let props = (vnode.data as VNodeData).props;

  if (!oldProps && !props) return;
  if (oldProps === props) return;
  oldProps = oldProps || {};
  props = props || {};

  for (key in props) {
    cur = props[key];
    old = oldProps[key];
    if (old !== cur && (key !== "value" || (elm as any)[key] !== cur)) {
      (elm as any)[key] = cur;
    }
  }
}

export const propsModule: Module = { create: updateProps, update: updateProps };
