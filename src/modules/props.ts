import { VNode, VNodeData } from "../vnode";
import { Module } from "./module";

export type Props = Record<string, any>;

function updateProps(oldVnode: VNode, vnode: VNode): void {
  let key: string;
  let cur: any;
  let old: any;
  let shouldUpdate: boolean;
  const elm = vnode.elm;
  let oldProps = (oldVnode.data as VNodeData).props;
  let props = (vnode.data as VNodeData).props;

  if (!oldProps && !props)
    return;

  if (oldProps === props)
    return;

  oldProps = oldProps || {};
  props = props || {};

  for (key in props) {
    cur = props[key];
    old = oldProps[key];

    shouldUpdate = false;

    // DOM INPUT.value should never be updated when it matches the new vnode.
    // typing into an INPUT with a sync event handler cause a render (such as for
    // validation feedback) where setting INPUT.value also pushes the cursor to the end
    // of the input. fixes #71, partially fixes #63
    if (key === 'value')
      shouldUpdate = (old !== cur) && ((elm as any)[key] !== cur);

    // DOM INPUT.checked is a boolean property. The element's internal value should be
    // used for comparison. fixes #950
    else if (key === 'checked')
      shouldUpdate = (elm as any)[key] !== cur;

    else
      shouldUpdate = (old !== cur);


    if (shouldUpdate)
      (elm as any)[key] = cur;
  }
}

export const propsModule: Module = { create: updateProps, update: updateProps };
