# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
