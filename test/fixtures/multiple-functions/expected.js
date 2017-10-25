function _curry(arity, fn) {
  return function _curryFn() {
    var params = Array.prototype.slice.call(arguments);

    if (params.length >= arity) {
      return fn.apply(this, params);
    }

    return function _curry() {
      var next = Array.prototype.slice.call(arguments);
      return _curryFn.apply(this, params.concat(next));
    };
  };
}

const add = _curry(2, (a, b) => a + b);
const mult = _curry(2, (a, b) => a * b);
