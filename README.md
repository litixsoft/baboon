# baboon [![Build Status](https://img.shields.io/travis/litixsoft/baboon/v0.4.svg)](https://travis-ci.org/litixsoft/baboon) [![david-dm](https://david-dm.org/litixsoft/baboon.png)](https://david-dm.org/litixsoft/baboon/) [![david-dm](https://david-dm.org/litixsoft/baboon/dev-status.png)](https://david-dm.org/litixsoft/baboon#info=devDependencies&view=table)

Baboon Web Toolkit, modular fullstack web application framework for single-page realtime apps.

Baboon is an open source web toolkit for creating Single Page Real-time applications.
It combines tools, libraries, own developments as well as existing frameworks into a complete,
ready for immediate use toolkit. It covers all activities necessary for the development process for the creation
of a single page real-time applications.

Baboon takes care of the complete setup of an immediately usable architecture for SPAs and also provides
the basic functionality of the application. In addition to simple things like LESS-based design,
it also includes the complete implementation of a websocket transport for the real-time communication inside the application. Last but not least the availability of many modules makes Baboon a full SPA-framework. All that is left to you is taking care of your business logic - the rest is done by Baboon.

* Web site: http://www.litixsoft.de/baboon
* Tutorial: http://www.litixsoft.de/baboon/tutorial
* API Docs: http://www.litixsoft.de/baboon/api
* Developer Guide: http://www.litixsoft.de/baboon/guide
* Baboon example app live demo http://demo.baboon.litixsoft.de
* Baboon project generator https://github.com/litixsoft/generator-baboon

# Install
The installation of a Baboon project is very simple. However, some preparatory work is needed.

## System requirements
Stack with:

 * RedisIo 2.6.12 or newer
 * MongoDb 2.4.5 or newer
 * NodeJs 10.22 or newer

Baboon needs this stack as a base on the respective system. Such a stack including NodeJS version management and other tools can be found here: the [baboon-stack](https://github.com/litixsoft/baboon-stack) covers an easy-to-use one-click setup for Windows, Linux and Mac.

## NodeJS global dependencies
Whithout using baboon-stack, you need install Baboon's global dependencies. Skip this section when using Baboon-stack.

Linux / Mac:

    $ sudo npm install -g karma bower grunt-cli yo generator-baboon protractor
    $ webdriver-manager update

Windows:

    $ npm install -g karma bower grunt-cli yo generator-baboon protractor
    $ webdriver-manager update

## Create and start your baboon project
You can simply create a Baboon project with a yeoman generator-baboon and start with grunt serve.
The application starts in development mode with live reload functionality that monitors the directories for any changes.
If changes are detected, a new build is created, the server is restarted if necessary, and the browser is updated.

    $ yo baboon myProject
    $ cd myProject
    $ grunt serve

Look out for more information in the sample application or check out the documentations on our web site.

# Contributing
Instead of us handing out a formal style guide, simply stick to the existing programming style.
Easily expand Baboon with your own extensions or changes in the functionality of Baboon itself. Use this workflow:

1. Write your functionality
2. Write unit tests for your functionality
3. Create an example of your functionality in the sample application
4. Document your functionality in the documentation section of example app
5. Write unit tests for the example
6. Add end to end tests for the example
7. All tests should be successful
8. Check your test coverage (90 - 100%)
9. Make a pull request

We will check the tests, the example and test coverage. In case your changes are useful and well tested, we will merge your requests.

# Building and Testing Baboon
This section describes how to set up your development environment to build and test Baboon with the example app.

## System requirements
Stack with:

 * RedisIo 2.6.12 or newer
 * MongoDb 2.4.5 or newer
 * NodeJs 10.22 or newer

Baboon needs this stack as a base on the respective system. Such a stack including NodeJS version management and other tools can be found here: the [baboon-stack](https://github.com/litixsoft/baboon-stack) covers an easy-to-use one-click setup for Windows, Linux and Mac.

## NodeJS global dependencies
Whithout using baboon-stack, you need install Baboon's global dependencies. Skip this section when using Baboon-stack.

Linux / Mac:

    $ sudo npm install -g karma bower grunt-cli yo generator-baboon protractor
    $ webdriver-manager update

Windows:

    $ npm install -g karma bower grunt-cli yo generator-baboon protractor
    $ webdriver-manager update

## Install Baboon and example app
The example application is also the reference implementation of Baboon.
Fork Baboon repository and install the dependent modules with npm and bower.

    $ git clone https://github.com/litixsoft/baboon.git
    $ cd baboon
    $ npm install
    $ cd example
    $ npm install
    $ bower install

## Important:
Make sure to always keep the directory you are in in mind. Grunt commands in the baboon/ directory always refer to the
Baboon library. Grunt commands in the baboon/example always refer to the example application.

## Running example
To debug code and run end-to-end tests, it is useful to have a local implementation. For this purpose,
we built an example application with a fully functional web-server on ExpressJs basis.

    $ cd baboon/example
    $ grunt serve

The `grunt serve` command builds the example application in development mode, starts the server and opens the application in a browser. It then monitors changes inside the directories. When a change to files is detected,
grunt rebuilds the app and reloads the site in the browser.

You can also manually start the `server.js` in development mode. This is sometimes needed for debugging.
You have to trigger the build by yourself then. After each change do a:

    $ grunt build:dev
    $ node server.js --config development

You can also manually start the `server.js` in production mode. This is sometimes needed for debugging.
You have to trigger the build by yourself then. After each change do a:

    $ grunt build
    $ node server.js

## Running tests
You can run all unit tests from Baboon lib and example application with:

    $ npm test // directory baboon

Baboon lib tests only

    $ grunt test // directory baboon

Example app server and client unit tests only

    $ grunt test // directory baboon/example

Example app server unit tests only

    $ grunt test:server // directory baboon/example

Example app client unit tests only

    $ grunt test:client // directory baboon/example

## Running end to end tests
You can run end to end scenario tests in example app with:

Test in development mode:

    $ grunt e2e // directory baboon/example

Test in production mode:

    $ grunt e2e:dist // directory baboon/example

## Running coverage
You can run a coverage task for Baboon lib with:

    $ grunt coverage // directory baboon

You can run a coverage task for example app server and client with:

    $ grunt coverage // directory baboon/example

You can run a coverage task for example app server with:

    $ grunt coverage:server // directory baboon/example

You can run a coverage task for example app client with:

    $ grunt coverage:client // directory baboon/example

## All Baboon lib grunt tasks
Important: this tasks run inside the baboon directory only.

Run baboon unit tests and jshint

    $ grunt test

Run baboon unit tests, jshint and code coverage

    $ grunt cover

Run baboon unit tests, jshint and code coverage for ci systems

    $ grunt ci

This generates xml reports inside the build folder.

## All Baboon example app grunt tasks
Important: this tasks run inside the baboon/example directory only.

Build application in development mode, start express server, open browser with app and watch for changes.

    $ grunt serve

Build application in development mode, start express server, open browser with app.

    $ grunt serve:dist

Build application in development mode only.

    $ grunt build:dev

Build application in production mode only.

    $ grunt build

Run all unit tests

    $ grunt test

Run client unit tests

    $ grunt test:client

Run server unit tests

    $ grunt test:server

Run e2e protractor tests in development mode

    $ grunt e2e

Run e2e protractor tests in production mode

    $ grunt e2e:dist

Run coverage for server and client

    $ grunt cover

Run coverage for client

    $ grunt cover:client

Run coverage for server

    $ grunt cover:server

Run unit tests, jshint and code coverage for ci systems

    $ grunt ci

This generates xml reports inside the build folder.

# Author
[Litixsoft GmbH](http://www.litixsoft.de)

# License
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
