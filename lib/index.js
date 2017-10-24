'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _babelTemplate = require('babel-template');

var _babelTemplate2 = _interopRequireDefault(_babelTemplate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var globalCurryName = '_curry';

var buildGloalCurryFunction = (0, _babelTemplate2.default)('\n  function ' + globalCurryName + '(fn) {\n    return function ' + globalCurryName + 'Fn() {\n      var params = Array.prototype.slice.call(arguments);\n      if (params.length >= fn.length) {\n        return fn.apply(this, params);\n      }\n      return function ' + globalCurryName + '() {\n        var next = Array.prototype.slice.call(arguments);\n        return ' + globalCurryName + 'Fn.apply(this, params.concat(next));\n      };\n    };\n  }\n');

// const hasNoComposition = path =>
//     !!path.findParent(({ node }) =>
//         node.directives && node.directives.some(({ value }) => value.value === 'no composition'));

exports.default = function (_ref) {
  var t = _ref.types;

  var isArrowFunctionNode = function isArrowFunctionNode(node) {
    return node.body.type === 'ArrowFunctionExpression';
  };

  var getProgram = function getProgram(path) {
    return t.isProgram(path.node) ? path : getProgram(path.parentPath);
  };

  var uncurry = function uncurry(node) {
    return isArrowFunctionNode(node) ? uncurry(t.arrowFunctionExpression([].concat(_toConsumableArray(node.params), _toConsumableArray(node.body.params)), node.body.body)) : node;
  };

  return {
    visitor: {
      ArrowFunctionExpression: function ArrowFunctionExpression(path) {
        var node = path.node;


        if (!path.isArrowFunctionExpression() || !isArrowFunctionNode(node)) return;

        path.replaceWith(t.callExpression(t.identifier(globalCurryName), [uncurry(node)]));
      },
      CallExpression: function CallExpression(path) {
        var node = path.node;


        if (node.callee.name !== globalCurryName || path.scope.references[globalCurryName]) return;

        var declar = buildGloalCurryFunction();
        declar._blockHoist = 3;

        getProgram(path).unshiftContainer('body', [declar]);
      }
    }
  };
};
