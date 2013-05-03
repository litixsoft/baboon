/*global angular*/
angular.module('blog.directives', [])
    .directive('markdown', function () {
        var converter = new Showdown.converter();

        return {
            restrict: 'E',
            link: function (scope, element, attrs) {
                scope.$watch(attrs.ngModel, function (value, oldValue) {
//                    var markdown = value;
//                    var html = md.toHtml(markdown);
//                    element.html(html);

                    var htmlText = converter.makeHtml(value);
                    element.html(htmlText);
                });
            }
        };
    });