/*global angular*/
angular.module('enterpriseServices', [])
    .factory('enterpriseCrew', function ($rootScope){
        'use strict';
        $rootScope.enterpriseCrew = [
            {name: 'Picard', description: 'Captain'},
            {name: 'Riker', description: 'Number One'},
            {name: 'Worf', description: 'Security'}
        ];
    });
