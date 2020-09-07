import { VNode as _VNode, VNodeData as _VNodeData } from './vnode'

// workaround
// https://github.com/typescript-eslint/typescript-eslint/issues/1596
type VNode = _VNode
type VNodeData = _VNodeData

/* eslint-disable @typescript-eslint/no-unused-vars */
declare global {
  /**
   * opt-in jsx intrinsic global interfaces
   * see: https://www.typescriptlang.org/docs/handbook/jsx.html#type-checking
   */
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    type Element = VNode
    interface IntrinsicElements {
      [elemName: string]: VNodeData
    }
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */
