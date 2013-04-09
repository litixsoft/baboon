baboon-example
===========
Reference application for Baboon

## Installation

``` bash
# dependencies grunt-cli and optional for relax development nodemon
# linux sudo npm install -g
npm install -g grunt-cli
npm install -g nodemon

git clone https://github.com/litixsoft/baboon.git
cd baboon/example
npm install
grunt build # builds client app
```

## Usage

### Start server usual.
In development mode server run at start grunt build.
If you've made changes in client/ and if not development mode, you must manually start grunt build.

``` bash
example:> grunt build # if not development mode
example:>server/server.js
```

### For relaxed develop use nodemon

``` bash
example:> nomo
```

If you've made changes in client/assets or client/vendor, you must restart server manually.