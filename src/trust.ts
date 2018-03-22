import {VNode} from './vnode';
import * as is from './is';

export function trust(untrustedVNode: VNode): VNode {
  let trustedChildren;
  if (untrustedVNode.children !== undefined) {
    trustedChildren = untrustedVNode.children.map(untrustedChild => {
      if (is.primitive(untrustedChild)) {
        return untrustedChild;
      } else {
        return trust(untrustedChild);
      }
    });
  }

  return new VNode(
    untrustedVNode.sel, 
    untrustedVNode.data, 
    trustedChildren, 
    untrustedVNode.elm, 
    untrustedVNode.text, 
    untrustedVNode.key
  )
};

export default trust;