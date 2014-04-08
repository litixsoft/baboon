'use strict';

var lxHelpers = require('lx-helpers');
var NavigationError = require('./errors').NavigationError;

/**
 * Get navigation for site
 *
 * @returns {*}
 */
module.exports = function (navigationFilePath) {

    // Load navigation from config folder
    var nav = require(navigationFilePath);
    var navList;
    var pub = {};

    var NAV_TYPE_LIST = 'list';

    /**
     * Helper for create navigation object
     *
     * @param value
     * @returns {*}
     */
    var addNavObj = function (value) {

        return {
            title: value.title,
            route: value.route,
            target: value.target,
            level: value.level,
            app: value.app
        };
    };

    /**
     * check and optimize navigation tree
     *
     * @param tmpNav
     * @param current
     * @param type
     * @param level
     */
    var checkNav = function (tmpNav, current, type, level) {

        level += 1;

        lxHelpers.forEach(tmpNav, function (value) {

            // add deep level of tree
            value.level = level;

            // check is current app
            if (value.app !== current) {

                // when not current set target to _self
                value.target = '_self';
            }

            // when list push in flat list
            if (type === NAV_TYPE_LIST) {
                navList.push(addNavObj(value));
            }

            // when children call recursive function
            if (value.children) {
                checkNav(value.children, current, type, level);
            }
        });
    };

    /**
     * Get navigation tree
     *
     * @param data
     * @param request
     * @param callback
     */
    pub.getTree = function(data, request, callback) {

        var current = data.current || 'main';

        var tmpNav = nav();

        checkNav(tmpNav, current, null, -1);

        callback(null, tmpNav);
    };

    /**
     * Get navigation flat list
     *
     * @param data
     * @param request
     * @param callback
     */
    pub.getList = function(data, request, callback) {

        var current = data.current || 'main';

        var tmpNav = nav();
        navList = [];

        checkNav(tmpNav, current, NAV_TYPE_LIST, -1);

        callback(null, navList);
    };

    /**
     * Get toplevel of navigation
     *
     * @param data
     * @param request
     * @param callback
     */
    pub.getTopList = function(data, request, callback) {

        var current = data.current || 'main';

        var tmpNav = nav();
        navList = [];

        lxHelpers.forEach(tmpNav, function (value) {

            value.level = 0;

            if (value.app !== current) {
                value.target = '_self';
            }
            else {
                value.target = '';
            }

            navList.push(addNavObj(value));
        });

        callback(null, navList);
    };

    /**
     * Get all sub links from a top as tree
     *
     * @param data
     * @param request
     * @param callback
     */
    pub.getSubTree = function(data, request, callback) {

        if (!data.top) {
            return callback(new NavigationError(400, 'getSubTree', 'Parameter top in body is required!'));
        }

        var current = data.current || 'main';
        var top = data.top;

        var tmpNav = nav();
        var subNav = [];

        lxHelpers.forEach(tmpNav, function (value) {

            if (value.route === top && value.children) {
                subNav = value.children;
                checkNav(subNav, current, null, 0);
            }
        });

        return callback(null, subNav);
    };

    /**
     * Get all sub links from a top as flat list
     *
     * @param data
     * @param request
     * @param callback
     */
    pub.getSubList = function(data, request, callback) {

        if (!data.top) {
            return callback(new NavigationError(400, 'getSubList', 'Parameter top in body is required!'));
        }

        var current = data.current || 'main';
        var top = data.top;

        var tmpNav = nav();
        var subNav = [];

        navList = [];

        lxHelpers.forEach(tmpNav, function (value) {

            if (value.route === top && value.children) {
                subNav = value.children;
                checkNav(subNav, current, NAV_TYPE_LIST, 0);
            }
        });

        return callback(null, navList);
    };

    return pub;
};
