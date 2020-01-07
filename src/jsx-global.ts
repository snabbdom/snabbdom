import { VNode, VNodeData } from './vnode';

declare global {
  /**
   * opt-in jsx intrinsic global interfaces
   * see: https://www.typescriptlang.org/docs/handbook/jsx.html#type-checking
   */
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    type Element = VNode;
    interface IntrinsicElements {
      [elemName: string]: VNodeData;
    }
  }
}
