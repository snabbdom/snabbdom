const ts = require('typescript')

module.exports.transform = (ctx) => (sf) => ts.visitNode(sf, (node) => {
  const visitor = (node) => {
    const originalPath = (
      ts.isImportDeclaration(node) ||
      ts.isExportDeclaration(node)) &&
      node.moduleSpecifier
      ? node.moduleSpecifier.getText(sf).slice(1, -1)
      : (
        ts.isImportTypeNode(node) &&
        ts.isLiteralTypeNode(node.argument) &&
        ts.isStringLiteral(node.argument.literal)
      )
        ? node.argument.literal.text
        : null

    if (originalPath === null) return node
    const pathWithExtension = originalPath.endsWith('.js')
      ? originalPath
      : originalPath + '.js'
    const newNode = ts.getMutableClone(node)
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      newNode.moduleSpecifier = ts.createLiteral(pathWithExtension)
    } else if (ts.isImportTypeNode(node)) {
      newNode.argument = ts.createLiteralTypeNode(pathWithExtension)
    }
    return newNode
  }
  return ts.visitEachChild(node, visitor, ctx)
})
