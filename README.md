![GitHub Workflow Status](https://img.shields.io/github/workflow/status/DokkanWiki/conditional_js/ci?style=for-the-badge) ![Codecov](https://img.shields.io/codecov/c/github/DokkanWiki/conditional_js?style=for-the-badge&token=8AIEK1MUR3) ![GitHub](https://img.shields.io/github/license/DokkanWiki/conditional_js?style=for-the-badge)


# Conditional JavaScript

Use a C++ style pre-processor to conditionally remove JavaScript code.

Includes a Webpack loader.


## Features

- Supports the following preprocessor types:
  - `#define`, `#undef`
  - `#if`, `#ifdef`, `#ifndef`
  - `#else`, `#elif`, `#elifdef`, `#elifndef`
  - `#error`, `#endif`
- Conditional statements are pure javascript
- Allows a global definition context
- Supports `isolate-vm` for executing conditions in a secure enviroment
- Supports nested conditions
- Can be used through the provided Webpack loader or as a standalone class
- Supports multi-level sourcemap generation


## Conditionals

- `#define <IDENTIFIER> <VALUE?>`: add a definition for just one file. Does not nest into any imported/required files. If a `value` is not provided, the `identifier` will be set to `true`. The `value` can be a javascript expression.
- `#undef <IDENTIFIER>`: remove a definition. Global definitions that are undefined are removed for that file only.
- `#if <EXPRESSION>`: Start a block that will be removed if `expression` is falsy.
- `#ifdef <IDENTIFIER>`: Start a block that will be removed if the `identifier` is not defined (no matter the value).
- `#ifndef <IDENTIFIER>`: Start a block that will be removed if the `identifier` is defined (no matter the value).
- `#else`: Start a sub-block that will be removed if another prior block is active.
- `#elif <EXPRESSION>`: Start a sub-block that will be removed if the `expression` is falsy or a prior block is active.
- `#elifdef <IDENTIFIER>`: Start a sub-block that will be removed if the `identifier` is not defined (no matter the value) or a prior block is active.
- `#elifndef <IDENTIFIER>`: Start a sub-block that will be removed if the `identifier` is defined (no matter the value) or a prior block is active.
- `#error <MESSAGE>`: Throw an error with `message` if allowed to execute or is in an active block.
- `#endif`: Close a block


## Installation

Install with a node package manager:

```bash
  npm install @dokkanwiki/conditional_js
  
  # or
  
  yarn add @dokkanwiki/conditional_js
  
  # or
  
  pnpm add @dokkanwiki/conditional_js
```

## Webpack Loader Usage/Examples

Webpack loader documentation: https://webpack.js.org/loaders/

Within your webpack configuration, you'll need to add `@dokkanwiki/conditional_js` to the rules that are processing your JavaScript.

Process javascript files directly:

```javascript
module: {
    rules: [
        {
            test: /\.m?js$/,
            exclude: /node_modules/,
            use: {
                loader: '@dokkanwiki/conditional_js',
                options: {
                    definitions: {
                        DEBUG: true,
                        NODE_ENV: process.env.NODE_ENV
                    }
                }
            }
        }
    ]
}
```

Process before Babel:

```javascript

module: {
    rules: [
        {
            test: /\.m?js$/,
            exclude: /node_modules/,
            use: [
                {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', { targets: "defaults" }]
                        ]
                    }
                },
                {
                    loader: '@dokkanwiki/conditional_js',
                    options: {
                        DEBUG: process.env.NODE_ENV === 'development'
                    }
                }
            ]
        }
    ]
}
```

## Options

- `parser`: Defaults to `@` style macros (`@if`, `@ifdef`, etc). 
  - Provide a string to determine flavor: `'@'` or `'#'`
  - Alternatively provide an object to define your own parsing method. Provide the following properties:
    - `file_detect`: Regex string or `RegExp` class instance
      - Used to detect if a file should be processed
    - `define`, `if`, `ifdef`, `ifndef`, `elif`, `else`, `elifdef`, `elifndef`, `endif`, `undef`, `error`
      - Regex string, `RegExp` class instance, or a function that takes a string and returns either `undefined` for no match or an array of object with the following properties: `value` string of matched group, `index` position of matched group item in the string. See [src/options.ts](src/options.ts) for additional information.
- `action`: Defaults to `remove`.
  - Control what happens to inactive conditional blocks.
  - Options are: `remove` or `comment`
- `definitions`: Object (key => value) of global definitions to apply to all files.
- `sandbox`: Defaults to `true`
  - Run conditional statements in `isolate-vm` sandbox
  - Provide `true` to run in sandbox with default options.
  - **[NOT RECOMMENDED]** Provide `false` to run conditional statements with `eval()`. 
  - Provide an object with the following properties:
    - `memory_limit`: Memory limit in megabytes. Defaults to 128MB.
    - `timeout`: Timeout for individual condition in milliseconds. Defaults to 250ms.
    
## API Reference

#### ConditionalJsProcessor

- `new ConditionalJsProcessor(options)`
  - `process(source, context)`
    - `source`: file content as `string`
    - `context`: Optional `object` with the following properties:
      - `file_name`: `string`
      - `source_map`: `string` or `object`
    - Returns promise resolving to `object` with the following properties:
      - `transformed_source`
      - `transformed_map`
      - `processor`: `ConditionalJsProcessor` instance
  - `release()`
    - Clean up `isolated-vm` executor. No-op if not using a sandbox.


## Examples

```javascript
// @if NODE_ENV === 'production'
//   @undef PERFORMANCE_STATS
// @elif NODE_ENV === 'development'
//   @define PERFORMANCE_STATS
// @else
//   @error NODE_ENV must be either 'production' or 'development'
// @endif

const render = function () {
    // @ifdef PERFORMANCE_STATS
    const t0 = performance.now();
    // @endif

    requestAnimationFrame(render);

    renderer.render(scene, camera);

    // @ifdef PERFORMANCE_STATS
    const t1 = performance.now();
    console.log(`Call to render() took ${t1 - t0} milliseconds.`);
    // @endif
};
```

## License

[MIT](https://choosealicense.com/licenses/mit/)

