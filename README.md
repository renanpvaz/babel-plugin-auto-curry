# babel-plugin-auto-curry

This plugin allows you to automatically curry arrow functions by defining them as a set of unary functions receiving each argument.

## Examples

```javascript
const add = x => y => x + y

const mult3 = a => b => c => a * b * c
```

Turn into

```javascript
const add = _curry((x, y) => x + y)

const mult3 = _curry((a, b, c) => a * b * c)
```

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

# License

MIT
