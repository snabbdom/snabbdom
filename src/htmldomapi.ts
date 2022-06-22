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
  if (isDocumentFragment(parentNode)) {
    let node: Node | null = parentNode;
    while (node && isDocumentFragment(node)) {
      const fragment = parseFragment(node);
      node = fragment.parent;
    }
    parentNode = node ?? parentNode;
  }
  if (isDocumentFragment(newNode)) {
    newNode = parseFragment(newNode, parentNode);
  }
  if (referenceNode && isDocumentFragment(referenceNode)) {
    referenceNode = parseFragment(referenceNode).firstChildNode;
  }
  parentNode.insertBefore(newNode, referenceNode);
}

function removeChild(node: Node, child: Node): void {
  node.removeChild(child);
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
  isDocumentFragment,
};
