# baboon [![Build Status](https://travis-ci.org/litixsoft/baboon.png?branch=master)](https://travis-ci.org/litixsoft/baboon)

Baboon Web Toolkit, modular fullstack web application framework for single-page realtime apps.

_(Coming soon)_

## Documentation
For quickstart and overview baboon, read the "Example and contributing" section.

### Install

_(Coming soon)_

## Example and contributing
Getting started with the example app.
Install global dependencies:

    $ npm install -g grunt-cli
    $ npm install -g karma

On linux use sudo for global modules:
    
    $ sudo npm install -g grunt-cli
    $ sudo npm install -g karma

Clone the baboon repo, then install the dev dependencies to install the example and test suite deps.
Build the client app and start the server with grunt.

    $ git clone git@gitlab.litixsoft.de:opensource/baboon.git
    $ cd baboon
    $ git checkout develop
    $ npm install
    $ cd example
    $ npm install
    $ grunt server

*App run with url: http://localhost:3000*
You can setting the url in config/app.conf.json

Grunt server task build the application, starts the server and open the browser with application. Than watch
directories for changes. If you've made changes in client/, grunt build only client files and reload the site in browser.
If you've made changes in server/, grunt only restart server and reload site in browser.

Would do you not have livereload after changes, you need build and start manually.
To do after each change in manually modus.

    $ grunt build
    $ node app.js

## Grunt nodejs scripts
Grunt tasks are run on the console. But if you want to start this over nodejs,
you can use the nodejs scripts under scripts/grunt-taskName. This is particularly good in WebStorm
as you will not able to start the task easily run over.

## Running tests
### baboon lib
You can run baboon unit tests and jshint with:

    $ grunt test

You can run baboon unit tests, jshint and code coverage with:

    $ grunt cover

You can run baboon unit tests, jshint and code coverage for ci systems (generates xml reports in build folder) with:

    $ grunt ci

### baboon example
You can run all unit tests, e2e tests and jshint with:

    $ grunt test

You can run jshint linter only without unit and e2e tests:

    $ grunt lint

You can run unit tests only without jshint and e2e tests:

    $ grunt unit

You can run e2e tests only without unit and jshint tests:

    $ grunt e2e

Jshint and unit tests run with source files, e2e tests run with debug build.
You can run e2e in release mode.

    $ grunt e2e:release 

You can run complete test in release mode

    $ grunt test:release

Tests are aborted with error. If the tests are made despite errors on,
you use the --force option. This is especially useful when Jshint still reports
errors but you will still execute its e2e tests.

    $ grunt test --force

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](http://gruntjs.com/).

## Roadmap
### v0.1.0 first beta version
* rewrite express server functionality from other project
* integrate test frameworks karma, jasmin
* create server api

## Release History
### v0.0.11 technical preview
* create project structure
* grunt tasks for management
* integrate angularjs
* integrate transport layer with socket.io

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