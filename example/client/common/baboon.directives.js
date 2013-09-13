/*global angular, Showdown, hljs*/
angular.module('baboon.directives',  [
    'ui.if',
    'lx.fileUpload',
    'lx.float',
    'lx.integer',
    'lx.pager',
    'lx.sort'
])
.directive('markdown', function () {
    var converter = new Showdown.converter();

    return {
        restrict: 'E',
        link: function (scope, element, attrs) {
            scope.$watch(attrs.ngModel, function (value) {
                var htmlText = converter.makeHtml(value || '');

                element.html(htmlText);

                var pres = element.find('pre');
                if(pres.length){
                    angular.forEach(pres, function(value){
                        try{
                            hljs.highlightBlock(value);
                        } catch(e) {
                            console.log('Error highlight.js\n'+e);
                        }
                    });
                }
            });
        }
    };
});
