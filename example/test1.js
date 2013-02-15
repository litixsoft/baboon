module.exports = (function () {
    'use strict';

    if (bbConfig.serverMode === 'development') {
        bbConfig.settings = bbConfig.settings.development;
    }
    else {
        bbConfig.settings = bbConfig.settings.production;
    }
})();
