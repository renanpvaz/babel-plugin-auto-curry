import template from 'babel-template'

const globalCurryName = '_curry'

const buildGloalCurryFunction = template(`
  function ${globalCurryName}(arity, fn) {
    return function ${globalCurryName}Fn() {
      var params = Array.prototype.slice.call(arguments);
      if (params.length >= arity) {
        return fn.apply(this, params);
      }
      return function ${globalCurryName}() {
        var next = Array.prototype.slice.call(arguments);
        return ${globalCurryName}Fn.apply(this, params.concat(next));
      };
    };
  }
`)

const hasDirective = node => !!(
  node.directives &&
  node.directives.some(({ value }) =>
    value.value === 'no auto-curry'
  )
)

const isDisabled = path => !!path.findParent(
  ({ node }) => hasDirective(node)
)

const isArrowFunctionNode = node =>
  node.body.type === 'ArrowFunctionExpression'

export default ({ types: t }) =>  {
  const getProgram = path => t.isProgram(path.node)
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
      ArrowFunctionExpression(path, { opts }) {
        const { node } = path

        if (
          !path.isArrowFunctionExpression() ||
          !isArrowFunctionNode(node) ||
          isDisabled(path)
        ) return

        const arrowFunction = uncurry(node)
        const arity = arrowFunction.params.length

        path.replaceWith(
          t.callExpression(
            t.identifier(opts.curryFunction || globalCurryName),
            [t.numericLiteral(arity), arrowFunction]
          )
        )
      },

      CallExpression(path, { opts }) {
       const { node } = path

       if (
         opts.curryFunction ||
         node.callee.name !== globalCurryName ||
         path.scope.references[globalCurryName]
       ) return

       getProgram(path).unshiftContainer('body', [buildGloalCurryFunction()])
      }
    }
  }
}
