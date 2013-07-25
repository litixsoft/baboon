/*global describe, it, expect, beforeEach, inject, angular */
'use strict';

var compile, scope;

describe('blog directives', function () {
    beforeEach(module('blog.directives'));

    describe('markdown', function () {
        beforeEach(inject(function ($compile, $rootScope) {
            compile = $compile;
            scope = $rootScope.$new();
        }));

        it('should convert normal text to html', function () {
            scope.post = {
                content: 'wayne'
            };
            var element = angular.element('<markdown ng-model="post.content"></markdown>');

            compile(element)(scope);
            scope.$digest();

            expect(element.html()).toBe('<p>wayne</p>');
        });

        it('should convert empty text to html', function () {
            var element = angular.element('<markdown ng-model="post.content"></markdown>');

            compile(element)(scope);
            scope.$digest();

            expect(element.html()).toBe('');
        });

        it('should convert markdown to html', function () {
            scope.post = {
                content: '###Test'
            };
            var element = angular.element('<markdown ng-model="post.content"></markdown>');

            compile(element)(scope);
            scope.$digest();

            expect(element.html()).toBe('<h3 id="test">Test</h3>');
        });
    });
});