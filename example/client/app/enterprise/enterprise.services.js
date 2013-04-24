angular.module('enterprise.services', [])
    .factory('enterpriseCrew', function () {
        return [
            {name: 'Picard', description: 'Captain'},
            {name: 'Riker', description: 'Number One'},
            {name: 'Worf', description: 'Security'}
        ];
    });
