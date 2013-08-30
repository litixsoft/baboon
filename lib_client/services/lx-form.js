/*global angular*/
angular.module('lx.form', [])
    // form service with cache
    .factory('lxForm', ['cache', function (cache) {
        return function (modelName, key) {
            var pub = {},
                master = {};

            // the form data
            pub.model = {};

            /**
             * Resets the model to the master.
             *
             * @param {object} form The angularjs formcontroller.
             */
            pub.reset = function (form) {
                if (form) {
                    // clear form errors
                    form.errors = {};
                }

                // reset model
                pub.model = angular.copy(master);

                if (key) {
                    // reset model in cache
                    if (pub.model[key]) {
                        cache[pub.model[key]] = pub.model;
                    } else {
                        cache[modelName] = pub.model;
                    }
                }
            };

            /**
             * Checks if the model has changes.
             *
             * @returns {boolean}
             */
            pub.isUnchanged = function () {
                return angular.equals(pub.model, master);
            };

            /**
             * Tries to load the model from cache.
             *
             * @param {string=} key The key of the model.
             * @returns {boolean}
             */
            pub.hasLoadedModelFromCache = function (key) {
                if (key && cache[key]) {
                    // load from cache
                    pub.model = cache[key];

                    if (cache[key + '_Master']) {
                        // load master from cache
                        master = cache[key + '_Master'];
                    }

                    return true;
                } else if (!key) {
                    if (cache[modelName]) {
                        // load from cache
                        pub.model = cache[modelName];
                    } else {
                        // set cache
                        cache[modelName] = pub.model;
                    }

                    return true;
                }

                return false;
            };

            /**
             * Sets the model.
             *
             * @param {object} model The model.
             * @param {boolean} resetCache Specifies if the cache should be resettet.
             */
            pub.setModel = function (model, resetCache) {
                if (!pub.model[key] && resetCache) {
                    // no key -> create, delete model from cache
                    delete cache[modelName];
                }

                // set model
                pub.model = model;
                master = angular.copy(model);

                if (resetCache) {
                    // reset cache
                    delete cache[model[key]];
                    delete cache[model[key] + '_Master'];
                } else {
                    // set cache
                    cache[model[key]] = pub.model;
                    cache[model[key] + '_Master'] = master;
                }
            };

            /**
             * Add server validation to form.
             *
             * @param {object} form The angularjs form controller.
             * @param {array} errors The validation errors.
             */
            pub.populateValidation = function (form, errors) {
                if (errors) {
                    // reset form errors
                    form.errors = {};

                    for (var i = 0; i < errors.length; i++) {
                        // set form errors
                        form.errors[errors[i].property] = errors[i].attribute + ' ' + errors[i].message;
                    }
                }
            };

            return pub;
        };
    }]);