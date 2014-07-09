# baboon
[![Build Status](https://secure.travis-ci.org/litixsoft/baboon.svg?branch=master)](https://travis-ci.org/litixsoft/baboon) [![david-dm](https://david-dm.org/litixsoft/baboon.svg?theme=shields.io)](https://david-dm.org/litixsoft/baboon/) [![david-dm](https://david-dm.org/litixsoft/baboon/dev-status.svg?theme=shields.io)](https://david-dm.org/litixsoft/baboon#info=devDependencies&view=table) [![npm](http://img.shields.io/npm/v/baboon.svg)](https://www.npmjs.org/package/baboon)

> Baboon Web Toolkit, modular fullstack web application framework for single-page realtime apps.

## Installation 
    $ npm install baboon

## Testing
### Install global dependencies

    $ npm install -g grunt-cli 

#### Run unit tests

    $ grunt test

#### Run code coverage

    $ grunt cover

#### Run all tests with reports for ci systems

    $ grunt ci

## Contributing
Instead of us handing out a formal style guide, simply stick to the existing programming style. Please create descriptive commit messages.
We use a git hook to validate the commit messages against these [rules](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#heading=h.uyo6cb12dt6w).
Easily expand Baboon with your own extensions or changes in the functionality of Baboon itself. Use this workflow:

1. Write your functionality
2. Write unit tests for your functionality
3. Create an example of your functionality in the sample application (optional)
4. Document your functionality in the documentation section of example app
5. Write unit tests for the example
6. Add end to end tests for the example
7. All tests should be successful
8. Check your test coverage (90 - 100%)
9. Make a pull request

We will check the tests, the example and test coverage. In case your changes are useful and well tested, we will merge your requests.

### Release a new version
We use [grunt-bump](https://github.com/vojtajina/grunt-bump) and [grunt-conventional-changelog](https://github.com/btford/grunt-conventional-changelog) internally to manage our releases.
To handle the workflow, we created a grunt task `release`. This happens:

* Bump version in package.json
* Update the CHANGELOG.md file
* Commit in git with message "chore: release v[`the new version number`]"
* Create a git tag v[`the new version number`]

#### Create a new release
Release a new patch

    $ grunt release

Release a new minor version

    $ grunt release:minor

Release a new major version

    $ grunt release:major

## Author
[Litixsoft GmbH](http://www.litixsoft.de)

## License
Copyright (C) 2014 Litixsoft GmbH <development@litixsoft.de>
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
