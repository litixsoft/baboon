'use strict';

var lxHelpers = require('lx-helpers');
var NavigationError = require('./errors').NavigationError;

/**
 * Get navigation for site
 * Returns an object for navigation, with the following methods.
 *
 * @return {Object}
 */
module.exports = function (navigationFilePath, config) {

    var rightsEnabled = config.rights.enabled;

    // check parameters
    if (typeof navigationFilePath !== 'string') {
        throw new NavigationError('Parameter navigationFilePath is required and must be a string type!');
    }

    // Load navigation from config folder
    var nav = require(navigationFilePath);
    var navList;
    var pub = {};

    var NAV_TYPE_LIST = 'list';

    /**
     * Helper for create navigation object
     *
     * @param {Object} value
     * @return {Object}
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

    var checkAcl = function(acl,route){

        var returnvalue = false;

        lxHelpers.forEach(acl, function(value,key){
            var pos = key.indexOf('/');
            var rightkey = key.substring(pos);
            if(rightkey.indexOf(route)===0 && value.hasAccess === true){
                returnvalue = true;
            }
        });
        return returnvalue;
    };

    /**
     * check and optimize navigation tree
     *
     * @param {object} tmpNav
     * @param {string} current
     * @param {string} type
     * @param {number} level
     */

    var checkNav = function (tmpNav, navList2, current, type, level, user) {

        level += 1;

        lxHelpers.forEach(tmpNav, function (value) {

            if(user && rightsEnabled){
                if(!checkAcl(user.acl,value.route)){
                    return;
                }
            }

            // add deep level of tree
            value.level = level;

            // check is current app
            if (value.app !== current) {
                // when not current set target to _self
                value.target = '_self';
            }

            // when list push in flat list
            if (type === NAV_TYPE_LIST) {
                navList2.push(addNavObj(value));
            } else {
                navList2.push(value);
            }

            // when children call recursive function
            if (value.children) {
                navList2.children = [];
                checkNav(value.children, navList2.children, current, type, level, user);
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
    pub.getTree = function(data, request, callback) {

        var current = data.current || 'main';

        var tmpNav = nav();

        navList = [];
        checkNav(tmpNav, navList, current, null, -1, request.session.user);

        callback(null, navList);
    };

    /**
     * Get navigation flat list
     *
     * @param {object} data The data object
     * @param {object} request The request object
     * @param {function=} callback The callback function
     */
    pub.getList = function(data, request, callback) {

        var current = data.current || 'main';

        var tmpNav = nav();
        navList = [];

        checkNav(tmpNav, navList,current, NAV_TYPE_LIST, -1, request.session.user);

        callback(null, navList);
    };

    /**
     * Get toplevel of navigation
     *
     * @param {object} data The data object
     * @param {object} request The request object
     * @param {function=} callback The callback function
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
     * @param {object} data The data object
     * @param {object} request The request object
     * @param {function=} callback The callback function
     */
    pub.getSubTree = function(data, request, callback) {

        if (!data.top) {
            return callback(new NavigationError('Parameter top in body is required!', 400));
        }

        var current = data.current || 'main';
        var top = data.top;

        var tmpNav = nav();
        var subNav = [];
        navList=[];

        lxHelpers.forEach(tmpNav, function (value) {

            if (value.route === top && value.children) {
                subNav = value.children;
                checkNav(subNav,navList, current, null, 0, request.session.user);
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
    pub.getSubList = function(data, request, callback) {

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
                checkNav(subNav, navList, current, NAV_TYPE_LIST, 0, request.session.user);
            }
        });

        return callback(null, navList);
    };

    return pub;
};