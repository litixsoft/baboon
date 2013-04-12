/*global angular*/
angular.module('enterprise.services', [])
    .factory('crew', function ($rootScope){
        'use strict';
        $rootScope.crew = [
            {name: 'Picard', description: 'Captain'},
            {name: 'Riker', description: 'Number One'},
            {name: 'Worf', description: 'Security'}
        ];
    });
