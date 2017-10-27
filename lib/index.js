'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _babelTemplate = require('babel-template');

var _babelTemplate2 = _interopRequireDefault(_babelTemplate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var globalCurryName = '_curry';

var buildGloalCurryFunction = (0, _babelTemplate2.default)('\n  function ' + globalCurryName + '(arity, fn) {\n    return function ' + globalCurryName + 'Fn() {\n      var params = Array.prototype.slice.call(arguments);\n      if (params.length >= arity) {\n        return fn.apply(this, params);\n      }\n      return function ' + globalCurryName + '() {\n        var next = Array.prototype.slice.call(arguments);\n        return ' + globalCurryName + 'Fn.apply(this, params.concat(next));\n      };\n    };\n  }\n');

var hasDirective = function hasDirective(node) {
  return !!(node.directives && node.directives.some(function (_ref) {
    var value = _ref.value;
    return value.value === 'no auto-curry';
  }));
};

var isDisabled = function isDisabled(path) {
  return !!path.findParent(function (_ref2) {
    var node = _ref2.node;
    return hasDirective(node);
  });
};

var isArrowFunctionNode = function isArrowFunctionNode(node) {
  return node.body.type === 'ArrowFunctionExpression';
};

exports.default = function (_ref3) {
  var t = _ref3.types;

  var getProgram = function getProgram(path) {
    return t.isProgram(path.node) ? path : getProgram(path.parentPath);
  };

  var uncurry = function uncurry(node) {
    return isArrowFunctionNode(node) ? uncurry(t.arrowFunctionExpression([].concat(_toConsumableArray(node.params), _toConsumableArray(node.body.params)), node.body.body)) : node;
  };

  return {
    visitor: {
      ArrowFunctionExpression: function ArrowFunctionExpression(path, _ref4) {
        var opts = _ref4.opts;
        var node = path.node;


        if (!path.isArrowFunctionExpression() || !isArrowFunctionNode(node) || isDisabled(path)) return;

        var arrowFunction = uncurry(node);
        var arity = arrowFunction.params.length;

        path.replaceWith(t.callExpression(t.identifier(opts.curryFunction || globalCurryName), [t.numericLiteral(arity), arrowFunction]));
      },
      CallExpression: function CallExpression(path, _ref5) {
        var opts = _ref5.opts;
        var node = path.node;


        if (opts.curryFunction || node.callee.name !== globalCurryName || path.scope.references[globalCurryName]) return;

        getProgram(path).unshiftContainer('body', [buildGloalCurryFunction()]);
      }
    }
  };
};
