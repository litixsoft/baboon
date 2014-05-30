'use strict';

var lxHelpers = require('lx-helpers');
var NavigationError = require('./errors').NavigationError;

/**
 * Get navigation for site
 * Returns an object for navigation, with the following methods.
 *
 * @return {Object}
 */
module.exports = function (navigationFilePath) {

    //var rightsEnabled = config.rights.enabled;

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

        var navObj = {
            title: value.title,
            route: value.route,
            controller: value.controller,
            app: value.app
        };

        if (value.level === 0 && value.order) {
            navObj.order = value.order;
        }

        navObj.level = value.level;
        navObj.target = value.target;

        return navObj;
    };

    /**
     * Helper for checking the navigation roles against the current user roles
     *
     * @param {Object} aclRoles The current user roles
     * @param {Object} roles The roles for a special route in navigation
     * @return {Object}
     */
//    var checkAcl = function(aclRoles,roles){
//        if(!roles || !rightsEnabled){
//            return true;
//        } else {
//            for(var x = 0; x < roles.length; x++){
//                for(var y = 0; y < aclRoles.length; y++){
//                    if(roles[x]===aclRoles[y].name){
//                        return true;
//                    }
//                }
//            }
//            return false;
//        }
//    };

    /**
     * check navigation tree for roles and deletes all route which are not allowed for the common role.
     *
     * @param {object} tmpNav
     * @param {string} current
     * @param {string} type
     * @param {number} level
     * @param {object} user
     */
//    var checkRights = function (tmpNav, current, type, level, user) {
//
//        var navTestList = [];
//        level += 1;
//
//        lxHelpers.forEach(tmpNav, function (value) {
//
//            console.log('#############');
//            console.log('user->',user.acl);
//            console.log('value->', value.controller);
//            console.log('#############');
//
//            value.level = level; // add deep level of tree
//
//            // check is current app
//            if (value.app !== current) {
//                value.target = '_self'; // when not current set target to _self
//            }
//
//            if (value.children) {
//                var childs = checkRights(value.children, current, type, level,user);
//                var val = addNavObj(value);
//                val.children = childs;
//
//                if(checkAcl(user.rolesAsObjects,val.roles) || user.name === 'sysadmin'){ // if(checkAcl(user.acl,val.route)){
//                    navTestList.push(val);
//                }
//            } else {
//                if(checkAcl(user.rolesAsObjects,value.roles) || user.name === 'sysadmin'){
//                    navTestList.push(addNavObj(value));
//                }
//            }
//        });
//
//        return navTestList;
//    };

//    var checkRights = function (acl, controller) {
//
//        console.log('#############');
//        console.log('acl', acl);
//        console.log('komme rein und prüfe ', controller);
//
//        // check *route in controller
//        if (controller.charAt(controller.length -1) === '*') {
//            console.log('enthält stern');
//
//            var allControllersAt = controller.substring(0, controller.length - 1);
//            console.log('alle controller von: ', allControllersAt);
//
//
//            lxHelpers.forEach(acl, function (value) {
//
//                console.log('der value ->', value);
//                console.log('der substring value ->', value.controller.substring(0, allControllersAt.length));
//
//                var controllerSubString = value.controller.substring(0, allControllersAt.length);
//
//                if (controllerSubString === allControllersAt) {
//
//                    console.log('return true');
//                    return true;
//                }
//            });
//
//            return false;
//        }
//        else {
//            console.log('Kein Stern');
//            return false;
//        }
//
//        console.log('#############');
//
//    };

    /**
     * check and optimize navigation tree
     *
     * @param {object} tmpNav
     * @param {string} current
     * @param {string} type
     * @param {number} level
     */
    var checkNav = function (tmpNav, current, type, level, user) {

        level += 1;

//        console.log('############# PARAMS');
//        console.log('tmpNav->',tmpNav);
//        console.log('current->', value.controller);
//        console.log('############# PARAMS END');

        lxHelpers.forEach(tmpNav, function (value) {

            //checkRights(user.acl, value.controller);


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
                checkNav(value.children, current, type, level, user);
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
        checkNav(tmpNav, current, null, -1, request.session.user);

        callback(null,tmpNav);
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

        checkNav(tmpNav, current, NAV_TYPE_LIST, -1, request.session.user);

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
//        var user = request.session.user;
        var tmpNav = nav();
        navList = [];

        lxHelpers.forEach(tmpNav, function (value) {

            value.level = 0;

            if (value.app !== current) {
                value.target = '_self';
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
//    pub.getSubTree = function(data, request, callback) {
//        if (!data.top) {
//            return callback(new NavigationError('Parameter top in body is required!', 400));
//        }
//
//        var current = data.current || 'main';
//        var top = data.top;
//
//        var tmpNav = nav();
//        var subNav = [];
//        navList=[];
//
//        var tmpRights = checkRights(tmpNav, current, null, -1, request.session.user);
//
//        lxHelpers.forEach(tmpRights, function (value) {
//
//            if (value.route === top && value.children) {
//                subNav = value.children;
//                checkNav(subNav,current, null, 0);
//            }
//        });
//
//        return callback(null, subNav);
//    };

    pub.getSubTree = function(data, request, callback) {

        if (!data.top) {
            return callback(new NavigationError('Parameter top in body is required!', 400));
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
     * @param {Object} data The data object
     * @param {Object} request The request object
     * @param {Function} callback The callback function
     */
//    pub.getSubList = function(data, request, callback) {
//        if (!data.top) {
//            return callback(new NavigationError('Parameter top in body is required!', 400));
//        }
//
//        var current = data.current || 'main';
//        var top = data.top;
//
//        var tmpNav = nav();
//        var subNav = [];
//
//        navList = [];
//
//        var tmpRights = checkRights(tmpNav, current, null, -1, request.session.user);
//
//        lxHelpers.forEach(tmpRights, function (value) {
//
//            if (value.route === top && value.children) {
//                subNav = value.children;
//                checkNav(subNav, current, NAV_TYPE_LIST, 0);
//            }
//        });
//
//        return callback(null, navList);
//    };

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
                checkNav(subNav, current, NAV_TYPE_LIST, 0);
            }
        });

        return callback(null, navList);
    };

    return pub;
};