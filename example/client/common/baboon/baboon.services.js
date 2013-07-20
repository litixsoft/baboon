/*global angular, io*/
angular.module('baboon.services', [])
    .factory('msgBox', function () {
        var pub = {},
            modal = {
                opts: {
                    backdropClick: false,
                    backdropFade: true,
                    dialogFade: true
                }
            };

        /**
         * Closes the modal window and clears the error message/action.
         */
        modal.close = function () {
            modal.shouldBeOpen = false;
            modal.message = '';
            modal.type = '';
            modal.action = null;
        };

        /**
         * Opens the modal window.
         *
         * @param {string} message The message to show.
         * @param {string=} type The message type.
         * @param {function=} callback The callback action when click the ok button in the modal window.
         */
        modal.show = function (message, type, callback) {
            modal.shouldBeOpen = true;
            modal.message = message;
            modal.type = type || 'Error';
            modal.action = callback;
        };

        /**
         * Executes the action and closes the modal window
         */
        modal.ok = function () {
            if (typeof modal.action === 'function') {
                modal.action.call();
            }

            modal.close();
        };

        pub.modal = modal;

        return pub;
    })
    .factory('socket', ['$rootScope', '$window', '$location', 'msgBox', function ($rootScope, $window, $location, msgBox) {
        var protocol = $window.location.protocol;
        var hostname = $window.location.hostname;
        var port = $window.location.port;
        var transports = ['websocket', 'xhr-polling', 'jsonp-polling'];

        if (protocol === 'https') {
            protocol = 'wss';
        }
        else {
            protocol = 'ws';
        }

        // karma fix
        if (port > 9870 && port < 9900 && hostname === 'localhost') {
            transports = ['xhr-polling', 'jsonp-polling'];
        }

        var host = protocol + '://' + hostname + ':' + port;
        var socket = io.connect(host, {'connect timeout': 4000, 'transports': transports});

        socket.on('error', function (err) {
            console.error('Unable to connect Socket.IO: ', err);

            if (err === 'handshake unauthorized') {
                $rootScope.$apply(function () {
                    msgBox.modal.show('Session is expired! Please log in.', 'Warning', function () {
                        window.location.assign('/login');
                    });
                });
            } else {
                $rootScope.$apply(function () {
                    msgBox.modal.show('Server error! ' + err, 'Error');
                });
            }
        });

        socket.on('disconnect', function () {
            console.error('Lost connection to Socket.IO');

            $rootScope.$apply(function () {
                msgBox.modal.show('Lost connection to server!', 'Warning');
            });
        });

        socket.on('connect', function () {
            console.log('socket.io connected with: ' + socket.socket.transport.name);
        });

        socket.on('connect_error', function (err) {
            console.error('connect_error: ', err);
        });

        socket.on('connect_timeout', function () {
            console.error('connect_timeout...');
        });

        socket.on('reconnect', function (transport) {
            console.log('socket.io reconnect with: ' + transport);

            $rootScope.$apply(function () {
                msgBox.modal.close();
            });
        });

        socket.on('reconnecting', function () {
            var reconnectionAttempts = arguments[1] || 0;
            console.log('Try to reconnect with: ' + socket.socket.transport.name + ', attempt: ' + reconnectionAttempts);

            $rootScope.$apply(function () {
                if (reconnectionAttempts === 1) {
                    msgBox.modal.message += ' Trying to reconnect. Attempt: ' + reconnectionAttempts;
                } else {
                    msgBox.modal.message = msgBox.modal.message.replace((reconnectionAttempts - 1).toString(), reconnectionAttempts);
                }
            });
        });

        socket.on('reconnect_error', function (err) {
            console.error('socket.io reconnect_error: ', err);
        });

        socket.on('reconnect_failed', function () {
            console.error('socket.io reconnect_failed');
        });

        socket.on('site_reload', function () {
            console.warn('Site Reload triggered by Server');

            $rootScope.$apply(function () {
                msgBox.modal.show('Session is expired! Please log in.', 'Warning', function () {
                    window.location.assign('/login');
                });
            });
        });

        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                });
            }
        };
    }])
    .factory('cache', function () {
        return {};
    })
    .factory('lxPager', function () {
        return function (model) {
            var pub = {};

            pub.currentPage = 1;
            pub.count = 0;
            pub.pageSize = 5;
            pub.pageSizes = [1, 2, 3, 4, 5, 10];

            pub.skip = function () {
                return (pub.currentPage - 1) * pub.pageSize;
            };

            pub.numberOfPages = function () {
                if (pub.pageSize < 1) {
                    pub.pageSize = 1;
                }

                return Math.ceil(pub.count / pub.pageSize);
            };

            pub.getOptions = function () {
//                var params = model.params || {};

                return {
                    limit: pub.pageSize,
                    skip: pub.skip()
//                    fields: params.fields,
//                    sortBy: params.sortBy,
//                    sort: params.sort
                };
            };

            pub.getAll = function () {
                model.service.getAllWithCount({
                    params: (model.params || {}).filter || {},
                    options: pub.getOptions()
                }, function (result) {
                    if (result.count) {
                        pub.count = result.count;
                    }

                    model.callback(result);
                });
            };

            pub.nextPage = function () {
                var currentPage = pub.currentPage;
                var count = currentPage * pub.pageSize;

                if (count < pub.count) {
                    pub.currentPage = ++currentPage;
//                    pub.getAll();
                }
            };

            pub.previousPage = function () {
                var currentPage = pub.currentPage;

                if (currentPage !== 1) {
                    pub.currentPage = --currentPage;
//                    pub.getAll();
                }
            };

            pub.firstPage = function () {
                pub.currentPage = 1;
//                pub.getAll();
            };

            pub.lastPage = function () {
                pub.currentPage = pub.numberOfPages();
            };

            return pub;
        };
    })
    .factory('lxForm', ['cache', function (cache) {
        return function (modelName, key) {
            var pub = {},
                master = {};

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
             * @param errors
             */
            pub.populateValidation = function (form, errors) {
                if (errors) {
                    // reset form errors
                    form.errors = {};

                    for (var i = 0; i < errors.length; i++) {
//                        form[errors[i].property].$invalid = true;
//                        form[errors[i].property].$dirty = true;
                        // set form errors
                        form.errors[errors[i].property] = errors[i].attribute + ' ' + errors[i].message;
                    }
                }
            };

            return pub;
        };
    }])
    .factory('inlineEdit', function () {
        return function () {
            var pub = {},
                master = {};

            pub.model = {};

            pub.isUnchanged = function () {
                return angular.equals(pub.model, master);
            };

            pub.reset = function (model, form) {
                if (form) {
                    form.errors = {};
                }

                angular.copy(master, model);
                pub.model = angular.copy(master);
            };

            pub.setModel = function (model) {
                pub.model = model;
                master = angular.copy(model);
            };

            pub.populateValidation = function (form, errors) {
                if (errors) {
                    form.errors = {};

                    for (var i = 0; i < errors.length; i++) {
                        form.errors[errors[i].property] = errors[i].attribute + ' ' + errors[i].message;
                    }
                }
            };

            return pub;
        };
    })
    .factory('session', ['socket', function (socket) {
        var pub = {};

        console.log('session started');

        pub.getAll = function (callback) {
            socket.emit('session:getAll', {}, callback);
        };

        pub.setData = function (data, callback) {
            socket.emit('session:setData', data, callback);
        };

        pub.getData = function (key, callback) {
            socket.emit('session:getData', key, callback);
        };

        pub.setActivity = function () {
            console.log('session_activity');
            socket.emit('session_activity');
        };

        return pub;
    }]);
