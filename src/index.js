import template from 'babel-template'

const globalCurryName = '_curry'

const buildGloalCurryFunction = template(`
  function ${globalCurryName}(fn) {
    return function ${globalCurryName}Fn() {
      var params = Array.prototype.slice.call(arguments);
      if (params.length >= fn.length) {
        return fn.apply(this, params);
      }
      return function ${globalCurryName}() {
        var next = Array.prototype.slice.call(arguments);
        return ${globalCurryName}Fn.apply(this, params.concat(next));
      };
    };
  }
`)

// const hasNoComposition = path =>
//     !!path.findParent(({ node }) =>
//         node.directives && node.directives.some(({ value }) => value.value === 'no composition'));

export default ({ types: t }) =>  {
  const isArrowFunctionNode = node =>
    node.body.type === 'ArrowFunctionExpression'

  const getProgram = (path) => t.isProgram(path.node)
    ? path
    : getProgram(path.parentPath)

  const uncurry = node => isArrowFunctionNode(node)
    ? uncurry(
        t.arrowFunctionExpression(
          [...node.params, ...node.body.params],
          node.body.body
        )
      )
    : node

  return {
    visitor: {
      ArrowFunctionExpression(path) {
        const { node } = path

        if (
          !path.isArrowFunctionExpression() ||
          !isArrowFunctionNode(node)
        ) return

        path.replaceWith(
          t.callExpression(
            t.identifier(globalCurryName),
            [uncurry(node)]
          )
        )
      },

      CallExpression(path) {
       const { node } = path

       if (
         node.callee.name !== globalCurryName ||
         path.scope.references[globalCurryName]
       ) return

       const declar = buildGloalCurryFunction()
       declar._blockHoist = 3

       getProgram(path).unshiftContainer('body', [declar])
      }
    }
  }
}
