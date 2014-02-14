'use strict';

module.exports = function (app) {
    var pub = {};

    /**
     * @roles Guest, User
     * @description Gets the settings of the current user.
     */
    pub.getUserSettings = function (data, request, callback) {
        app.settings.getUserSettingsFromRequest(request, callback);
    };

    /**
     * @roles Guest, User
     * @description Adds a setting to the current user.
     */
    pub.addUserSetting = function (data, request, callback) {
        app.settings.setUserSettingFromRequest(request, data, callback);
    };

    /**
     * @roles Guest, User
     * @description Generate some test settings for the current user.
     */
    pub.generateTestSettings = function(data, request, callback) {
        app.settings.setUserSettingsFromRequest(request, {isCool: true, numberOfJeans: 10, node: 'js'}, callback);
    };

    return pub;
};
