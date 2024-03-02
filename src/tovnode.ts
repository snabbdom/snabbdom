import { addNS } from "./h";
import { vnode, VNode } from "./vnode";
import { htmlDomApi, DOMAPI } from "./htmldomapi";

/**
 * Transforms the given attribute name into a valid dataset property key
 * according to https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset#name_conversion
 *
 * @param attributeName data- attribute name, must start with data-
 */
function datasetKey(attributeName: string) {
  return attributeName
    .slice(5)
    .replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
}

export function toVNode(node: Node, domApi?: DOMAPI): VNode {
  const api: DOMAPI = domApi !== undefined ? domApi : htmlDomApi;
  let text: string;
  if (api.isElement(node)) {
    const id = node.id ? "#" + node.id : "";
    const cn = node.getAttribute("class")?.match(/[^\t\r\n\f ]+/g);
    const c = cn ? "." + cn.join(".") : "";
    const sel = api.tagName(node).toLowerCase() + id + c;
    const attrs: any = {};
    const dataset: Record<string, string> = {};
    const data: Record<string, any> = {};

    const children: VNode[] = [];
    let name: string;
    let i: number, n: number;
    const elmAttrs = node.attributes;
    const elmChildren = node.childNodes;
    for (i = 0, n = elmAttrs.length; i < n; i++) {
      name = elmAttrs[i].nodeName;
      if (name.startsWith("data-")) {
        dataset[datasetKey(name)] = elmAttrs[i].nodeValue || "";
      } else if (name !== "id" && name !== "class") {
        attrs[name] = elmAttrs[i].nodeValue;
      }
    }
    for (i = 0, n = elmChildren.length; i < n; i++) {
      children.push(toVNode(elmChildren[i], domApi));
    }

    if (Object.keys(attrs).length > 0) data.attrs = attrs;
    if (Object.keys(dataset).length > 0) data.dataset = dataset;

    if (
      sel.startsWith("svg") &&
      (sel.length === 3 || sel[3] === "." || sel[3] === "#")
    ) {
      addNS(data, children, sel);
    }
    return vnode(sel, data, children, undefined, node);
  } else if (api.isText(node)) {
    text = api.getTextContent(node) as string;
    return vnode(undefined, undefined, undefined, text, node);
  } else if (api.isComment(node)) {
    text = api.getTextContent(node) as string;
    return vnode("!", {}, [], text, node as any);
  } else {
    return vnode("", {}, [], undefined, node as any);
  }
}
