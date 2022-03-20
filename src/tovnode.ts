import { addNS } from "./h";
import { vnode, VNode } from "./vnode";
import { htmlDomApi, DOMAPI } from "./htmldomapi";

export function toVNode(node: Node, domApi?: DOMAPI): VNode {
  const api: DOMAPI = domApi !== undefined ? domApi : htmlDomApi;
  let text: string;
  if (api.isElement(node)) {
    const id = node.id ? "#" + node.id : "";
    const cn = node.getAttribute("class");
    const c = cn ? "." + cn.split(" ").join(".") : "";
    const sel = api.tagName(node).toLowerCase() + id + c;
    const attrs: any = {};
    const datasets: Record<string, string> = {};
    const data: Record<string, any> = {};

    const children: VNode[] = [];
    let name: string;
    let i: number, n: number;
    const elmAttrs = node.attributes;
    const elmChildren = node.childNodes;
    for (i = 0, n = elmAttrs.length; i < n; i++) {
      name = elmAttrs[i].nodeName;
      if (
        name[0] === "d" &&
        name[1] === "a" &&
        name[2] === "t" &&
        name[3] === "a" &&
        name[4] === "-"
      ) {
        datasets[name.slice(5)] = elmAttrs[i].nodeValue || "";
      } else if (name !== "id" && name !== "class") {
        attrs[name] = elmAttrs[i].nodeValue;
      }
    }
    for (i = 0, n = elmChildren.length; i < n; i++) {
      children.push(toVNode(elmChildren[i], domApi));
    }

    if (Object.keys(attrs).length > 0) data.attrs = attrs;
    if (Object.keys(datasets).length > 0) data.datasets = datasets;

    if (
      sel[0] === "s" &&
      sel[1] === "v" &&
      sel[2] === "g" &&
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
