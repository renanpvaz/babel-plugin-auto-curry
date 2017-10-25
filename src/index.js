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

// const buildGloalCurryFunction = template(`
//   function ${globalCurryName}(arity, fn) {
//     var curried = function (oldArgs) {
//       return function innerCurry() {
//         const newArgs = Array.prototype.slice.call(arguments)
//         const allArgs  = oldArgs.concat(newArgs);
//
//         return allArgs.length < arity
//           ? curried(allArgs)
//           : fn.apply(null, allArgs);
//       }
//     };
//
//     return curried([]);
//   }
// `)

export default ({ types: t }) =>  {
  const isArrowFunctionNode = node =>
    node.body.type === 'ArrowFunctionExpression'

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
      ArrowFunctionExpression(path) {
        const { node } = path

        if (
          !path.isArrowFunctionExpression() ||
          !isArrowFunctionNode(node)
        ) return

        const arrowFunction = uncurry(node)
        const arity = arrowFunction.params.length

        path.replaceWith(
          t.callExpression(
            t.identifier(globalCurryName),
            [t.numericLiteral(arity), arrowFunction]
          )
        )
      },

      CallExpression(path) {
       const { node } = path

       if (
         node.callee.name !== globalCurryName ||
         path.scope.references[globalCurryName]
       ) return

       getProgram(path).unshiftContainer('body', [buildGloalCurryFunction()])
      }
    }
  }
}
