# baboon [![Build Status](https://travis-ci.org/litixsoft/baboon.png?branch=master)](https://travis-ci.org/litixsoft/baboon) [![david-dm](https://david-dm.org/litixsoft/baboon.png)](https://david-dm.org/litixsoft/baboon/) [![david-dm](https://david-dm.org/litixsoft/baboon/dev-status.png)](https://david-dm.org/litixsoft/baboon#info=devDependencies&view=table)

Baboon Web Toolkit, modular fullstack web application framework for single-page realtime apps.

Baboon is an open source web toolkit for creating Single Page Real-time applications.
It combines tools, libraries, own developments as well as existing frameworks into a complete,
ready for immediate use toolkit. It covers all activities necessary for the development process for the creation
of the single page real-time applications.

Baboon cares not only about the complete setup of an immediately usable architecture for SPAs, but it also provides
the basic functionality of the application is ready. In addition to simple things like a work based on LESS design,
this also includes the complete implementation of a websocket transport for real-time in the application.
In addition, many modules are available which make baboon to a Framework for SPAs.

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

Baboon needs this stack as a base on the respective system. Such a stack including NodeJS version management and
other tools we as [baboon-stack](https://github.com/litixsoft/baboon-stack) for Windows, Linux and Mac.

## NodeJS global dependencies
Without baboon-stack, you must install the global dependencies of Baboon. Use the baboon-stack,
you can skip this section.

Linux / Mac:

    $ sudo npm install -g karma bower grunt-cli yo generator-baboon protractor
    $ webdriver-manager update

Windows:

    $ npm install -g karma bower grunt-cli yo generator-baboon protractor
    $ webdriver-manager update

## Create and start your baboon project
You can simply create a Baboon project with a yeoman generator-baboon and start with grunt serve.
The application started in Development Mode with Live reload and monitors the directories for any changes.
If changes are detected, a new build is created, restart the server if necessary, and the browser is updated.

    $ yo baboon myProject
    $ cd myProject
    $ grunt serve

Look for more information in the sample application or read the documentations on our web site.

# Contributing
Instead of a formal style guide, take care of the existing programming style to maintain.
Easily expand with your extensions or changes the functionality of Baboon. Use this workflow:

1. Write your functionality
2. Write unit tests for your functionality
3. Create an example of your functionality in the sample application
4. Documentation your functionality in the documentation section of example app
5. Write unit tests for the example
6. Add end to end tests for the example
7. All tests should be successful
8. Check your test coverage (90 - 100%)
9. Make a pull request

We examine the tests, the example and test coverage. Is your change useful and well tested, we will also merge.

# Building and Testing Baboon
This section describes how to set up your development environment to build and test Baboon with example app.

## System requirements
Stack with:

 * RedisIo 2.6.12 or newer
 * MongoDb 2.4.5 or newer
 * NodeJs 10.22 or newer

Baboon needs this stack as a base on the respective system. Such a stack including NodeJS version management and
other tools we as [baboon-stack](https://github.com/litixsoft/baboon-stack) for Windows, Linux and Mac.

## NodeJS global dependencies
Without baboon-stack, you must install the global dependencies of Baboon. Use the baboon-stack,
you can skip this section.

Linux / Mac:

    $ sudo npm install -g karma bower grunt-cli yo generator-baboon protractor
    $ webdriver-manager update

Windows:

    $ npm install -g karma bower grunt-cli yo generator-baboon protractor
    $ webdriver-manager update

## Install Baboon and example app
The example application is also the reference implementation of Baboon.
Fork Baboon repository and install the dependencies modules with npm and bower.

    $ git clone https://github.com/litixsoft/baboon.git
    $ cd baboon
    $ npm install
    $ cd example
    $ npm install
    $ bower install

## Important:
Make sure always to the directory in which you are. Grunt commands in the baboon directory always refer to the
Baboon library. Grunt commands in the baboon/example always refer to the example application.

## Running example
To debug code and run end-to-end tests, it is often useful to have a local implementation. For this purpose,
we have built a example application with a full web-server on ExpresJs basis.

    $ cd baboon/example
    $ grunt serve

The `grunt serve` builds the example application in development mode, starts the server and opens the the application
in a browser. It then watch for changes in the directories. When making changes to files,
grunt rebuilds the app and reload the site in the browser.

You can also start the `server.js` in development mode manually. This is needed for debugging the app.
Then you have to trigger the build by yourself. After each change do:

    $ grunt build:dev
    $ node server.js --config development

You can also start the `server.js` in production mode manually. This is needed for debugging the app.
Then you have to trigger the build by yourself. After each change do:

    $ grunt build
    $ node server.js

## Running tests
You can run all unit tests from Baboon lib and example application with:

    $ npm test // directory baboon

Only baboon lib tests

    $ grunt test // directory baboon

Only example app server and client unit tests

    $ grunt test // directory baboon/example

Only example app server unit tests

    $ grunt test:server // directory baboon/example

Only example app client unit tests

    $ grunt test:client // directory baboon/example

Only example app protractor e2e tests

    $ grunt e2e // directory baboon/example

## Running end to end tests
You can run end to end scenario tests in example app with:

    $ grunt e2e // directory baboon/example

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
Important: this tasks only running in baboon directory.

Run jshint linter

    $ grunt lint

Run baboon unit tests and jshint

    $ grunt test

Run baboon unit tests, jshint and code coverage

    $ grunt cover

Run baboon unit tests, jshint and code coverage for ci systems

    $ grunt ci

It generates xml reports inside the build folder.

## All Baboon example app grunt tasks
Important: this tasks only running in baboon/example directory.

Build application in development mode, start express server, open browser with app and watch for changes.

    $ grunt serve

Build application in development mode, start express server, open browser with app.

    $ grunt serve:dist

Only build application in development mode.

    $ grunt build:dev

Only build application in production mode.

    $ grunt build:dev

Run jshint linter

    $ grunt lint

Run all unit tests

    $ grunt test

Run client unit tests

    $ grunt test:client

Run server unit tests

    $ grunt test:server

Run e2e protractor tests

    $ grunt e2e

Run coverage for server and client

    $ grunt cover

Run coverage for client

    $ grunt cover:client

Run coverage for server

    $ grunt cover:server

Run unit tests, jshint and code coverage for ci systems

    $ grunt ci

It generates xml reports inside the build folder.

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