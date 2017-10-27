# babel-plugin-auto-curry

This plugin allows you to automatically curry arrow functions by defining them as a set of unary functions respectively receiving each argument.

## Examples

```javascript
const add = x => y => x + y

const mult3 = a => b => c => a * b * c
```

Turn into

```javascript
const add = _curry(2, (x, y) => x + y)

const mult3 = _curry(3, (a, b, c) => a * b * c)
```

## Disabling

To leave your functions uncurried you have to either use the 'no auto-curry' directive or simply define your arrow functions with multiple arguments at once.

## Installation

```sh
$ npm install --save-dev babel-plugin-auto-curry
```

## Usage (not published yet)

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["auto-curry"]
}
```

### Via CLI

```sh
$ babel --plugins auto-curry script.js
```

### Via Node API

```javascript
require('babel-core').transform('code', {
  plugins: ['auto-curry']
});
```

## Using a custom curry function

To use a curry function other than the one implemented by the plugin, you can set the `curryFunction` option in your `.babelrc`. The custom function **must** accept a number (the arity) and a function, respectively. Also, don't forget that the function must be in scope, so import it if you have to!

```javascript
{
  plugins: [
    ["auto-curry", {
      "curryFunction": "mySpecialCurry",
    }]
  ]
}
```

# License

MIT
