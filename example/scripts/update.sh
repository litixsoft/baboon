#!/bin/sh

rm -R node_modules
rm -R client/assets/bower_components

npm install
bower install
