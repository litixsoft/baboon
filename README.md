# baboon [![Build Status](https://travis-ci.org/litixsoft/baboon.png?branch=master)](https://travis-ci.org/litixsoft/baboon)

Baboon Web Toolkit - a modular fullstack web application framework for single-page realtime apps.

_(Coming soon)_

## Documentation
For quickstart and overviewing baboon, read the "Example and contributing" section.

### Install
_(Coming soon)_

## Example and contributing
Getting started with the example app:
install global dependencies:

    $ npm install -g grunt-cli
    $ npm install -g karma

On linux use administrative rights to install global modules:
    
    $ sudo npm install -g grunt-cli
    $ sudo npm install -g karma

Clone the baboon repository and install the dev dependencies to install the example and test suite deps.
Build the client app and start the server with grunt.

    $ git clone https://github.com/litixsoft/baboon.git
    $ cd baboon
    $ npm install
    $ cd example
    $ npm install
    $ grunt server

*Find the app running on: http://localhost:3000*
You can modify url settings in config/app.conf.json

The "Grunt server" task builds the application, starts the server and opens the the application in a browser. It then monitors
directories for changes. When making changes to files inside the "client/" directory, grunt rebuilds the client files only and reloads the site in the browser.
When making changes to files inside the "server/" directory, grunt restarts the server only and reloads the site in the browser.

Without having livereload after changes, you need to build and restart manually.
After each change in manual-mode, do:

    $ grunt build
    $ node app.js

## Grunt nodejs scripts
Usually grunt tasks are started via console. In cases this can not easily been done, e.g. when using a ide like WebStorm, use the nodejs scripts in "scripts/grunt-taskName" to start the tasks via nodejs.

## Running tests
### baboon lib
You can run baboon unit tests and jshint with:

    $ grunt test

You can run baboon unit tests, jshint and code coverage with:

    $ grunt cover

You can also run baboon unit tests, jshint and code coverage for ci systems with:

    $ grunt ci

It generates xml reports inside the build folder.

### baboon example
You can run all unit tests, e2e tests and jshint with:

    $ grunt test

You can run separate jshint linter without unit and e2e tests with:

    $ grunt lint

You can run separate unit tests without jshint and e2e tests with:

    $ grunt unit

You can run seperate e2e tests without unit and jshint tests with:

    $ grunt e2e

Jshint and unit tests are using source files, e2e tests are using debug builds.
You can also run e2e tests in release mode with:

    $ grunt e2e:release 

You can also run complete tests in release mode with:

    $ grunt test:release

Tests will be aborted in case of an error. Use the --force option to skip abortion and continue testing, especially useful when Jshint reports
errors but you still want to run its e2e tests.

    $ grunt test --force

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](http://gruntjs.com/).

## Roadmap
### 0.2 beta
* commandline management tool
* user and rights with roles and groups
* optimize API
* extend with new features

### 0.3 - 0.9 release canditates
*

### 1.0 stable
*

## Release History
## v0.1.1

* Fix bug which causes endless loop on client when session was not regenerated when session's sessionMaxLife was reached.

### 0.1 alpha
* create project structure
* grunt tasks for management
* angularjs
* socket.io
* websocket transport with socket.io and angular
* test frameworks karma, jasmin
* logging and audit
* configuration management
* express.js for server
* server routing
* services for client
* sessions with redis.io
* mongoDb
* redisIo
* example application enterprise
* example application blog

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
THE SOFTWARE.