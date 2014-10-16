<a name="0.4.18"></a>
### 0.4.18 (2014-10-02)


<a name="0.4.17"></a>
### 0.4.17 (2014-10-01)


<a name="0.4.16"></a>
### 0.4.16 (2014-09-26)


#### Bug Fixes

* bump mongodb to 1.4.15 since 1.4.14 contain bugs ([d9acd849](https://github.com/litixsoft/baboon/commit/d9acd8492bfe8c2b5b524050740bbcbd38fccf80))


<a name="0.4.15"></a>
### 0.4.15 (2014-09-24)


#### Features

* **setting:** add function getUserSetting() to get a single user setting by key ([952f7271](https://github.com/litixsoft/baboon/commit/952f7271c6c62dfba3f181a501c664fb24375af2))


<a name="0.4.14"></a>
### 0.4.14 (2014-09-18)


#### Bug Fixes

* require of 'crypto' and 'logging' in baboon changed, tests adapted ([efa00b26](https://github.com/litixsoft/baboon/commit/efa00b2682ee30ddfecd9672a27e4d1e86d40e9a))


<a name="0.4.13"></a>
### 0.4.13 (2014-09-16)


#### Bug Fixes

* requirering of 'crypto' in auth changed ([ef8fd570](https://github.com/litixsoft/baboon/commit/ef8fd5707335ef2fe8169a6f728a524c5be4a0a3))
* **config:** config ([da2403b2](https://github.com/litixsoft/baboon/commit/da2403b2d3eafed06e22f7ef069a8a0e7d587312))


<a name="0.4.12"></a>
### 0.4.12 (2014-08-26)


#### Bug Fixes

* update .gitignore and .npmignore to reduce size of module when installing it ([4850372d](https://github.com/litixsoft/baboon/commit/4850372d16c74a65bd5439e1d1006366d0609486))


<a name="0.4.11"></a>
### 0.4.11 (2014-08-25)


#### Features

* update to angular 1.2.23 ([719cce1d](https://github.com/litixsoft/baboon/commit/719cce1d2c1169278a999e4c74b23984541d0e79))


<a name="0.4.10"></a>
### 0.4.10 (2014-08-25)


#### Features

* replace cli-color with chalk ([144b73be](https://github.com/litixsoft/baboon/commit/144b73be19f77a92da43f7b5f06330f6cc8bbb9f))


<a name="0.4.9"></a>
### 0.4.9 (2014-08-13)


#### Bug Fixes

* change field token in schema of user repository to be null or string ([3ba6041e](https://github.com/litixsoft/baboon/commit/3ba6041e4a956a02ad8d4f9c806ce791dc79dcc7))


<a name="0.4.8"></a>
### 0.4.8 (2014-07-23)


#### Features

* do not create user admin by default when running `grunt setup` ([0942135f](https://github.com/litixsoft/baboon/commit/0942135fa121f3f469ab8513d6a4656131f11c22))
* update dependencies ([857c762d](https://github.com/litixsoft/baboon/commit/857c762d7cbc020f3245690cfa4e9aa16eb9e2a4))


<a name="0.4.7"></a>
### 0.4.7 (2014-07-16)


#### Bug Fixes

* move grunt to dependencies so that baboon will work in production mode (npm inst ([4df32e99](https://github.com/litixsoft/baboon/commit/4df32e99e581b5d0461533b2665c35b1c46dbe18))


<a name="0.4.6"></a>
### 0.4.6 (2014-07-16)


#### Bug Fixes

* app now does not load unnecessary modules when rights system is disabled ([82f35480](https://github.com/litixsoft/baboon/commit/82f35480c93c29d181d0ebe0b367bb58c01a7078))
* do not load account and auth modules when rights system is disabled ([83b7d35c](https://github.com/litixsoft/baboon/commit/83b7d35cace47606c2bd0f8b39f32df9a91690ba))
* **account:** input fields when changing password are now of type password ([b49732ed](https://github.com/litixsoft/baboon/commit/b49732ed9ab0cc28bb3b42f8f3dbb7a4d63fa31b))
* **config:** add fallback to os temp folder when user has no user folder ([fa1c603d](https://github.com/litixsoft/baboon/commit/fa1c603d94adec1a94146f872f0971e840346806))


<a name="0.4.5"></a>
### 0.4.5 (2014-07-11)


#### Features

* switch from ngmin to ng-annotate ([2c1329ad](https://github.com/litixsoft/baboon/commit/2c1329ad17a077a6975595a6c6f379445567010e))
* update setup script in example app ([ee07be44](https://github.com/litixsoft/baboon/commit/ee07be440126112f3ad48a0beb45834cdd2d29b1))
* **account:** user can now change his password ([1e057635](https://github.com/litixsoft/baboon/commit/1e057635bc82ee059e35670e29eb588a97549d5a))


<a name="0.4.4"></a>
### 0.4.4 (2014-07-08)


#### Bug Fixes

* correct path of ssl cert files ([e79afa09](https://github.com/litixsoft/baboon/commit/e79afa0924ec7c417f601dd777fb81dde8c988c5))


#### Features

* prepare expressjs plugins for next release (fix deprecated messages) ([61215673](https://github.com/litixsoft/baboon/commit/61215673425cc5ea86e441cdcbd0c08c95da0792))
* update dependencies ([43adf010](https://github.com/litixsoft/baboon/commit/43adf0104b8f1b13a1ddc9868b66e4d029db9bea))


<a name="0.4.3"></a>
### 0.4.3 (2014-06-19)


#### Features

* change location of routes.js files. ([77b74c1b](https://github.com/litixsoft/baboon/commit/77b74c1b94b52eae759b5c0aac75709767a2cf08))


#### Breaking Changes

* The routes.js files, which contains all server routes for a toplevel app, are now moved from the folder client/app/[appname] to server/modules/[appname]
 ([77b74c1b](https://github.com/litixsoft/baboon/commit/77b74c1b94b52eae759b5c0aac75709767a2cf08))


<a name="0.4.2"></a>
### 0.4.2 (2014-06-18)


#### Bug Fixes

* angular-ui bootstrap dropdowns now work correctly ([7e656a5f](https://github.com/litixsoft/baboon/commit/7e656a5f673a53ac28e5e432dc94a57d048d7586))


#### Features

* update to angular 1.2.18 ([17e7a3db](https://github.com/litixsoft/baboon/commit/17e7a3dbdd2f2ec361c200483d8b5a3e36a96786))


<a name="0.4.1"></a>
### 0.4.1 (2014-06-13)


#### Features

* update baboon-client ([7d74bc3c](https://github.com/litixsoft/baboon/commit/7d74bc3c2aca082c27f05265be9baaa08005ea21))


# Release History
## v0.4.0
