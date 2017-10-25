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

const add3 = _curry(3, (a, b, c) => a + b + c);
const mult5 = _curry(5, (a, b, c, d, e) => a * b * c * d * e);
