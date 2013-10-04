/*global angular*/
angular.module('app.enterprise', ['app.enterprise.services'])
    .config(function ($routeProvider) {
        $routeProvider.when('/enterprise', {templateUrl: 'enterprise/enterprise.html', controller: 'appEnterpriseCtrl'});
        $routeProvider.when('/enterprise/new', {templateUrl: 'enterprise/edit.html', controller: 'appEnterpriseNewCtrl'});
        $routeProvider.when('/enterprise/edit/:id', {templateUrl: 'enterprise/edit.html', controller: 'appEnterpriseEditCtrl'});
    })
    .constant('app.enterprise.modulePath', 'example/enterprise/')
    .controller('appEnterpriseCtrl', ['$scope', 'appEnterpriseCrew', 'lxModal',
        function ( $scope, appEnterpriseCrew, lxModal) {

            // alert helper var
            var lxAlert = $scope.lxAlert;

//            // modal helper var
//            var lxModal = $scope.lxModal;
            //

            $scope.headline = 'Üerschrift';
            $scope.message = 'Hallo Herr/Frau User(in), was soll ich nun machen?';
            $scope.type = 'Error';

            // getAll members from service
            var getAllMembers = function () {
                appEnterpriseCrew.getAll({}, function (result) {
                    $scope.crew = result.data;

                    // watch the crew and show or hide
                    $scope.$watch('crew', function (value) {
                        if (value.length === 0) {
                            $scope.visible.reset = false;
                            $scope.visible.create = true;
                        }
                        else {
                            $scope.visible.reset = true;
                            $scope.visible.create = false;
                        }
                    });
                });
            };

            // visible vars for controller
            $scope.visible = {
                reset: false,
                create: false
            };

            // init get all members and register watch for crew
            getAllMembers();

            // create test members for crew collection
            $scope.createTestMembers = function (reset) {
                reset = reset || null;
                if ($scope.crew.length === 0) {

                    appEnterpriseCrew.createTestMembers(function (result) {
                        if (result.message) {
                            lxAlert.error(result.message);
                            getAllMembers();
                        }
                        else if (result.data) {
                            if (reset) {
                                lxAlert.success('db reset.');
                            }
                            else {
                                lxAlert.success('crew created.');
                            }

                            $scope.crew = result.data;
                        }
                    });
                }
                else {
                    lxAlert.error('can\'t create test crew, already exists.');
                }
            };

            // delete crew collection and create test members
            $scope.resetDb = function () {
                if ($scope.crew.length > 0) {
                    appEnterpriseCrew.deleteAllMembers(function (result) {
                        if (result.message) {
                            lxAlert.error(result.message);
                        }
                        else if (result.success) {
                            $scope.crew = [];
                            $scope.createTestMembers(true);
                        }
                    });
                }
                else {
                    lxAlert.error('can\'t reset db, find no data.');
                }
            };

            // delete crew member by id
            $scope.deleteMember = function (id, name) {
                lxModal.msgBox('enterpriseDeleteMember'+name,false,'Crew-Member löschen?', 'Wollen Sie ' + name + ' wirklich löschen?', 'Warning', {
                    cbYes: function () {
                        appEnterpriseCrew.delete(id, function (result) {
                            if (result.success) {
                                lxAlert.success('crew member ' + name + ' deleted.');
                                getAllMembers();
                            }
                            else if (result.message) {
                                lxAlert.error(result.message);
                            }
                        });
                    },
                    cbNo: function () {}
                },'standard');

                setTimeout(function(){
                    lxModal.updateMsg('enterpriseDeleteMember'+name,'Diese neue Meldung wird dir vom Sven präsentiert. Du kannst aber gern trotzdem crew member '+ name +' löschen!');
                },2000);


            };
        }])
    .controller('appEnterpriseEditCtrl', ['$scope', '$location', '$routeParams', 'appEnterpriseCrew',
        function ($scope, $location, $routeParams, appEnterpriseCrew) {

            // visible vars for controller
            $scope.visible = {
                errors: false
            };

            $scope.validationErrors = {};

            appEnterpriseCrew.getById($routeParams.id, function (result) {
                $scope.person = result.data;
            });

            $scope.save = function () {
                appEnterpriseCrew.update($scope.person, function (result) {
                    if (result.success) {
                        $location.path('/enterprise');
                    }
                    else if (result.errors) {
                        $scope.lxAlert.warning('Server: validation Errors');
                        $scope.validationErrors = result.errors;
                        $scope.visible.errors = true;
                    }
                    else if (result.message) {
                        $scope.lxAlert.error(result.message);
                    }
                });
            };
        }])
    .controller('appEnterpriseNewCtrl', ['$scope', '$location', 'appEnterpriseCrew',
        function ($scope, $location, appEnterpriseCrew) {

            // empty person
            $scope.person = {name: '', description: ''};

            // visible vars for controller
            $scope.visible = {
                errors: false
            };

            // validation errors
            $scope.validationErrors = {};

            $scope.save = function () {
                appEnterpriseCrew.create($scope.person, function (result) {
                    if (result.data) {
                        $location.path('/enterprise');
                    }
                    else if (result.errors) {
                        $scope.lxAlert.warning('Server: validation Errors');
                        $scope.validationErrors = result.errors;
                        $scope.visible.errors = true;

                    }
                    else if (result.message) {
                        $scope.lxAlert.error(result.message);
                    }
                });
            };
        }]);