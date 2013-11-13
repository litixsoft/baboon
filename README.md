# baboon [![Build Status](https://travis-ci.org/litixsoft/baboon.png?branch=master)](https://travis-ci.org/litixsoft/baboon) [![david-dm](https://david-dm.org/litixsoft/baboon.png)](https://david-dm.org/litixsoft/baboon/) [![david-dm](https://david-dm.org/litixsoft/baboon/dev-status.png)](https://david-dm.org/litixsoft/baboon#info=devDependencies&view=table)

> Baboon Web Toolkit - a modular fullstack web application framework for single-page realtime apps.

## Documentation
For quickstart and overviewing baboon, read the "Example app" section.

## Install
[![NPM](https://nodei.co/npm/baboon.png??downloads=true&stars=true)](https://nodei.co/npm/baboon/)

## Example app
Getting started with the example app:
Install global dependencies:

    $ npm install -g grunt-cli karma bower

On Linux/Mac use administrative rights to install global modules:

    $ sudo npm install -g grunt-cli karma bower

Clone the baboon repository and install the dev dependencies. Also install the dev dependencies for the example app. Build the example app and start the server with grunt.

    $ git clone https://github.com/litixsoft/baboon.git
    $ cd baboon
    $ npm install
    $ cd example
    $ npm install
    $ bower install
    $ grunt server

*Start the app running in your browser: http://localhost:3000*. You can modify url settings in example/config/app.conf.json

The `grunt server` builds the example application, starts the server and opens the the application in a browser. It then watch for changes in the directories. When making changes to files inside the `client/` directory, grunt only rebuilds the client files and reloads the site in the browser. When making changes to files inside the `server/` directory, grunt only restarts the server and reloads the site in the browser.

You can also start the `app.js` manually. This is needed for debugging the app. Then you have to trigger the build by yourself. After each change do:

    $ grunt build
    $ node app.js

## Grunt nodejs scripts
Usually grunt tasks are started via console. In cases this can not easily been done, e.g. when using an ide like WebStorm, use the nodejs grunt scripts in the `scripts` folder to start the tasks via nodejs.

## Running tests
### baboon lib
You can run baboon unit tests and jshint with:

    $ grunt test

You can run baboon unit tests, jshint and code coverage with:

    $ grunt cover

You can also run baboon unit tests, jshint and code coverage for ci systems with:

    $ grunt ci

It generates xml reports inside the build folder.

### baboon example app
You can run all unit tests, e2e tests and jshint with:

    $ grunt test

You can run jshint linter only with:

    $ grunt lint

You can run all unit tests and jshint with:

    $ grunt test:unit

You can run only the e2e tests with:

    $ grunt e2e

Jshint and unit tests are using source files, e2e tests are using debug builds. You can also run e2e tests in release mode with:

    $ grunt e2e:release

You can also run complete tests in release mode with:

    $ grunt test:release

Tests will be aborted in case of an error. Use the --force option to skip abortion and continue testing, especially useful when jshint reports errors but you still want to run its e2e tests.

    $ grunt test --force

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](http://gruntjs.com/).

## Roadmap for next releases
* extend admin area
* remove EJS dependencies on server
* modularize navigation and locale
* example for productive config with nginx load balance
* make server and client independently
* audit to mongo
* more tests

## Release publication dates
* 12/2013 0.3 beta2
* 02/2013 0.4 release canditate
* 03/2013 0.5 release stable

## Release History
### v0.2.9
* change rest api
* include auth module (unstable)

### v0.2.8
* update tests
* revert to angular 1.2.0-rc.3

### v0.2.7
* remove passport auth
* remove uiExamples
* change server url (chrome bug localhost)
* bug fixes

### v0.2.6
* passport auth
* bug fixes
* refactoring

### v0.2.5
* fix error in logging in production mode
* fix error baboon-client version
* merge with actual 0.3 develop version (angular 1.2)
* replace optional and common by module with new directory structure
* replace socket transport with new transport layer, websocket with REST fallback

### v0.2 beta
* outsourcing client code in baboon-client (bower registry)
* integrate bower
* app.includes automated
* integrate less
* optimize grunt build with build helper
* integrate toplevel applications in build process
* user and rights with roles and groups
* sessions
* rights system
* admin area
* new design
* localisation
* integrate tests for all installed browsers
* Fix bug which causes endless loop on client when session was not regenerated when session's sessionMaxLife was reached.

### v0.1 alpha
* create feature project structure
* grunt tasks for management
* angularjs
* socket.io
* test frameworks karma, jasmin
* logging and audit
* configuration management
* express.js for server
* sessions with redis.io
* mongoDb
* redisIo
* example application enterprise
* example application blog

## Author
[Litixsoft GmbH](http://www.litixsoft.de)

## License
Copyright (C) 2013 Litixsoft GmbH <info@litixsoft.de>
Licensed under the MIT license.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. DEALINGS IN THE SOFTWARE.