baboon-example
===========
Reference application for Baboon

## Installation

``` bash
# dependencies grunt-cli
# linux sudo npm install -g
npm install -g grunt-cli

git clone https://github.com/litixsoft/baboon.git
cd baboon/example
npm install
grunt build # build for development
# grunt release # build for production
```

## Usage
### Start server usual.
If you've made changes in client/, you must start grunt build and restart server.

``` bash
# development grunt build
# production grunt release
example:> grunt build
example:>scripts/server.js
# stop server with control C
```

Go to http://localhost:3000

### For relaxed develop use grunt relax
Grunt make build, start server and watch files.
If you've made changes in /client, grunt make a build and reload site in browser.
If you've made changes in /server, grunt make a build restarts the server and reload site in browser.

``` bash
example:> grunt relax
```

#### Webstorm settings
In webstorm you can use scrpts/relax.js for developing with the integrate console.
