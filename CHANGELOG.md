# Release History
## v0.3.8
* fix that save user settings could crash when the appFolder does not exists

## v0.3.7
* add param "localAppMode" to config. When set to true, the app log/settings files will be saved in the current user folder
* add appFolder to the config.path object

## v0.3.6
* disable gzip minification of socket.io in production mode, otherwhis the server will crash in windows

## v0.3.5
* only log audit to MongoDB when the connection string is present in the config

## v0.3.4
* remove baboon administration area from navigation when rights system is disabled

## v0.3.3
* feat: add setting handling for users (each user can have his own application settings)
* fix(rights): now no mongoDB is required when rights system is disabled

## v0.3.2
* fix: use session key from config when parsing cookie on server

## v0.3.1
* feat: add socket object to session when socket is enabled
* fix: send correct error code (401) when username and password are empty on login
* fix(api): fix error in parseError() that the error message was displayed without the data object
* refactor(scripts): merge grunt scripts to a single grunt.js file

## v0.3.0
* add registration an forget password functionality
* update to angular 1.2.2
* restricted middleware
* function to check if the user has a given role
* refactor build process
* npm test now run the tests of the lib and the example app

## v0.2.10
* BREAKING CHANGE: add request object as param to server controller function calls

## v0.2.9
* change rest api
* include auth module (unstable)

## v0.2.8
* update tests
* revert to angular 1.2.0-rc.3

## v0.2.7
* remove passport auth
* remove uiExamples
* change server url (chrome bug localhost)
* bug fixes

## v0.2.6
* passport auth
* bug fixes
* refactoring

## v0.2.5
* fix error in logging in production mode
* fix error baboon-client version
* merge with actual 0.3 develop version (angular 1.2)
* replace optional and common by module with new directory structure
* replace socket transport with new transport layer, websocket with REST fallback

## v0.2 beta
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

## v0.1 alpha
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