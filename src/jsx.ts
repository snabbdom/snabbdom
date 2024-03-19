/* eslint-disable @typescript-eslint/no-namespace, import/export */
import { Key, vnode, VNode, VNodeData } from "./vnode";
import { h, ArrayOrElement } from "./h";
import { Props } from "./modules/props";

// for conditional rendering we support boolean child element e.g cond && <tag />
export type JsxVNodeChild =
  | VNode
  | string
  | number
  | boolean
  | undefined
  | null;
export type JsxVNodeChildren = ArrayOrElement<JsxVNodeChild>;

export type FunctionComponent = (
  props: { [prop: string]: any } | null,
  children?: VNode[]
) => VNode;

export function Fragment(
  data: { key?: Key } | null,
  ...children: JsxVNodeChildren[]
): VNode {
  const flatChildren = flattenAndFilter(children, []);

  if (
    flatChildren.length === 1 &&
    !flatChildren[0].sel &&
    flatChildren[0].text
  ) {
    // only child is a simple text node, pass as text for a simpler vtree
    return vnode(
      undefined,
      undefined,
      undefined,
      flatChildren[0].text,
      undefined
    );
  } else {
    return vnode(undefined, data ?? {}, flatChildren, undefined, undefined);
  }
}

function flattenAndFilter(
  children: JsxVNodeChildren[],
  flattened: VNode[]
): VNode[] {
  for (const child of children) {
    // filter out falsey children, except 0 since zero can be a valid value e.g inside a chart
    if (
      child !== undefined &&
      child !== null &&
      child !== false &&
      child !== ""
    ) {
      if (Array.isArray(child)) {
        flattenAndFilter(child, flattened);
      } else if (
        typeof child === "string" ||
        typeof child === "number" ||
        typeof child === "boolean"
      ) {
        flattened.push(
          vnode(undefined, undefined, undefined, String(child), undefined)
        );
      } else {
        flattened.push(child);
      }
    }
  }
  return flattened;
}

/**
 * jsx/tsx compatible factory function
 * see: https://www.typescriptlang.org/docs/handbook/jsx.html#factory-functions
 */
export function jsx(
  tag: string | FunctionComponent,
  data: VNodeData | null,
  ...children: JsxVNodeChildren[]
): VNode {
  const flatChildren = flattenAndFilter(children, []);
  if (typeof tag === "function") {
    // tag is a function component
    return tag(data, flatChildren);
  } else {
    if (
      flatChildren.length === 1 &&
      !flatChildren[0].sel &&
      flatChildren[0].text
    ) {
      // only child is a simple text node, pass as text for a simpler vtree
      return h(tag, data, flatChildren[0].text);
    } else {
      return h(tag, data, flatChildren);
    }
  }
}

// See https://www.typescriptlang.org/docs/handbook/jsx.html#type-checking
namespace JSXTypes {
  export type Element = VNode;

  /*
  IfEquals/WritableKeys: https://stackoverflow.com/questions/52443276/how-to-exclude-getter-only-properties-from-type-in-typescript/52473108#52473108
  */
  export type IfEquals<X, Y, Output> = (<T>() => T extends X ? 1 : 2) extends <
    T
  >() => T extends Y ? 1 : 2
    ? Output
    : never;

  export type WritableKeys<T> = {
    [P in keyof T]-?: IfEquals<
      { [Q in P]: T[P] },
      { -readonly [Q in P]: T[P] },
      P
    >;
  }[keyof T];

  export type ElementProperties<T> = {
    [Property in WritableKeys<T> as T[Property] extends
      | string
      | number
      | null
      | undefined
      ? Property
      : never]?: T[Property];
  };

  export type VNodeProps<T> = ElementProperties<T> & Props;

  export type HtmlElements = {
    [Property in keyof HTMLElementTagNameMap]: VNodeData<
      VNodeProps<HTMLElementTagNameMap[Property]>
    >;
  };

  export interface IntrinsicElements extends HtmlElements {
    [elemName: string]: VNodeData;
  }
}

export namespace jsx {
  export namespace JSX {
    export interface IntrinsicElements extends JSXTypes.IntrinsicElements {}
  }
}
