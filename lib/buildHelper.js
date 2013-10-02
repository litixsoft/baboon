'use strict'

var path = require('path'),
    fs = require('fs'),
    util = require('util'),
    lxHelpers = require('lx-helpers');

module.exports = function (config, root) {

    var concatConfig = {},
        ngminConfig = {},
        uglifyConfig = {target: {files: {}}},
        lessConfig = {debug: {files: {}}, release: {options: {yuicompress: true}, files: {}}},
        baboonConfig = config,
        clientFolder = path.join(root, 'client');

    console.log(clientFolder);

    // recursive add app files
    var addAppFiles = function (app_name) {

        var appName = app_name || 'app';

        // load app.conf.json
        var appConfig = require(path.join(clientFolder, appName, '/app.conf.json'));

        var clientModule = appConfig.optionalIncludes.client,
            baboonModule = appConfig.optionalIncludes.baboon,
            tpls = appConfig.toplevels,
            jsName = 'bb_' + appName.replace('/', '_') + '_js',
            cssName = 'bb_' + appName.replace('/', '_') + '_css',
            i,
            max;

        // import concat for all js files, from baboon_concat config
        concatConfig[jsName] = lxHelpers.clone(baboonConfig.concat.js);
        //concatConfig[cssName] = lxHelpers.clone(baboonConfig.concat.css);

        // destination concat
        concatConfig[jsName].dest = '<%= buildDistPublicFolder %>/js/' + jsName.replace('_js', '').replace('bb_', '') + '.js';
        //concatConfig[cssName].dest = '<%= buildDistPublicFolder %>/css/' + cssName.replace('_css', '').replace('bb_', '') + '.css';

        // add baboon optional module
        if (baboonModule && baboonModule.length > 0) {
            for (i = 0, max = baboonModule.length; i < max; i += 1) {

                // include js files
                concatConfig[jsName].src.push('<%= libVendorBaboonFolder %>/optional/' + baboonModule[i] + '/*.js');
                concatConfig[jsName].src.push('<%= libVendorBaboonFolder %>/optional/' + baboonModule[i] + '/**/*.js');

                // ignore spec.js files
                concatConfig[jsName].src.push('!<%= libVendorBaboonFolder %>/optional/' + baboonModule[i] + '/**/*.spec.js');
            }
        }

        // add client optional module
        if (clientModule && clientModule.length > 0) {
            for (i = 0, max = clientModule.length; i < max; i += 1) {

                // include js files
                concatConfig[jsName].src.push('<%= clientOptionalFolder %>/' + clientModule[i] + '/*.js');
                concatConfig[jsName].src.push('<%= clientOptionalFolder %>/' + clientModule[i] + '/**/*.js');

                // ignore spec.js files
                concatConfig[jsName].src.push('!<%= clientOptionalFolder %>/' + clientModule[i] + '/**/*.spec.js');
            }
        }

        // add app js files
        concatConfig[jsName].src.push('<%= clientFolder %>/' + appName + '/*.js');
        concatConfig[jsName].src.push('<%= clientFolder %>/' + appName + '/**/*.js');

        // ignore app spec.js files
        concatConfig[jsName].src.push('!<%= clientFolder %>/' + appName + '/**/*.spec.js');

        // include css files
        //concatConfig[cssName].src.push('<%= clientFolder %>/' + appName + '/*.css');
        //concatConfig[cssName].src.push('<%= clientFolder %>/' + appName + '/**/*.css');

        // prepare ngmin config
        ngminConfig[appName] = {
            src: ['<%= buildDistPublicFolder %>/js/' + jsName.replace('_js', '').replace('bb_', '') + '.js'],
            dest: '<%= buildTmpFolder %>/js/' + jsName.replace('_js', '').replace('bb_', '') + '.ngmin.js'
        };

        // prepare uglify config
        uglifyConfig.target.files['<%= buildDistPublicFolder %>/js/' + jsName.replace('_js', '').replace('bb_', '') +
            '.min.js'] = '<%= buildTmpFolder %>/js/' + jsName.replace('_js', '').replace('bb_', '') + '.ngmin.js';

        // prepare less config
        lessConfig.debug.files['<%= buildDistPublicFolder %>/css/' + jsName.replace('_js', '').replace('bb_', '') +
            '.css'] = '<%= clientFolder %>/' + appName + '/main.less';
        lessConfig.release.files['<%= buildDistPublicFolder %>/css/' + jsName.replace('_js', '').replace('bb_', '') +
            '.min.css'] = '<%= clientFolder %>/' + appName + '/main.less';


        // toplevel
        if (tpls && tpls.length > 0) {

            // toplevel recursive
            for (i = 0, max = tpls.length; i < max; i += 1) {

                // ignore toplevel js files in app
                concatConfig[jsName].src.push('!<%= clientFolder %>/' + appName + '/' + tpls[i] + '/**/*.js');

                // ignore toplevel css files in app
                //concatConfig[cssName].src.push('!<%= clientFolder %>/' + appName + '/' + tpls[i] + '/**/*.css');

                // addfiles for toplevel recursive
                addAppFiles(appName + '/' + tpls[i]);
            }
        }
    };

    // start file append
    addAppFiles();


    return {
        concatConfig: concatConfig,
        ngminConfig: ngminConfig,
        uglifyConfig: uglifyConfig,
        lessConfig: lessConfig
    };
};

