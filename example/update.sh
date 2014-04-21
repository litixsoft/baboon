#!/bin/bash

if [ -d "node_modules" ]; then
  rm -R node_modules
fi

if [ -d "client/assets/bower_components" ]; then
  rm -R client/assets/bower_components
fi

npm install
bower cache clean
bower install