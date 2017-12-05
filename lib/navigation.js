'use strict';

var lxHelpers = require('lx-helpers');
var NavigationError = require('./errors').NavigationError;
//var util = require('util');

/**
 * Get navigation for site
 * Returns an object for navigation, with the following methods.
 *
 * @return {Object}
 */
module.exports = function (navigationFilePath, rights) {

    // check parameters
    if (typeof navigationFilePath !== 'string') {
        throw new NavigationError('Parameter navigationFilePath is required and must be a string type!');
    }

    // check parameters
    if (typeof rights !== 'object') {
        throw new NavigationError('Parameter rights is required and must be a object type!');
    }

    // Load navigation from config folder
    var nav = require(navigationFilePath);
    var navList;
    var navTree;
    var pub = {};

    /**
     * Helper for create navigation tree object
     *
     * @param {Object} value
     * @return {Object}
     */
    var addNavTreeObj = function (value) {

        var navObj = {
            title: value.title,
            route: value.route,
            controller: value.controller,
            norouting: value.norouting || false,
            app: value.app
        };

        if (value.level === 0 && value.order) {
            navObj.order = value.order;
        }

        navObj.level = value.level;

        if (value.target) {
            navObj.target = value.target;
        }

        if (value.children) {
            navObj.children = [];
        }

        return navObj;
    };

    /**
     * Helper for create navigation list object
     *
     * @param {Object} value
     * @return {Object}
     */
    var addNavListObj = function (value) {

        var navObj = {
            title: value.title,
            route: value.route,
            controller: value.controller,
            norouting: value.norouting || false,
            app: value.app
        };

        if (value.level === 0 && value.order) {
            navObj.order = value.order;
        }

        navObj.level = value.level;

        if (value.target) {
            navObj.target = value.target;
        }

        return navObj;
    };

    /**
     * check and optimize navigation tree
     *
     * @param tmpNav
     * @param navTree
     * @param current
     * @param level
     * @param user
     */
    var checkTreeNav = function (tmpNav, navTree, current, level, user) {

        level += 1;

        var i, max;

        for (i = 0, max = tmpNav.length; i < max; i += 1) {

            var hasRight = rights.userHasAccessToController(user, tmpNav[i].controller);

            if (hasRight) {

                // add deep level of tree
                tmpNav[i].level = level;

                // check is current app
                if (tmpNav[i].app !== current) {

                    // when not current set target to _self
                    tmpNav[i].target = '_self';
                }

                if (i > 0 && !navTree[i - 1]) {
                    navTree[i - 1] = addNavTreeObj(tmpNav[i]);

                    if (tmpNav[i].children) {
                        checkTreeNav(tmpNav[i].children, navTree[i - 1].children, current, level, user);
                    }
                }
                else {
                    navTree[i] = addNavTreeObj(tmpNav[i]);

                    if (tmpNav[i].children) {
                        checkTreeNav(tmpNav[i].children, navTree[i].children, current, level, user);
                    }
                }
            }
        }
    };

    /**
     * check and optimize navigation flat list
     *
     * @param {object} tmpNav
     * @param {string} current
     * @param {string} user
     * @param {number} level
     */
    var checkListNav = function (tmpNav, current, level, user) {

        level += 1;

        lxHelpers.forEach(tmpNav, function (value) {

            var hasRight = rights.userHasAccessToController(user, value.controller);

            if (hasRight) {

                // add deep level of tree
                value.level = level;

                // check is current app
                if (value.app !== current) {

                    // when not current set target to _self
                    value.target = '_self';
                }

                // push in flat list
                navList.push(addNavListObj(value));

                // when children call recursive function
                if (value.children) {
                    checkListNav(value.children, current, level, user);
                }
            }
        });
    };

    /**
     * Get navigation tree
     *
     * @param {object} data The data object
     * @param {object} request The request object
     * @param {function=} callback The callback function
     */
    pub.getTree = function (data, request, callback) {

        var current = data.current || 'main';
        var tmpNav = nav();
        navTree = [];

        checkTreeNav(tmpNav, navTree, current, -1, request.session.user);

        //console.log(util.inspect(navTree, { showHidden: true, depth: null, colors: true }));

        callback(null, navTree);
    };

    /**
     * Get navigation flat list
     *
     * @param {object} data The data object
     * @param {object} request The request object
     * @param {function=} callback The callback function
     */
    pub.getList = function (data, request, callback) {

        var current = data.current || 'main';

        var tmpNav = nav();
        navList = [];

        checkListNav(tmpNav, current, -1, request.session.user);

        callback(null, navList);
    };

    /**
     * Get toplevel of navigation
     *
     * @param {object} data The data object
     * @param {object} request The request object
     * @param {function=} callback The callback function
     */
    pub.getTopList = function (data, request, callback) {

        var current = data.current || 'main';
        var tmpNav = nav();
        navList = [];

        lxHelpers.forEach(tmpNav, function (value) {

            var hasRight = rights.userHasAccessToController(request.session.user, value.controller);

            if (hasRight) {

                value.level = 0;

                if (value.app !== current) {
                    value.target = '_self';
                }

                navList.push(addNavListObj(value));
            }
        });

        callback(null, navList);
    };

    /**
     * Get all sub links from a top as tree
     *
     * @param {object} data The data object
     * @param {object} request The request object
     * @param {function=} callback The callback function
     */
    pub.getSubTree = function (data, request, callback) {

        if (!data.top) {
            return callback(new NavigationError('Parameter top in body is required!', 400));
        }

        var current = data.current || 'main';
        var top = data.top;

        var tmpNav = nav();
        var subNav = [];
        navTree = [];

        lxHelpers.forEach(tmpNav, function (value) {

            if (value.route === top && value.children) {
                subNav = value.children;
                checkTreeNav(subNav, navTree, current, 0, request.session.user);
            }
        });

        return callback(null, subNav);
    };

    /**
     * Get all sub links from a top as flat list
     *
     * @param {Object} data The data object
     * @param {Object} request The request object
     * @param {Function} callback The callback function
     */
    pub.getSubList = function (data, request, callback) {

        if (!data.top) {
            return callback(new NavigationError('Parameter top in body is required!', 400));
        }

        var current = data.current || 'main';
        var top = data.top;

        var tmpNav = nav();
        var subNav = [];

        navList = [];

        lxHelpers.forEach(tmpNav, function (value) {

            if (value.route === top && value.children) {
                subNav = value.children;
                checkListNav(subNav, current, 0, request.session.user);
            }
        });

        return callback(null, navList);
    };

    return pub;
};
