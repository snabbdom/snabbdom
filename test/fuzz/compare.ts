import { VNode } from "../../src/index";

export type Mismatch = {
  /** Path of the vnode in the generated tree, e.g. `root[2][0]`. */
  vnodePath: string;
  /** Path of the DOM node among its siblings, e.g. `dom[3]`. */
  domPath: string;
  message: string;
  /** Expected siblings at the level where the mismatch was found. */
  expected: string[];
  /** Actual DOM siblings at the level where the mismatch was found. */
  actual: string[];
  /** Index of the mismatching node within both lists. */
  index: number;
};

export function isFragmentVNode(vnode: VNode): boolean {
  return vnode.sel === undefined && vnode.children !== undefined;
}

export function describeVNode(vnode: VNode): string {
  if (vnode.sel === "!") {
    return `<!--${vnode.text ?? ""}-->`;
  }
  if (vnode.sel === undefined) {
    return vnode.children !== undefined
      ? "<fragment>"
      : `text ${JSON.stringify(vnode.text)}`;
  }
  const parts = [`<${vnode.sel}`];
  const data = vnode.data ?? {};
  if (data.key !== undefined) parts.push(`key=${String(data.key)}`);
  const attrs = (data.attrs ?? {}) as Record<string, string>;
  for (const name in attrs) parts.push(`${name}="${attrs[name]}"`);
  const classes = (data.class ?? {}) as Record<string, boolean>;
  const classNames = Object.keys(classes).filter((name) => classes[name]);
  if (classNames.length > 0) parts.push(`class="${classNames.join(" ")}"`);
  const props = (data.props ?? {}) as Record<string, unknown>;
  for (const name in props) {
    parts.push(`${name}=${JSON.stringify(props[name])}`);
  }
  parts.push(">");
  return parts.join(" ");
}

export function describeDomNode(node: Node): string {
  if (node.nodeType === 1) {
    const elm = node as Element;
    const parts = [`<${elm.tagName.toLowerCase()}`];
    for (const attr of Array.from(elm.attributes)) {
      parts.push(`${attr.name}="${attr.value}"`);
    }
    parts.push(">");
    return parts.join(" ");
  }
  if (node.nodeType === 3) return `text ${JSON.stringify(node.textContent)}`;
  if (node.nodeType === 8) return `<!--${node.textContent ?? ""}-->`;
  return `node of type ${node.nodeType}`;
}

function expectedLabels(vnodes: VNode[], path: string): string[] {
  const out: string[] = [];
  const walk = (list: VNode[], listPath: string): void => {
    for (let i = 0; i < list.length; i++) {
      const vnode = list[i];
      if (vnode === undefined || vnode === null) continue;
      const childPath = `${listPath}[${i}]`;
      if (isFragmentVNode(vnode)) {
        walk(vnode.children as VNode[], childPath);
        continue;
      }
      out.push(`${childPath} ${describeVNode(vnode)}`);
    }
  };
  walk(vnodes, path);
  return out;
}

function actualLabels(domParent: Node, path: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < domParent.childNodes.length; i++) {
    out.push(`${path}[${i}] ${describeDomNode(domParent.childNodes[i])}`);
  }
  return out;
}

function mark(items: string[], index: number): string[] {
  return items.map((item, i) => (i === index ? ">> " + item : "   " + item));
}

/**
 * Compares a node and, for elements, its children with the DOM. Returns a
 * message for a difference at this node, a full mismatch from a nested level,
 * or `null` when the subtree matches.
 */
function diffNode(
  domNode: Node,
  vnode: VNode,
  vnodePath: string,
  domPath: string
): string | Mismatch | null {
  if (vnode.sel === undefined) {
    if (domNode.nodeType !== 3) {
      return `expected text ${JSON.stringify(vnode.text)}, found ${describeDomNode(domNode)}`;
    }
    if (domNode.textContent !== vnode.text) {
      return `expected text ${JSON.stringify(vnode.text)}, found ${JSON.stringify(domNode.textContent)}`;
    }
    return null;
  }

  if (vnode.sel === "!") {
    const expected = vnode.text ?? "";
    if (domNode.nodeType !== 8 || domNode.textContent !== expected) {
      return `expected comment ${JSON.stringify(expected)}, found ${describeDomNode(domNode)}`;
    }
    return null;
  }

  if (domNode.nodeType !== 1) {
    return `expected <${vnode.sel}>, found ${describeDomNode(domNode)}`;
  }

  const elm = domNode as Element;
  const tagName = elm.tagName.toLowerCase();
  if (tagName !== vnode.sel) {
    return `expected <${vnode.sel}>, found <${tagName}>`;
  }

  const data = vnode.data ?? {};
  const attrs = (data.attrs ?? {}) as Record<string, string>;
  for (const name in attrs) {
    const value = elm.getAttribute(name);
    if (value !== attrs[name]) {
      return `attribute ${name}: expected ${JSON.stringify(attrs[name])}, found ${JSON.stringify(value)}`;
    }
  }
  for (const attr of Array.from(elm.attributes)) {
    if (attr.name.startsWith("data-") && attrs[attr.name] === undefined) {
      return `unexpected attribute ${attr.name}=${JSON.stringify(attr.value)}`;
    }
  }

  const classes = (data.class ?? {}) as Record<string, boolean>;
  const expectedClasses = Object.keys(classes)
    .filter((name) => classes[name])
    .sort();
  const actualClasses = (elm.getAttribute("class") ?? "")
    .split(/\s+/)
    .filter((name) => name !== "")
    .sort();
  if (expectedClasses.join(" ") !== actualClasses.join(" ")) {
    return `class: expected ${JSON.stringify(expectedClasses.join(" "))}, found ${JSON.stringify(actualClasses.join(" "))}`;
  }

  const props = (data.props ?? {}) as Record<string, unknown>;
  for (const name in props) {
    const expected = String(props[name]);
    const actual = String((elm as unknown as Record<string, unknown>)[name]);
    if (expected !== actual) {
      return `property ${name}: expected ${JSON.stringify(expected)}, found ${JSON.stringify(actual)}`;
    }
  }

  return compareChildren(
    elm,
    (vnode.children ?? []) as VNode[],
    vnodePath,
    domPath
  );
}

/**
 * Walks the vnode tree and the DOM tree in parallel. Fragments render no DOM
 * node of their own, so their children are compared inline with their siblings.
 */
export function compareChildren(
  domParent: Node,
  children: VNode[],
  vnodePath: string,
  domPath: string
): Mismatch | null {
  let domIndex = 0;

  const fail = (
    childPath: string,
    childDomPath: string,
    message: string
  ): Mismatch => ({
    vnodePath: childPath,
    domPath: childDomPath,
    message,
    expected: mark(expectedLabels(children, vnodePath), domIndex),
    actual: mark(actualLabels(domParent, domPath), domIndex),
    index: domIndex
  });

  const walk = (vnodes: VNode[], path: string): Mismatch | null => {
    for (let i = 0; i < vnodes.length; i++) {
      const vnode = vnodes[i];
      if (vnode === undefined || vnode === null) continue;
      const childPath = `${path}[${i}]`;
      if (isFragmentVNode(vnode)) {
        const inner = walk(vnode.children as VNode[], childPath);
        if (inner !== null) return inner;
        continue;
      }
      const domNode = domParent.childNodes[domIndex];
      const childDomPath = `${domPath}[${domIndex}]`;
      if (domNode === undefined) {
        return fail(
          childPath,
          childDomPath,
          `missing DOM node, expected ${describeVNode(vnode)}`
        );
      }
      const result = diffNode(domNode, vnode, childPath, childDomPath);
      if (typeof result === "string") {
        return fail(childPath, childDomPath, result);
      }
      if (result !== null) return result;
      domIndex++;
    }
    return null;
  };

  const result = walk(children, vnodePath);
  if (result !== null) return result;

  if (domIndex !== domParent.childNodes.length) {
    return fail(
      vnodePath,
      `${domPath}[${domIndex}]`,
      `expected ${domIndex} DOM nodes, found ${domParent.childNodes.length}` +
        (domParent.childNodes[domIndex] === undefined
          ? ""
          : `, extra node ${describeDomNode(domParent.childNodes[domIndex])}`)
    );
  }
  return null;
}
function marker(path: string, highlight: string | undefined): string {
  return path === highlight ? ">> " : "   ";
}

export function dumpVNodeTree(children: VNode[], highlight?: string): string {
  const lines: string[] = [];
  const walk = (vnodes: VNode[], path: string, indent: string): void => {
    for (let i = 0; i < vnodes.length; i++) {
      const vnode = vnodes[i];
      const childPath = `${path}[${i}]`;
      if (vnode === undefined || vnode === null) {
        lines.push(
          `${marker(childPath, highlight)}${indent}${childPath} (empty)`
        );
        continue;
      }
      lines.push(
        `${marker(childPath, highlight)}${indent}${childPath} ${describeVNode(vnode)}`
      );
      if (vnode.children !== undefined) {
        walk(vnode.children as VNode[], childPath, indent + "  ");
      }
    }
  };
  walk(children, "root", "");
  return lines.join("\n");
}

export function dumpDomTree(root: Node, highlight?: string): string {
  const lines: string[] = [];
  const walk = (parent: Node, path: string, indent: string): void => {
    for (let i = 0; i < parent.childNodes.length; i++) {
      const node = parent.childNodes[i];
      const childPath = `${path}[${i}]`;
      lines.push(
        `${marker(childPath, highlight)}${indent}${childPath} ${describeDomNode(node)}`
      );
      walk(node, childPath, indent + "  ");
    }
  };
  walk(root, "dom", "");
  return lines.join("\n");
}
