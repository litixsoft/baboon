angular.module('enterpriseServices', [])
    .factory('enterpriseCrew', function ($rootScope) {
        $rootScope.enterpriseCrew = [
            {name: 'Picard', description: 'Captain'},
            {name: 'Riker', description: 'Number One'},
            {name: 'Worf', description: 'Security'}
        ];
    });
