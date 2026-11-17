export interface SnabbdomFragment extends DocumentFragment {
  parent: Node | null;
  firstChildNode: ChildNode | null;
  lastChildNode: ChildNode | null;
}

export interface DOMAPI {
  createElement: (
    tagName: any,
    options?: ElementCreationOptions
  ) => HTMLElement;
  createElementNS: (
    namespaceURI: string,
    qualifiedName: string,
    options?: ElementCreationOptions
  ) => Element;
  /**
   * @experimental
   * @todo Make it required when the fragment is considered stable.
   */
  createDocumentFragment?: () => SnabbdomFragment;
  createTextNode: (text: string) => Text;
  createComment: (text: string) => Comment;
  insertBefore: (
    parentNode: Node,
    newNode: Node,
    referenceNode: Node | null
  ) => void;
  removeChild: (node: Node, child: Node) => void;
  appendChild: (node: Node, child: Node) => void;
  parentNode: (node: Node) => Node | null;
  nextSibling: (node: Node) => Node | null;
  tagName: (elm: Element) => string;
  setTextContent: (node: Node, text: string | null) => void;
  getTextContent: (node: Node) => string | null;
  isElement: (node: Node) => node is Element;
  isText: (node: Node) => node is Text;
  isComment: (node: Node) => node is Comment;
  /**
   * @experimental
   * @todo Make it required when the fragment is considered stable.
   */
  isDocumentFragment?: (node: Node) => node is DocumentFragment;
}

function createElement(
  tagName: any,
  options?: ElementCreationOptions
): HTMLElement {
  return document.createElement(tagName, options);
}

function createElementNS(
  namespaceURI: string,
  qualifiedName: string,
  options?: ElementCreationOptions
): Element {
  return document.createElementNS(namespaceURI, qualifiedName, options);
}

function createDocumentFragment(): SnabbdomFragment {
  return parseFragment(document.createDocumentFragment());
}

function createTextNode(text: string): Text {
  return document.createTextNode(text);
}

function createComment(text: string): Comment {
  return document.createComment(text);
}

function insertBefore(
  parentNode: Node,
  newNode: Node,
  referenceNode: Node | null
): void {
  const parentFragment = isDocumentFragment(parentNode)
    ? resolveFragment(parentNode)
    : null;
  const parent = parentFragment !== null ? parentFragment.parent : parentNode;
  const fragment = parentFragment !== null ? parentFragment.fragment : null;

  if (isDocumentFragment(newNode)) {
    newNode = parseFragment(newNode, parent);
  }

  // A missing reference node means "append to the end of the parent", which for
  // a fragment is directly after the fragment's content, not after the siblings
  // that follow it.
  let appendsToFragment = false;
  if (referenceNode != null) {
    if (isDocumentFragment(referenceNode)) {
      referenceNode = parseFragment(referenceNode).firstChildNode;
    }
  } else if (fragment !== null) {
    appendsToFragment = true;
    referenceNode = fragment.lastChildNode?.nextSibling ?? null;
  }

  const firstInserted = isDocumentFragment(newNode)
    ? newNode.firstChild
    : newNode;
  const lastInserted = isDocumentFragment(newNode) ? newNode.lastChild : newNode;

  parent.insertBefore(newNode, referenceNode);

  if (appendsToFragment && fragment !== null) {
    if (fragment.firstChildNode === null) {
      fragment.firstChildNode = firstInserted;
    }
    if (lastInserted !== null) {
      fragment.lastChildNode = lastInserted;
    }
  }
}

function removeChild(node: Node, child: Node): void {
  const parentFragment = isDocumentFragment(node) ? resolveFragment(node) : null;
  if (parentFragment === null) {
    node.removeChild(child);
    return;
  }
  // The child lives in the fragment's parent, not in the fragment itself.
  const nextSibling = child.nextSibling;
  const previousSibling = child.previousSibling;
  parentFragment.parent.removeChild(child);
  const fragment = parentFragment.fragment;
  if (fragment.firstChildNode === child && fragment.lastChildNode === child) {
    fragment.firstChildNode = null;
    fragment.lastChildNode = null;
  } else if (fragment.firstChildNode === child) {
    fragment.firstChildNode = nextSibling;
  } else if (fragment.lastChildNode === child) {
    fragment.lastChildNode = previousSibling;
  }
}

function appendChild(node: Node, child: Node): void {
  if (isDocumentFragment(child)) {
    child = parseFragment(child, node);
  }
  node.appendChild(child);
}

function parentNode(node: Node): Node | null {
  if (isDocumentFragment(node)) {
    while (node && isDocumentFragment(node)) {
      const fragment = parseFragment(node);
      node = fragment.parent as Node;
    }
    return node ?? null;
  }
  return node.parentNode;
}

function nextSibling(node: Node): Node | null {
  if (isDocumentFragment(node)) {
    const fragment = parseFragment(node);
    const parent = parentNode(fragment);
    if (parent && fragment.lastChildNode) {
      const children = Array.from(parent.childNodes);
      const index = children.indexOf(fragment.lastChildNode);
      return children[index + 1] ?? null;
    }
    return null;
  }
  return node.nextSibling;
}

function tagName(elm: Element): string {
  return elm.tagName;
}

function setTextContent(node: Node, text: string | null): void {
  node.textContent = text;
}

function getTextContent(node: Node): string | null {
  return node.textContent;
}

function isElement(node: Node): node is Element {
  return node.nodeType === 1;
}

function isText(node: Node): node is Text {
  return node.nodeType === 3;
}

function isComment(node: Node): node is Comment {
  return node.nodeType === 8;
}

function isDocumentFragment(node: Node): node is DocumentFragment {
  return node.nodeType === 11;
}

function parseFragment(
  fragmentNode: DocumentFragment,
  parentNode?: Node | null
): SnabbdomFragment {
  const fragment = fragmentNode as SnabbdomFragment;
  fragment.parent ??= parentNode ?? null;
  fragment.firstChildNode ??= fragmentNode.firstChild;
  fragment.lastChildNode ??= fragmentNode.lastChild;
  return fragment;
}

/**
 * A fragment is only a handle: once it is inserted, its children are moved into
 * the fragment's parent, and the fragment remembers that range itself. Resolve
 * the node that actually contains the fragment's content, together with the
 * fragment that tracks it.
 */
function resolveFragment(fragmentNode: DocumentFragment): {
  parent: Node;
  fragment: SnabbdomFragment;
} {
  const fragment = parseFragment(fragmentNode);
  let parent: Node | null = fragmentNode;
  while (parent && isDocumentFragment(parent)) {
    parent = parseFragment(parent).parent;
  }
  return { parent: parent ?? fragmentNode, fragment };
}

export const htmlDomApi: DOMAPI = {
  createElement,
  createElementNS,
  createTextNode,
  createDocumentFragment,
  createComment,
  insertBefore,
  removeChild,
  appendChild,
  parentNode,
  nextSibling,
  tagName,
  setTextContent,
  getTextContent,
  isElement,
  isText,
  isComment,
  isDocumentFragment
};
