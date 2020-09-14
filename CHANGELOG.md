# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.1.0](https://github.com/snabbdom/snabbdom/compare/v2.0.0...v2.1.0) (2020-09-14)


### Features

* **eventlisteners:** add types for VNode in listener ([63b1b6c](https://github.com/snabbdom/snabbdom/commit/63b1b6c22e49d06b1fb509a14d321ec19f324bb5)), closes [#796](https://github.com/snabbdom/snabbdom/issues/796)
* **eventlisteners:** relax custom event listener type ([15ce059](https://github.com/snabbdom/snabbdom/commit/15ce059e2b5e80d1975168fff2d2a44f71bd5cbb)), closes [#850](https://github.com/snabbdom/snabbdom/issues/850)

## [2.0.0](https://github.com/snabbdom/snabbdom/compare/v1.0.1...v2.0.0) (2020-09-10)


### ⚠ BREAKING CHANGES

* **eventlisteners:** loaded/carrying event listeners are no longer supported.

### Features

* **eventlisteners:** add missing mult. listeners type ([5a89efe](https://github.com/snabbdom/snabbdom/commit/5a89efe01580d50f15649c19a444745867c5c0d4)), closes [#794](https://github.com/snabbdom/snabbdom/issues/794)
* **eventlisteners:** remove loaded listeners feature ([6e0ff8e](https://github.com/snabbdom/snabbdom/commit/6e0ff8e8141c70891e55e41a3107d6d4de0bc754)), closes [#802](https://github.com/snabbdom/snabbdom/issues/802) [#802](https://github.com/snabbdom/snabbdom/issues/802)


### Bug Fixes

* **deps:** add regenertor-runtime to devDeps ([2a2964c](https://github.com/snabbdom/snabbdom/commit/2a2964c3eb47cd2f5a7ae88f49b2afe9ea299d7e)), closes [#813](https://github.com/snabbdom/snabbdom/issues/813)
* **docs:** gitter badge url ([7e19849](https://github.com/snabbdom/snabbdom/commit/7e198493c11f6d4afa8b03d727083d661e85ec0e))
* **examples:** example import paths ([8111f62](https://github.com/snabbdom/snabbdom/commit/8111f6234a70840673412da6cd37a726a7c839f8)), closes [#761](https://github.com/snabbdom/snabbdom/issues/761)
* **examples:** totalHeight 0 on remove last element reorder animation ([afa77c0](https://github.com/snabbdom/snabbdom/commit/afa77c04d4ab959a5f2bb5853e5dd821c744843f))
* **package:** remove directories field ([c7a2a93](https://github.com/snabbdom/snabbdom/commit/c7a2a93f5a2ed63bd76130e5e3d3769a9f1c1c58))
* **package:** update urls paldepind -> snabbdom ([f94185a](https://github.com/snabbdom/snabbdom/commit/f94185a5bbb31018af48b77449e74f58339fe404)), closes [#775](https://github.com/snabbdom/snabbdom/issues/775)

### [1.0.1](https://github.com/paldepind/snabbdom/compare/v1.0.0...v1.0.1) (2020-06-18)


### User facing changes

* **package:** fix ./snabbdom related files and exports fields errors ([89b917b](https://github.com/paldepind/snabbdom/commit/89b917bb3f3f8986390e3e400327a9087533d928))

## [1.0.0](https://github.com/paldepind/snabbdom/compare/v0.7.4...v1.0.0) (2020-06-18)


### ⚠ BREAKING CHANGES

* **exports:** The main export path, 'snabbdom' was replaced with
the export path 'snabbdom/init'. This new export path includes only
the named export `init`.
* **exports:** No default exports exist. All exports are named.
* **exports:** the import path `snabbdom/snabbdom.bundle` is removed.
* **typescript:** Types exported by this package have re-declared
the global `Element.setAttribute` and `Element.setAttributeNS` to
accept `number` and `boolean` for the `value` parameter. This
change removes that re-declaration and thus the only valid value is
`string`. If your code provides `number` and/or `boolean`, then it
may now fail to compile.
* **props:** props module does not attempt to delete node
properties. This may affect you if you are using the props module
to add non-native (custom) properties to DOM nodes. Instead, it is
recommended to use _data-* attributes_.
https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes
* CommonJS modules are no longer provided.
* import paths in ES modules include file name
extensions.
* Compiled to ES2015 (was ES5).
* UMD bundles are no longer provided.


### Internal changes

* **commitlint:** add type auto and scope deps for renovate ([b56a0ac](https://github.com/paldepind/snabbdom/commit/b56a0ac796a3c27644f8332278a7cbb9d24a95c6))
* **commitlint:** fix and enable in CI ([f8cf5cc](https://github.com/paldepind/snabbdom/commit/f8cf5ccba402cbbf6982da681db8707fd12fc8d4)), closes [#662](https://github.com/paldepind/snabbdom/issues/662)
* **deps:** update dependency @typescript-eslint/eslint-plugin to v3.3.0 ([9448e42](https://github.com/paldepind/snabbdom/commit/9448e4267cf077890deb0deb32c3200e4d19a213))
* **deps:** update dependency tsconfigs to v5 ([eb1ec8c](https://github.com/paldepind/snabbdom/commit/eb1ec8c280544a322fc9844c255b8ec5c8e004c6))
* **deps:** update dependency typescript to v3.9.5 ([5e24b20](https://github.com/paldepind/snabbdom/commit/5e24b20a52a8c20ed82e3fc7d20977262016731a))
* **docs:** lint code examples ([41cb359](https://github.com/paldepind/snabbdom/commit/41cb3596e8898399545f02ff8205a1d45f62f391))
* **eslint:** lint cjs files ([d581217](https://github.com/paldepind/snabbdom/commit/d58121755f4e2da50ad82e52818b66333ae10a37))
* **format:** sort file lists ([e77615b](https://github.com/paldepind/snabbdom/commit/e77615b16bd60fbd1963528a2c46e7dfbbb77e0e)), closes [#673](https://github.com/paldepind/snabbdom/issues/673)
* **git:** ignore each test artifact specifically ([b34e9a9](https://github.com/paldepind/snabbdom/commit/b34e9a9d3a8096c2c5cd7eebeafba0e52ed08a75))
* **package:** consistent values in files field ([6fe56f8](https://github.com/paldepind/snabbdom/commit/6fe56f8538f6e0073d458d7a8e21c8d469c0a9df)), closes [#672](https://github.com/paldepind/snabbdom/issues/672)
* **relic:** remove @types/assert ([2846189](https://github.com/paldepind/snabbdom/commit/28461899bdce0c2134dca92298e40c1ecf7be363))
* **typescript:** package and tests are two projects ([8a71211](https://github.com/paldepind/snabbdom/commit/8a71211b4a38616c9d90bc9214e116d1b3e869b5))
* **vscode:** eslint.validate short forms ([ba3e85b](https://github.com/paldepind/snabbdom/commit/ba3e85bf90f77254fad08435d484e19f836c6783))
* **vscode:** use workspace typescript ([eabbd2f](https://github.com/paldepind/snabbdom/commit/eabbd2f056b40e5e9376ccf94c9a6f9177bd020a))


### User facing changes

* **docs:** enable eslint rule array-bracket-spacing ([77e54e9](https://github.com/paldepind/snabbdom/commit/77e54e9105394d4e6d21647a38adfb80ea567ee2))
* **docs:** enable eslint rule import/first ([17cf7ae](https://github.com/paldepind/snabbdom/commit/17cf7ae931185d8ab1ac1e4f8b7042677e03db8d))
* **docs:** enable eslint rule import/newline-after-import ([cd3a5cf](https://github.com/paldepind/snabbdom/commit/cd3a5cf17ee33c738d17adcb78a8c254e96653b9))
* **docs:** enable eslint rule indent ([e2861bb](https://github.com/paldepind/snabbdom/commit/e2861bb1bd68c63c99c30907bb331c21f27cb248))
* **docs:** enable eslint rule key-spacing ([349b686](https://github.com/paldepind/snabbdom/commit/349b686bd8cfc24a2845fbab62081a15e5b42d0f))
* **docs:** enable eslint rule max-statements-per-line ([a128a23](https://github.com/paldepind/snabbdom/commit/a128a23ac3182677d10d1979213c92dcf04294ea))
* **docs:** enable eslint rule no-multi-spaces ([8179381](https://github.com/paldepind/snabbdom/commit/8179381a775acea73d0064c77d643944cf684947)), closes [#692](https://github.com/paldepind/snabbdom/issues/692)
* **docs:** enable eslint rule object-curly-spacing ([8b8fbd5](https://github.com/paldepind/snabbdom/commit/8b8fbd5e34fdc3a99ce67635cc44f5ef9e3cf30c))
* **docs:** enable eslint rule quote-props ([37512fe](https://github.com/paldepind/snabbdom/commit/37512fe8ee02cf374cf3d9a62c0f6e3203be2f28))
* **docs:** enable eslint rule quotes ([2d455b5](https://github.com/paldepind/snabbdom/commit/2d455b52dcabc2f8e52082536e635a66e98eb650))
* **docs:** enable eslint rule semi ([f4e7885](https://github.com/paldepind/snabbdom/commit/f4e7885663e645aeb728470d5e1f159365f94f1b))
* **docs:** enable eslint rule space-before-blocks ([9f2d2d7](https://github.com/paldepind/snabbdom/commit/9f2d2d7a1687c7169dff775724a811e1dd7ccd8b))
* **docs:** enable eslint rule space-before-function-paren ([23e7b87](https://github.com/paldepind/snabbdom/commit/23e7b87c64b5d587acae5ce7bd899ec0d071958e))
* **docs:** enable eslint rules object-*-newline ([9a45b5b](https://github.com/paldepind/snabbdom/commit/9a45b5b22aba0fbed97431e99268a173995de4a1))
* **docs:** fix wrong module import paths ([3b6baee](https://github.com/paldepind/snabbdom/commit/3b6baee049f44cbc55cc2b0131c2c551e9c1b452)), closes [#691](https://github.com/paldepind/snabbdom/issues/691)
* **docs:** provide a release changelog ([616df35](https://github.com/paldepind/snabbdom/commit/616df35909f1d639d562418ea32122625104b00c)), closes [#670](https://github.com/paldepind/snabbdom/issues/670)
* **exports:** main export provided ([3becd84](https://github.com/paldepind/snabbdom/commit/3becd84cc1dcfb84e2ee292eab18aae36e415040)), closes [#682](https://github.com/paldepind/snabbdom/issues/682)
* **exports:** only named exports ([fefd141](https://github.com/paldepind/snabbdom/commit/fefd141f5f3567bb6dccbd6c43ce81f285f985bd)), closes [#522](https://github.com/paldepind/snabbdom/issues/522) [#523](https://github.com/paldepind/snabbdom/issues/523)
* **exports:** relative values in exports field ([187088e](https://github.com/paldepind/snabbdom/commit/187088ee0ebfaed2e84a992bdde50d207131ec29)), closes [#674](https://github.com/paldepind/snabbdom/issues/674)
* **exports:** remove package.json main field ([3122eec](https://github.com/paldepind/snabbdom/commit/3122eec9b98ffdf52fd31ceb2ced17c219e25042)), closes [#680](https://github.com/paldepind/snabbdom/issues/680)
* **exports:** remove the /snabbdom.bundle path ([c862993](https://github.com/paldepind/snabbdom/commit/c8629933599b3fdf3ea774f3ce67517908b79d8d))
* **exports:** replaced main export path with init ([09f2d1c](https://github.com/paldepind/snabbdom/commit/09f2d1ca5a16fd0b402209d90e58b97998efacef)), closes [#522](https://github.com/paldepind/snabbdom/issues/522)
* **package:** no module field ([2b30e25](https://github.com/paldepind/snabbdom/commit/2b30e25f0d261d2d7f37127bda0c235b0a5acf57)), closes [#681](https://github.com/paldepind/snabbdom/issues/681)
* **props:** do not attempt to delete node properties ([6f316c1](https://github.com/paldepind/snabbdom/commit/6f316c141b43ccb1c2c355ab8d0c499984154ef1)), closes [#623](https://github.com/paldepind/snabbdom/issues/623) [#283](https://github.com/paldepind/snabbdom/issues/283) [#415](https://github.com/paldepind/snabbdom/issues/415) [#307](https://github.com/paldepind/snabbdom/issues/307) [#151](https://github.com/paldepind/snabbdom/issues/151) [#416](https://github.com/paldepind/snabbdom/issues/416)
* **typescript:** do not redeclare Element.setAttribute(NS) ([0620b5e](https://github.com/paldepind/snabbdom/commit/0620b5eda03cd124d4bd743660cb376b0d75a0a3)), closes [#615](https://github.com/paldepind/snabbdom/issues/615)
* do not provide UMD bundles ([8e24bbf](https://github.com/paldepind/snabbdom/commit/8e24bbf016ff5cc0afb2759ec2e4b745921ee453)), closes [#498](https://github.com/paldepind/snabbdom/issues/498) [#514](https://github.com/paldepind/snabbdom/issues/514) [#481](https://github.com/paldepind/snabbdom/issues/481)
* only esm and correct import paths ([dad44f0](https://github.com/paldepind/snabbdom/commit/dad44f0d632d344ca13ee8430d941c26a53d5c2a)), closes [#516](https://github.com/paldepind/snabbdom/issues/516) [#437](https://github.com/paldepind/snabbdom/issues/437) [#263](https://github.com/paldepind/snabbdom/issues/263)

## [v0.7.2] - 2018-09-02

## Bugfixes

- Improvements to TypeScript types #364. Thanks to @gfmio.
- In some cases and browsers the style module would cause elements to not be removed correctly #367. Thanks to @jvanbruegge for fixing this tricky bug.
    
## [v0.7.0] - 2017-07-27

## Breaking change

The way Snabbdom handles boolean attributes in the attributes module has been changed. Snabbdom no longer maintains a list of known boolean attributes. Not relying on such a list means that custom boolean attributes are supported, that performance is slightly better, and that the list doesn't have to be kept up to date.

Whether or not to set a boolean attribute is now determined by looking at the value specified for the attribute. If the value is a boolean (i.e. strictly equal to `true` or `false`) it will be handled as a boolean attribute. If you're currently setting boolean attributes with booleans then this change does not affect you.

```js
h("div", {
  attrs: {
    foo: true // will be set a boolean attribute since `true` is a boolean
    bar: "baz" // will set a normal attribute
  }
});
```

The example above will result in the HTML: `<div foo bar="baz" />`. Even if `bar` is actually a boolean attribute. So for instance `h("input", { attrs: { required: 12 } })` will no longer set a boolean attribute correctly.

Previously `h("input", { attrs: { required: 0 } })` would result in the HTML `<input>` since `required` was a know boolean attribute and `0` is falsey. Per the new behavior the HTML will be `<input required="0">`. To accomidate for the change always give boolean values for boolean attributes.

## Bugfixes
- `toVNode` now handles `DocumentFragment` which makes it possible to patch into a fragment. #320. Thanks to @staltz.
- Custom boolean attributes are handled correctly. #314. Thanks to @caridy.
- Type improvement. `VNode` key property can be `undefined`  #290. Thanks to @yarom82.
- Data attributes are checked for existence before deleting. Old behavior caused error in Safari. #313. Thanks to @FeliciousX.

## Performance improvements

- New handling of boolean attributes. #314. Thanks to @caridy.
    
## [v0.6.9] - 2017-05-19

## Bug fixes

- Fix style delayed and remove to be optional in TypeScript, https://github.com/snabbdom/snabbdom/issues/295
    
## [v0.6.8] - 2017-05-16

## Bug fixes

- Fix error when class is set by vdom selector in SVG, https://github.com/snabbdom/snabbdom/issues/217. Thanks to @caesarsol 
- Fix hyperscript to support undefined or null children in TypeScript, https://github.com/snabbdom/snabbdom/issues/226. Thanks to @ornicar 
- Fix thunk function so it is not called redundantly, https://github.com/snabbdom/snabbdom/pull/273. Thanks to @caesarsol 
- Improve TypeScript types of VNode props, https://github.com/snabbdom/snabbdom/issues/264 and https://github.com/snabbdom/snabbdom/issues/264. Thanks to @mightyiam 
- Fix toVNode() for comment nodes, lacking some fields, https://github.com/snabbdom/snabbdom/pull/266. Thanks to @staltz

## Performance improvements

- Improvement for attribute patching, https://github.com/snabbdom/snabbdom/issues/257. Thanks to @diervo 
    
## [v0.6.6] - 2017-03-07

## Bug fixes
- The attributes module sets boolean attributes correctly according to the specificaiton. https://github.com/snabbdom/snabbdom/issues/254. Thanks to @PerWiklander for reporting the bug.
    
## [v0.6.5] - 2017-02-25

This is a patch version with a few bug fixes.

## Bug fixes
- Fix `toVNode()` to handle text nodes correctly, https://github.com/snabbdom/snabbdom/issues/252. Thanks to @Steelfish 
- Fix dataset module to support old browsers, such as IE10. Thanks @staltz
- Fix "create element" workflow to align with "update element" workflow, https://github.com/snabbdom/snabbdom/pull/234. Thanks @caridy 

    
## [v0.6.4] - 2017-02-09

This version adds some features such as support for comment nodes and better server-side/client-side rendering collaboration, besides some bug fixes.

## New features

### Add ability to create comment nodes. https://github.com/snabbdom/snabbdom/issues/142 Thanks to @pedrosland

Example:

``` js
h('!', 'Will show as a comment')
```

will be rendered on the DOM as

``` html
<!-- Will show as a comment -->
```

### Introduce `toVNode()` to reconstruct root element as vnode. https://github.com/snabbdom/snabbdom/issues/167 Thanks to @staltz

Useful for client-side rendering over existing HTML that was rendered server-side with snabbdom.

Example:

``` js
import {toVNode} from 'snabbdom/tovnode'
// ...
patch(toVNode(element), vnode)
```

Will deep-convert the `element` to a VNode, this way allowing existing HTML to not be ignored by the patch process.

## Bug fixes
- Fix compatibility issue of String.prototype.startsWith in the Style Module. https://github.com/snabbdom/snabbdom/pull/228 Thanks to @zhulongzheng 
- Support for `null`/`undefined` children without crashing. https://github.com/snabbdom/snabbdom/issues/226 Thanks to @nunocastromartins 

    
## [v0.6.3] - 2017-01-16

## Bugfixes
- Fix the export of the `Module` interface for TypeScript projects depending on snabbdom. 

    
## [v0.6.2] - 2017-01-16

## Bugfixes
- Fix the export of the `Hooks` interface for TypeScript projects depending on snabbdom. 

    
## [v0.6.1] - 2017-01-05

The biggest change in this release is that the Snabbdom source code has been ported to TypeScript. The work has been primarily done by @staltz. This brings much improved support for using Snabbdom in TypeScript projects.

**Note**: This release contains breaking changes. See below.

## New features
- Complete TypeScript support. Thanks to @staltz.
- Support for CSS variables. #195. Thanks to @jlesquembre.
- Allow `h(sel, data, node)` and `h(sel, node)` shortcut notations in the `h` function. #196. That is, instead of `h('div', [child])` one can now do `h('div', child)`. Thanks to @AlexGalays.

## Bugfixes
- Fix custom element creation when tag name begins with 'svg'. #213. Thanks to @tdumitrescu.
- Fix bug related to updating one child with same key but different selector. #188. Thanks to @zhulongzheng.
- Strings can be used as children inside SVG elements. #208. Thanks to @jbucaran and @jbucaran.
- Use `parentNode` fixing bug in IE 11. #210. Thanks to @aronallen.

## Breaking changes

The TypeScript rewrite uses the `import` and `export` features introduced in ECMAScript 2015. Unfortunately the ES imports have no analogy to the CommonJS pattern of setting `module.exports`. This means that the Snabbdom modules that previously used this feature now have to be imported in a slightly different way.

``` js
var h = require("snabbdom/h"); // The old way
var h = require("snabbdom/h").h; // The new way
var h = require("snabbdom/h").default; // Alternative new way
var {h} = require("snabbdom/h"); // Using destructuring
```

    
## [v0.6.0] - 2017-01-05

Deprecated. Use [version 0.6.1](https://github.com/snabbdom/snabbdom/releases/tag/v0.6.1) instead. 


## v0.5.0 - 2016-05-16

## Breaking change

This release contains a new thunk implementation that solves many issues with the old thunk implementation. The thunk API has changed slightly. Please see the [thunks](https://github.com/paldepind/snabbdom#thunks) section in the readme.


[Unreleased]: https://github.com/snabbdom/snabbdom/compare/v0.7.2...HEAD
[v0.7.2]: https://github.com/snabbdom/snabbdom/compare/v0.7.0...v0.7.2
[v0.7.0]: https://github.com/snabbdom/snabbdom/compare/v0.6.9...v0.7.0
[v0.6.9]: https://github.com/snabbdom/snabbdom/compare/v0.6.8...v0.6.9
[v0.6.8]: https://github.com/snabbdom/snabbdom/compare/v0.6.6...v0.6.8
[v0.6.6]: https://github.com/snabbdom/snabbdom/compare/v0.6.5...v0.6.6
[v0.6.5]: https://github.com/snabbdom/snabbdom/compare/v0.6.4...v0.6.5
[v0.6.4]: https://github.com/snabbdom/snabbdom/compare/v0.6.3...v0.6.4
[v0.6.3]: https://github.com/snabbdom/snabbdom/compare/v0.6.2...v0.6.3
[v0.6.2]: https://github.com/snabbdom/snabbdom/compare/v0.6.1...v0.6.2
[v0.6.1]: https://github.com/snabbdom/snabbdom/compare/v0.6.0...v0.6.1
[v0.6.0]: https://github.com/snabbdom/snabbdom/compare/v0.5.0...v0.6.0
