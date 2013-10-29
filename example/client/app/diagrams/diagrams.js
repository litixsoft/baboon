/*global angular, d3*/
angular.module('diagrams', [])
    // config home module
    .config(function ($routeProvider) {
        $routeProvider.when('/diagrams', {templateUrl: 'diagrams/diagrams.html', controller: 'diagramsCtrl'});
    }).controller('diagramsCtrl',[ '$scope', function($scope){

        var datenTest = 'name,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012\n'+
            'Portugal,5.56,6.53,6.3,6.5,6.7,6.4,6.3,6.3,6.6,6.1,6.6,6.6,6.5,6.1,5.8,6.0,6.1,6.3\n'+
            'Belarus,,,3.3,3.9,3.4,4.1,,4.8,4.2,2.0,2.1,2.1,2.1,2.0,2.4,2.5,2.4,3.1\n'+
            'Philippines,2.77,2.69,2.6,3.3,3.6,2.8,2.9,2.6,2.5,2.3,2.5,2.5,2.5,2.3,2.4,2.4,2.6,3.3\n'+
            'Hong Kong,7.12,7.01,8.0,7.8,7.7,7.7,7.9,8.2,8.0,8.1,8.3,8.3,8.3,8.1,8.2,8.4,8.4,7.6\n'+
            'Tanzania,,,2.8,1.9,1.9,2.5,2.2,2.7,2.5,3.0,2.9,2.9,3.2,3.0,2.6,2.7,3.0,3.4\n'+
            'Mali,,,3.2,,,,,,3.0,3.1,2.8,2.8,2.7,3.1,2.8,2.7,2.8,3.4\n'+
            'Morocco,,,3.2,3.7,4.1,4.7,,3.7,3.3,3.5,3.2,3.2,3.5,3.5,3.3,3.4,3.4,3.7\n'+
            'Ecuador,,3.19,2.4,2.3,2.4,2.6,2.3,2.2,2.2,2.0,2.3,2.3,2.1,2.0,2.2,2.5,2.7,3.2\n'+
            'Kyrgyzstan,,,2.2,,2.2,,,,2.1,1.8,2.2,2.2,2.1,1.8,1.9,2.0,2.1,2.3\n'+
            'Indonesia,1.94,2.65,2.0,2.0,1.7,1.7,1.9,1.9,1.9,2.6,2.4,2.4,2.3,2.6,2.8,2.8,3.0,3.2\n'+
            'Luxembourg,6.85,,8.4,8.7,8.8,8.6,8.7,9.0,8.7,8.3,8.6,8.6,8.4,8.3,8.2,8.5,8.5,7.9\n'+
            'Afghanistan,,,,,,,,,,1.5,,,1.8,1.5,1.3,1.4,1.5,0.8\n'+
            'Nicaragua,,,2.7,3.0,3.1,,2.4,2.5,2.6,2.5,2.6,2.6,2.6,2.5,2.5,2.5,2.5,2.9\n'+
            'Chile,7.94,6.8,7.4,6.8,6.9,7.4,7.5,7.5,7.4,6.9,7.3,7.3,7.0,6.9,6.7,7.2,7.2,7.2\n'+
            'Haiti,,,1.5,,,,,2.2,1.5,1.4,1.8,1.8,1.6,1.4,1.8,2.2,1.8,1.9\n'+
            'France,7.0,6.96,7.1,6.7,6.6,6.7,6.7,6.3,6.9,6.9,7.4,7.4,7.3,6.9,6.9,6.8,7.0,7.1\n'+
            'Puerto Rico,,,,,,,,,,5.8,,,,5.8,5.8,5.8,5.6,6.2\n'+
            'Bahrain,,,5.8,,,,,,6.1,5.4,5.7,5.7,5.0,5.4,5.1,4.9,5.1,4.9\n'+
            'Cape Verde,,,,,,,,,,5.1,,,4.9,5.1,5.1,5.1,5.5,6.0\n'+
            'Sierra Leone,,,2.3,,,,,,2.2,1.9,2.2,2.2,2.1,1.9,2.2,2.4,2.5,3.1\n'+
            'Djibouti,,,,,,,,,,3.0,,,2.9,3.0,2.8,3.2,3.0,3.6\n'+
            'Palestine,,,2.5,,,,,,3.0,,,,,,,,,\n'+
            'Latvia,,,4.0,2.7,3.4,3.4,3.4,3.7,3.8,5.0,4.7,4.7,4.8,5.0,4.5,4.3,4.2,4.9\n'+
            'Bangladesh,,2.29,1.5,,,,0.4,1.2,1.3,2.1,2.0,2.0,2.0,2.1,2.4,2.4,2.7,2.6\n'+
            'Bosnia and Herzegovina,,,3.1,,,,,,3.3,3.2,2.9,2.9,3.3,3.2,3.0,3.2,3.2,4.2\n'+
            'Panama,,,3.7,,,,3.7,3.0,3.4,3.4,3.1,3.1,3.2,3.4,3.4,3.6,3.3,3.8\n'+
            'Samoa,,,,,,,,,,4.4,,,4.5,4.4,4.5,4.1,3.9,\n'+
            'Uzbekistan,,,2.3,,1.8,2.4,2.7,2.9,2.4,1.8,2.1,2.1,1.7,1.8,1.7,1.6,1.6,1.5\n'+
            'Oman,,,6.1,,,,,,6.3,5.5,5.4,5.4,4.7,5.5,5.5,5.3,4.8,4.6\n'+
            'Burundi,,,,,,,,,,1.9,2.4,2.4,2.5,1.9,1.8,1.8,1.9,1.9\n'+
            'Turkey,4.1,3.54,3.2,3.4,3.6,3.8,3.6,3.2,3.1,4.6,3.8,3.8,4.1,4.6,4.4,4.4,4.2,4.8\n'+
            'Guyana,,,,,,,,,,2.6,2.5,2.5,2.6,2.6,2.6,2.7,2.5,2.8\n'+
            'Niger,,,2.2,,,,,,,2.8,2.3,2.3,2.6,2.8,2.9,2.6,2.5,3.3\n'+
            'Kiribati,,,,,,,,,,3.1,,,3.3,3.1,2.8,3.2,3.1,\n'+
            'Czech Republic,,5.37,4.2,4.8,4.6,4.3,3.9,3.7,3.9,5.2,4.8,4.8,5.2,5.2,4.9,4.6,4.4,4.9';

        $scope.yearList = [];
        $scope.sortDirection = 'descending';
        $scope.chartType = 'ring';
        $scope.selected = { year : 2012, year2: 1995, name: 'Luxembourg', country: {}};
        $scope.sortValue = $scope.selected.year;
        $scope.align = true;

        for(var i = 0; i < 18; i++ ){
            $scope.yearList.push({ year: (i+1995) });
        }

        $scope.setYear = function(year){
            $scope.selected.year = year;
        };

        $scope.setYear2 = function(year){
            $scope.selected.year2 = year;
        };

        function loadYearData2() {

            $scope.arcdata = d3.csv.parse(datenTest);

        }

        loadYearData2();

    }]);
