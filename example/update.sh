#!/bin/sh

rm -R node_modules
rm -R bower_components

npm install
bower install
