import {VNode} from './interfaces';

function vnode(sel: string,
               data: any | undefined,
               children: Array<VNode | string> | undefined,
               text: string | undefined,
               elm: Element | Text | undefined): VNode {
  let key = data === undefined ? undefined : data.key;
  return {sel: sel, data: data, children: children,
          text: text, elm: elm, key: key};
}

export = vnode;
