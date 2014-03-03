#!/bin/bash

# Some OS specified operations to detect current path etc
case "$(uname -a)" in
  Linux\ *)
    # Linux
    CURRPATH="$( dirname "$(readlink -f $0)" )"
    BASEPATH="$( cd "$CURRPATH" ; cd .. ; pwd )"
  ;;

  Darwin\ *)
    # MacOSX
    CURRPATH="$(dirname $(readlink ${BASH_SOURCE[0]} || echo ${BASH_SOURCE[0]}))"
    BASEPATH="$(cd "$CURRPATH"; cd ..; pwd -P)"
  ;;

  *)
    echo "Sorry! Unsupported OS."
    exit 5
  ;;
esac

# Change dir
pushd "$BASEPATH"

if [ -d "node_modules" ]; then
  rm -R node_modules
fi

if [ -d "client/assets/bower_components" ]; then
  rm -R client/assets/bower_components
fi

npm install
bower install

# Return to path
popd