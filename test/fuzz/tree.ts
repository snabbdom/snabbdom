import { h, fragment, vnode, VNode, VNodeData } from "../../src/index";
import { Rng } from "./random";

export type GenerateOptions = {
  /** Deepest allowed nesting level of a node, the root children being level 1. */
  maxDepth: number;
  /** Most children a single parent may have. */
  maxSiblings: number;
  /** Inclusive range of patch rounds a single test performs. */
  rounds: [number, number];
};

export type TextSpec = { kind: "text"; text: string };
export type CommentSpec = { kind: "comment"; text: string };
export type ElementSpec = {
  kind: "element";
  sel: string;
  key?: string;
  attrs?: Record<string, string>;
  class?: Record<string, boolean>;
  props?: Record<string, string | boolean>;
  children: Spec[];
};
export type FragmentSpec = { kind: "fragment"; key?: string; children: Spec[] };
export type Spec = TextSpec | CommentSpec | ElementSpec | FragmentSpec;

const CONTAINER_TAGS = [
  "div",
  "span",
  "p",
  "b",
  "i",
  "em",
  "section",
  "article",
  "ul",
  "li",
  "header",
  "main",
  "label"
];
const VOID_TAGS = ["input"];
const ATTR_NAMES = ["data-a", "data-b", "data-c", "data-d"];
const ATTR_VALUES = ["1", "2", "x", "y", "z"];
const CLASS_NAMES = ["a", "b", "c", "d", "e"];
const TEXT_VALUES = ["alpha", "beta", "gamma", "delta", "epsilon", "zeta"];

function keyOf(spec: Spec): string | undefined {
  return spec.kind === "element" || spec.kind === "fragment"
    ? spec.key
    : undefined;
}

function withChildren(spec: Spec): spec is ElementSpec | FragmentSpec {
  return spec.kind === "element" || spec.kind === "fragment";
}

function randomKey(rng: Rng, siblings: Spec[]): string | undefined {
  if (!rng.bool(0.5)) return undefined;
  const used = new Set<string>();
  for (const sibling of siblings) {
    const key = keyOf(sibling);
    if (key !== undefined) used.add(key);
  }
  for (let attempt = 0; attempt < 32; attempt++) {
    const key = "k" + rng.int(1000);
    if (!used.has(key)) return key;
  }
  return undefined;
}

function randomAttrs(rng: Rng): Record<string, string> {
  const attrs: Record<string, string> = {};
  const count = rng.range(0, 2);
  for (let i = 0; i < count; i++) {
    attrs[rng.pick(ATTR_NAMES)] = rng.pick(ATTR_VALUES);
  }
  return attrs;
}

function randomClasses(rng: Rng): Record<string, boolean> {
  const classes: Record<string, boolean> = {};
  const count = rng.range(1, 3);
  for (let i = 0; i < count; i++) {
    classes[rng.pick(CLASS_NAMES)] = true;
  }
  return classes;
}

function randomProps(
  rng: Rng,
  sel: string
): Record<string, string | boolean> | undefined {
  if (sel === "input") {
    return rng.bool()
      ? { value: rng.pick(ATTR_VALUES) }
      : { disabled: rng.bool() };
  }
  if (sel === "label") {
    return { htmlFor: rng.pick(ATTR_VALUES) };
  }
  return undefined;
}

export function generateNode(
  rng: Rng,
  depth: number,
  options: GenerateOptions,
  siblings: Spec[] = []
): Spec {
  const roll = rng.int(100);
  if (depth > options.maxDepth || roll < 12) {
    return roll < 4
      ? { kind: "comment", text: "c" + rng.int(10) }
      : { kind: "text", text: rng.pick(TEXT_VALUES) + ":" + depth };
  }
  const key = randomKey(rng, siblings);
  if (roll < 30) {
    const spec: FragmentSpec = { kind: "fragment", children: [] };
    if (key !== undefined) spec.key = key;
    if (depth < options.maxDepth) {
      const count = rng.range(0, Math.min(options.maxSiblings, 4));
      for (let i = 0; i < count; i++) {
        spec.children.push(
          generateNode(rng, depth + 1, options, spec.children)
        );
      }
    }
    return spec;
  }
  const sel = rng.bool(0.9) ? rng.pick(CONTAINER_TAGS) : rng.pick(VOID_TAGS);
  const spec: ElementSpec = { kind: "element", sel, children: [] };
  if (key !== undefined) spec.key = key;
  if (rng.bool(0.5)) spec.attrs = randomAttrs(rng);
  if (rng.bool(0.3)) spec.class = randomClasses(rng);
  if (rng.bool(0.2)) spec.props = randomProps(rng, sel);
  if (depth < options.maxDepth && !VOID_TAGS.includes(sel)) {
    spec.children = generateChildren(rng, depth + 1, options);
  }
  return spec;
}

export function generateChildren(
  rng: Rng,
  depth: number,
  options: GenerateOptions
): Spec[] {
  const count = rng.range(0, options.maxSiblings);
  const children: Spec[] = [];
  for (let i = 0; i < count; i++) {
    children.push(generateNode(rng, depth, options, children));
  }
  return children;
}

function cloneSpec(spec: Spec): Spec {
  switch (spec.kind) {
    case "text":
      return { kind: "text", text: spec.text };
    case "comment":
      return { kind: "comment", text: spec.text };
    case "fragment": {
      const clone: FragmentSpec = {
        kind: "fragment",
        children: spec.children.map(cloneSpec)
      };
      if (spec.key !== undefined) clone.key = spec.key;
      return clone;
    }
    case "element": {
      const clone: ElementSpec = {
        kind: "element",
        sel: spec.sel,
        children: spec.children.map(cloneSpec)
      };
      if (spec.key !== undefined) clone.key = spec.key;
      if (spec.attrs !== undefined) clone.attrs = { ...spec.attrs };
      if (spec.class !== undefined) clone.class = { ...spec.class };
      if (spec.props !== undefined) clone.props = { ...spec.props };
      return clone;
    }
  }
}

function cloneChildren(children: Spec[]): Spec[] {
  return children.map(cloneSpec);
}

export function heightOf(spec: Spec): number {
  if (!withChildren(spec)) return 1;
  let height = 1;
  for (const child of spec.children) {
    height = Math.max(height, 1 + heightOf(child));
  }
  return height;
}

type ContainerRef = { children: Spec[]; path: string; depth: number };
type NodeRef = {
  node: Spec;
  siblings: Spec[];
  index: number;
  path: string;
  depth: number;
  containerPath: string;
};

function collectContainers(
  children: Spec[],
  path: string,
  depth: number,
  out: ContainerRef[]
): ContainerRef[] {
  out.push({ children, path, depth });
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    if (withChildren(node)) {
      collectContainers(node.children, `${path}[${i}]`, depth + 1, out);
    }
  }
  return out;
}

function collectNodes(
  children: Spec[],
  path: string,
  depth: number,
  containerPath: string,
  out: NodeRef[]
): NodeRef[] {
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    const nodePath = `${path}[${i}]`;
    out.push({
      node,
      siblings: children,
      index: i,
      path: nodePath,
      depth,
      containerPath
    });
    if (withChildren(node)) {
      collectNodes(node.children, nodePath, depth + 1, nodePath, out);
    }
  }
  return out;
}

export function describeSpec(spec: Spec): string {
  switch (spec.kind) {
    case "text":
      return `text ${JSON.stringify(spec.text)}`;
    case "comment":
      return `comment ${JSON.stringify(spec.text)}`;
    case "fragment":
      return spec.key === undefined
        ? "<fragment>"
        : `<fragment key=${spec.key}>`;
    case "element":
      return `<${spec.sel}${spec.key === undefined ? "" : ` key=${spec.key}`}>`;
  }
}

const OPERATIONS = ["add", "remove", "move", "update"] as const;
export type Operation = (typeof OPERATIONS)[number];

export type Mutation = {
  operation: Operation;
  detail: string;
  children: Spec[];
};

function applyAdd(
  rng: Rng,
  root: Spec[],
  options: GenerateOptions
): Mutation | null {
  const containers = collectContainers(root, "root", 0, []).filter(
    (container) =>
      container.children.length < options.maxSiblings &&
      container.depth < options.maxDepth
  );
  if (containers.length === 0) return null;
  const container = rng.pick(containers);
  const index = rng.int(container.children.length + 1);
  const node = generateNode(
    rng,
    container.depth + 1,
    options,
    container.children
  );
  container.children.splice(index, 0, node);
  return {
    operation: "add",
    detail: `add ${describeSpec(node)} at ${container.path}[${index}]`,
    children: root
  };
}

function applyRemove(rng: Rng, root: Spec[]): Mutation | null {
  const nodes = collectNodes(root, "root", 1, "root", []);
  if (nodes.length === 0) return null;
  const target = rng.pick(nodes);
  target.siblings.splice(target.index, 1);
  return {
    operation: "remove",
    detail: `remove ${describeSpec(target.node)} at ${target.path}`,
    children: root
  };
}

function applyMove(
  rng: Rng,
  root: Spec[],
  options: GenerateOptions
): Mutation | null {
  const nodes = collectNodes(root, "root", 1, "root", []);
  if (nodes.length === 0) return null;
  const source = rng.pick(nodes);
  const height = heightOf(source.node);
  const containers = collectContainers(root, "root", 0, []).filter(
    (container) =>
      !container.path.startsWith(source.path + "[") &&
      container.depth + height <= options.maxDepth &&
      // Moving within the same parent does not add a child to it.
      (container.path === source.containerPath ||
        container.children.length < options.maxSiblings)
  );
  if (containers.length === 0) return null;
  const target = rng.pick(containers);
  const sameParent = target.path === source.containerPath;
  // In the same parent, inserting at the index the node came from or at the
  // one right after it leaves the children as they were.
  const lastIndex = sameParent
    ? target.children.length - 1
    : target.children.length;
  const positions: number[] = [];
  for (let i = 0; i <= lastIndex; i++) {
    if (sameParent && (i === source.index || i === source.index + 1)) continue;
    positions.push(i);
  }
  if (positions.length === 0) return null;
  const index = rng.pick(positions);
  source.siblings.splice(source.index, 1);
  const siblings = target.children;
  if (source.node.kind === "element" || source.node.kind === "fragment") {
    const used = new Set<string>();
    for (const sibling of siblings) {
      const key = keyOf(sibling);
      if (key !== undefined) used.add(key);
    }
    if (source.node.key !== undefined && used.has(source.node.key)) {
      delete source.node.key;
      const replacement = randomKey(rng, siblings);
      if (replacement !== undefined) source.node.key = replacement;
    }
  }
  siblings.splice(index, 0, source.node);
  return {
    operation: "move",
    detail: `move ${describeSpec(source.node)} from ${source.path} to ${target.path}[${index}]`,
    children: root
  };
}

function applyUpdate(rng: Rng, root: Spec[]): Mutation | null {
  const nodes = collectNodes(root, "root", 1, "root", []);
  if (nodes.length === 0) return null;
  const target = rng.pick(nodes);
  const node = target.node;
  switch (node.kind) {
    case "text":
    case "comment": {
      const before = node.text;
      node.text = rng.pick(TEXT_VALUES) + ":" + rng.int(10);
      return {
        operation: "update",
        detail: `update text of ${target.path} from ${JSON.stringify(before)} to ${JSON.stringify(node.text)}`,
        children: root
      };
    }
    case "fragment": {
      const before = node.key;
      const replacement = randomKey(rng, target.siblings);
      if (replacement === undefined) delete node.key;
      else node.key = replacement;
      return {
        operation: "update",
        detail: `update key of ${target.path} from ${JSON.stringify(before)} to ${JSON.stringify(node.key)}`,
        children: root
      };
    }
    case "element": {
      const choice = rng.int(4);
      if (choice === 0) {
        const before = node.sel;
        node.sel = rng.pick(CONTAINER_TAGS);
        return {
          operation: "update",
          detail: `update tag of ${target.path} from <${before}> to <${node.sel}>`,
          children: root
        };
      }
      if (choice === 1) {
        const before = node.key;
        const replacement = randomKey(rng, target.siblings);
        if (replacement === undefined) delete node.key;
        else node.key = replacement;
        return {
          operation: "update",
          detail: `update key of ${target.path} from ${JSON.stringify(before)} to ${JSON.stringify(node.key)}`,
          children: root
        };
      }
      if (choice === 2) {
        const attrs = (node.attrs ??= {});
        const name = rng.pick(ATTR_NAMES);
        const before = attrs[name];
        if (before === undefined || rng.bool(0.3)) {
          delete attrs[name];
          return {
            operation: "update",
            detail: `remove attribute ${name} of ${target.path}`,
            children: root
          };
        }
        attrs[name] = rng.pick(ATTR_VALUES);
        return {
          operation: "update",
          detail: `update attribute ${name} of ${target.path} from ${JSON.stringify(before)} to ${JSON.stringify(attrs[name])}`,
          children: root
        };
      }
      const classes = (node.class ??= {});
      const name = rng.pick(CLASS_NAMES);
      if (classes[name] === true) {
        delete classes[name];
        return {
          operation: "update",
          detail: `remove class ${name} of ${target.path}`,
          children: root
        };
      }
      classes[name] = true;
      return {
        operation: "update",
        detail: `add class ${name} to ${target.path}`,
        children: root
      };
    }
  }
}

/** Applies a single random operation to a copy of the given tree. */
export function mutate(
  rng: Rng,
  children: Spec[],
  options: GenerateOptions
): Mutation {
  const next = cloneChildren(children);
  const order = rng.shuffle(OPERATIONS);
  for (const operation of order) {
    const mutation =
      operation === "add"
        ? applyAdd(rng, next, options)
        : operation === "remove"
          ? applyRemove(rng, next)
          : operation === "move"
            ? applyMove(rng, next, options)
            : applyUpdate(rng, next);
    if (mutation !== null) return mutation;
  }
  const container = collectContainers(next, "root", 0, [])[0];
  const node = generateNode(
    rng,
    container.depth + 1,
    options,
    container.children
  );
  container.children.push(node);
  return {
    operation: "add",
    detail: `add ${describeSpec(node)} at ${container.path}[${container.children.length - 1}]`,
    children: next
  };
}

export function toVNode(spec: Spec): VNode {
  switch (spec.kind) {
    case "text":
      return vnode(undefined, undefined, undefined, spec.text, undefined);
    case "comment":
      return h("!", spec.text);
    case "fragment":
      return fragment(spec.children.map(toVNode));
    case "element": {
      const data: VNodeData = {};
      if (spec.key !== undefined) data.key = spec.key;
      if (spec.attrs !== undefined) data.attrs = { ...spec.attrs };
      if (spec.class !== undefined) data.class = { ...spec.class };
      if (spec.props !== undefined) data.props = { ...spec.props };
      return h(spec.sel, data, spec.children.map(toVNode));
    }
  }
}

export function toVNodes(specs: Spec[]): VNode[] {
  return specs.map(toVNode);
}
