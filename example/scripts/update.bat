@echo off
pushd "%~dp0\.."
if exist "node_modules" rd /s /q "node_modules"
if exist "client\assets\bower_components" rd /s /q "client\assets\bower_components"

call npm install
call bower install

popd