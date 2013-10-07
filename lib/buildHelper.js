'use strict';

var path = require('path'),
    lxHelpers = require('lx-helpers');

module.exports = function (projectRoot, config) {

    var concatConfig = {},
        ngminConfig = lxHelpers.clone(config.ngmin),
        uglifyConfig = {target: {files: {}}},
        lessConfig = lxHelpers.clone(config.less),
        html2jsConfig = lxHelpers.clone(config.html2js),
        clientFolder = path.join(projectRoot, 'client');

    // recursive add app files
    var addAppFiles = function (appName) {

        appName = appName || 'app';

        var appConfig = require(path.join(clientFolder, appName, '/app.conf.json')),
            clientModule = appConfig.includes.optional.client,
            baboonModule = appConfig.includes.optional.baboon,
            toplevels = appConfig.toplevels,
            jsConfigName = 'bb_' + appName.replace('/', '_') + '_js',
            jsConfigNameTpl = jsConfigName + '_tpl',
            jsConfigNameTplLibOptional = jsConfigNameTpl + '_lib_optional',
            jsConfigNameTplClientOptional = jsConfigNameTpl + '_client_optional',
            libTemplates = [],
            clientTemplates = [],
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

        // add baboon optional module
        if (baboonModule && baboonModule.length > 0) {
            for (i = 0, max = baboonModule.length; i < max; i += 1) {

                // push baboon optional js files to app concat src
                concatConfig[jsConfigName].src.push('<%= clientVendorBaboonFolder %>/optional/' + baboonModule[i] + '/**/*.js');

                // push baboon optional ignore spec.js files to app concat src
                concatConfig[jsConfigName].src.push('!<%= clientVendorBaboonFolder %>/optional/' + baboonModule[i] + '/**/*.spec.js');

                // push baboon optional templates
                libTemplates.push('<%= libVendorBaboonFolder %>/optional/' + baboonModule[i] + '/**/*.html');
            }
        }

        // add client optional module
        if (clientModule && clientModule.length > 0) {
            for (i = 0, max = clientModule.length; i < max; i += 1) {

                // push client optional js files to app concat src
                concatConfig[jsConfigName].src.push('<%= clientOptionalFolder %>/' + clientModule[i] + '/**/*.js');

                // push client optional ignore spec.js files to app concat src
                concatConfig[jsConfigName].src.push('!<%= clientOptionalFolder %>/' + clientModule[i] + '/**/*.spec.js');

                // push client optional templates
                clientTemplates.push('<%= clientOptionalFolder %>/' + clientModule[i] + '/**/*.html');
            }
        }

        // create entry for babonn optional templates
        if (libTemplates.length > 0) {
            html2jsConfig[jsConfigNameTplLibOptional] = {
                options: {
                    base: '<%= libVendorBaboonFolder %>/optional'
                },
                src: libTemplates,
                dest: '<%= buildTmpFolder %>/tpls/lib.optional.tpl.js',
                module: 'lib.optional.templates'
            };
        }

        // create entry for client optional templates
        if (libTemplates.length > 0) {
            html2jsConfig[jsConfigNameTplClientOptional] = {
                options: {
                    base: '<%= clientOptionalFolder %>/'
                },
                src: clientTemplates,
                dest: '<%= buildTmpFolder %>/tpls/optional.tpl.js',
                module: 'optional.templates'
            };
        }

        // push app files to app src
        concatConfig[jsConfigName].src.push('<%= clientFolder %>/' + appName + '/*.js');
        concatConfig[jsConfigName].src.push('<%= clientFolder %>/' + appName + '/**/*.js');

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
            module: appName + '.templates'
        };

        // create app tpl entry for concat
        concatConfig[jsConfigNameTpl] = {
            options: {
                banner: '<%= banner %>'
            },
            src: [
                '<%= buildTmpFolder %>/tpls/lib.common.tpl.js',
                '<%= buildTmpFolder %>/tpls/common.tpl.js',
                '<%= buildTmpFolder %>/tpls/lib.optional.tpl.js',
                '<%= buildTmpFolder %>/tpls/optional.tpl.js',
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
        html2jsConfig: html2jsConfig
    };
};