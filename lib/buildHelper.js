'use strict';

var path = require('path'),
    fs = require('fs'),
    lxHelpers = require('lx-helpers');

module.exports = function (projectRoot, config) {

    var concatConfig = {},
        ngminConfig = lxHelpers.clone(config.ngmin),
        uglifyConfig = {target: {files: {}}},
        lessConfig = lxHelpers.clone(config.less),
        html2jsConfig = lxHelpers.clone(config.html2js),
        clientFolder = path.join(projectRoot, 'client'),
        imports = {},
        fileContents = {},
        baboonModulePath = 'client/vendor/baboon-client/modules',
        clientModulePath = 'client/modules';

    // rosolve the include path from modulname for concat
    var resolveModulPath = function (modulName) {

        // check params
        if (typeof modulName !== 'string') {
            throw new TypeError('Param "modulName" is required and must be of type string!');
        }

        // modulPath
        var modulPath = {path: modulName.replace(/\.+/g, '/'), clientModule: false, libModule: false};
        var checkBaboonModulePath = path.join(projectRoot, baboonModulePath, modulPath.path);
        var checkClientModulePath = path.join(projectRoot, clientModulePath, modulPath.path);

        // check module if exists in baboon-client or client path
        if (fs.existsSync(checkClientModulePath)) {
            // client module
            modulPath.path = clientModulePath + '/' + modulPath.path;
            modulPath.clientModule = true;
            modulPath.libModule = false;
        }
        else if (fs.existsSync(checkBaboonModulePath)) {
            // baboon-client module
            modulPath.path = baboonModulePath + '/' + modulPath.path;
            modulPath.clientModule = false;
            modulPath.libModule = true;
        }
        else {
            throw new Error('Module path does not exist: ' + JSON.stringify(modulPath));
        }

        return modulPath;
    };

    // returns content for import files
    var addImportFileContent = function (jsConfigName) {
        var contentHeader = 'angular.module(\'app.includes\',  [\n';
        var content = '';
        var contentFooter = ']);';
        var i, max;
        for (i = 0, max = imports[jsConfigName].length; i < max; i += 1) {
            content += '\'' + imports[jsConfigName][i] + '\'';

            // no comma for the last item
            if (i === (max - 1)) {
                content += '\n';
            }
            else {
                content += ',\n';
            }
        }

        // add content
        fileContents[jsConfigName] = contentHeader + content + contentFooter;
    };

    // add import
//    var addImport = function(importName, jsConfigName) {
//
//        // search with filter
//        var res = lxHelpers.arrayFilter(imports[jsConfigName], function(item) {
//            return item === importName;
//        });
//
//        // not found than push to app
//        if (res.length === 0) {
//            imports[jsConfigName].push(importName);
//        }
//    };

    // recursive add app files
    var addAppFiles = function (appName) {

        appName = appName || 'app';

        var appConfig = require(path.join(clientFolder, appName, '/app.conf.json')),
            appModules = appConfig.includes,
            toplevels = appConfig.toplevels,
            jsConfigName = 'bb_' + appName.replace('/', '_') + '_js',
            jsConfigNameTpl = jsConfigName + '_tpl',
            jsConfigNameTplLib = jsConfigNameTpl + '_lib',
            jsConfigNameTplClient = jsConfigNameTpl + '_client',
            htmlLibTemplates = [],
            htmlClientTemplates = [],
            jsFileName = jsConfigName.replace('_js', '').replace('bb_', '') + '.js',
            jsFileNameTpl = jsFileName.replace('.js', '.tpl.js'),
            jsFileNameCss = jsFileName.replace('.js', '.css'),
            jsNgminFileName = jsConfigName.replace('_js', '').replace('bb_', '') + '.ngmin.js',
            jsNgminFileNameTpl = jsNgminFileName.replace('.ngmin.js', '.tpl.ngmin.js'),
            jsMinFileName = jsConfigName.replace('_js', '').replace('bb_', '') + '.min.js',
            jsMinFileNameTpl = jsMinFileName.replace('.min.js', '.tpl.min.js'),
            jsMinFileNameCss = jsMinFileName.replace('.min.js', '.min.css'),
            i,
            max;

        // init concat for app and import concat for all js files, from concatBase
        concatConfig[jsConfigName] = lxHelpers.clone(config.concat.base);

        // crete imports array for app
        imports[jsConfigName] = [];

        // push module imports for app from Gruntfile includes.modules
        lxHelpers.arrayPushAll(imports[jsConfigName], config.includes.modules);

        // push module imports for app from app.conf.json imports
        lxHelpers.arrayPushAll(imports[jsConfigName], appModules);

        // remove duplicate modules
        imports[jsConfigName] = lxHelpers.arrayGetDistinctValues(imports[jsConfigName]);

        // add imports module paths to concat config
        lxHelpers.arrayForEach(imports[jsConfigName], function (item) {

            var modulePath = resolveModulPath(item);

            // push modules js files to app concat src
            concatConfig[jsConfigName].src.push(modulePath.path + '/**/*.js');

            // push ignore spec.js files to app concat src // geht bestimmt eleganter
            concatConfig[jsConfigName].src.push('!' + modulePath.path + '/**/*.spec.js');

            // push html templates
            if (modulePath.clientModule) {
                htmlClientTemplates.push(modulePath.path + '/**/*.html');
            }
            else if (modulePath.libModule) {
                htmlLibTemplates.push(modulePath.path + '/**/*.html');
            }
            else {
                throw new Error('modulePath fail: client or lib must be true');
            }
        });

        // push module imports for app from Gruntfile includes.concat
        lxHelpers.arrayPushAll(imports[jsConfigName], config.includes.concat);

        // push module imports for app from Gruntfile includes.system
        lxHelpers.arrayPushAll(imports[jsConfigName], config.includes.system);

        // add imports file content
        addImportFileContent(jsConfigName);

        // create entry for lib templates
        html2jsConfig[jsConfigNameTplLib] = {
            options: {
                base: baboonModulePath
            },
            src: htmlLibTemplates,
            dest: '<%= buildTmpFolder %>/tpls/lib.tpl.js',
            module: 'lib.templates'
        };

        // create entry for client templates
        html2jsConfig[jsConfigNameTplClient] = {
            options: {
                base: '<%= clientFolder %>/modules'
            },
            src: htmlClientTemplates,
            dest: '<%= buildTmpFolder %>/tpls/client.tpl.js',
            module: 'client.templates'
        };

        // push app files to app src
        concatConfig[jsConfigName].src.push('<%= clientFolder %>/' + appName + '/*.js');
        concatConfig[jsConfigName].src.push('<%= clientFolder %>/' + appName + '/**/*.js');

        // push app include file
        concatConfig[jsConfigName].src.push('<%= buildTmpFolder %>/includes/' + jsConfigName + '.js');

        // push ignore spec files
        concatConfig[jsConfigName].src.push('!<%= clientFolder %>/' + appName + '/**/*.spec.js');

        // set destination in app concat
        concatConfig[jsConfigName].dest = '<%= buildDistPublicFolder %>/js/' + jsFileName;

        // create app entry for html2js config
        html2jsConfig[jsConfigNameTpl] = {
            options: {
                base: '<%= clientFolder %>/' + appName
            },
            src: ['<%= clientFolder %>/' + appName + '/**/*.html', '!<%= clientFolder %>/' + appName + '/**/index.html'],
            dest: '<%= buildTmpFolder %>/tpls/' + jsFileNameTpl,
            module: 'app.templates'
        };

        // create app tpl entry for concat
        concatConfig[jsConfigNameTpl] = {
            options: {
                banner: '<%= banner %>'
            },
            src: [
                '<%= buildTmpFolder %>/tpls/lib.tpl.js',
                '<%= buildTmpFolder %>/tpls/client.tpl.js',
                '<%= buildTmpFolder %>/tpls/' + jsFileNameTpl
            ],
            dest: '<%= buildDistPublicFolder %>/js/' + jsFileNameTpl
        };

        // prepare ngmin config for templates
        ngminConfig[jsConfigNameTpl] = {
            src: ['<%= buildDistPublicFolder %>/js/' + jsFileNameTpl],
            dest: '<%= buildTmpFolder %>/js/' + jsNgminFileNameTpl
        };

        // prepare ngmin config for app js
        ngminConfig[jsConfigName] = {
            src: ['<%= buildDistPublicFolder %>/js/' + jsFileName],
            dest: '<%= buildTmpFolder %>/js/' + jsNgminFileName
        };

        // prepare uglify config
        uglifyConfig.target.files['<%= buildDistPublicFolder %>/js/' + jsMinFileName] = '<%= buildTmpFolder %>/js/' + jsNgminFileName;
        uglifyConfig.target.files['<%= buildDistPublicFolder %>/js/' + jsMinFileNameTpl] = '<%= buildTmpFolder %>/js/' + jsNgminFileNameTpl;

        // prepare less config
        lessConfig.debug.files['<%= buildDistPublicFolder %>/css/' + jsFileNameCss] = '<%= clientFolder %>/' + appName + '/main.less';
        lessConfig.release.files['<%= buildDistPublicFolder %>/css/' + jsMinFileNameCss] = '<%= clientFolder %>/' + appName + '/main.less';

        // toplevel
        if (toplevels && toplevels.length > 0) {

            // toplevel recursive
            for (i = 0, max = toplevels.length; i < max; i += 1) {

                // ignore toplevel js files in app
                concatConfig[jsConfigName].src.push('!<%= clientFolder %>/' + appName + '/' + toplevels[i] + '/**/*.js');

                // ignore toplevel html templates in app
                html2jsConfig[jsConfigNameTpl].src.push('!<%= clientFolder %>/' + appName + '/' + toplevels[i] + '/**/*.html');

                // addfiles for toplevel recursive
                addAppFiles(appName + '/' + toplevels[i]);
            }
        }
    };

    // start file append
    addAppFiles();

    return {
        concatConfig: concatConfig,
        ngminConfig: ngminConfig,
        uglifyConfig: uglifyConfig,
        lessConfig: lessConfig,
        html2jsConfig: html2jsConfig,
        fileContents: fileContents
    };
};