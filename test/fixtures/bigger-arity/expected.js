function _curry(fn) {
  return function _curryFn() {
    var params = Array.prototype.slice.call(arguments);

    if (params.length >= fn.length) {
      return fn.apply(this, params);
    }

    return function _curry() {
      var next = Array.prototype.slice.call(arguments);
      return _curryFn.apply(this, params.concat(next));
    };
  };
}

const add3 = _curry((a, b, c) => a + b + c);
const mult5 = _curry((a, b, c, d, e) => a * b * c * d * e);