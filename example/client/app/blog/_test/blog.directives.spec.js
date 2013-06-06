/*global describe, it, expect, beforeEach, inject, angular, spyOn */
'use strict';

var compile, scope;

describe('blog directives', function () {
    beforeEach(module('blog.directives'));
    beforeEach(module('baboon.directives'));

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

    describe('lxPager', function () {
        var element, elementScope;

        beforeEach(inject(function ($compile, $rootScope) {
            compile = $compile;

            scope = $rootScope.$new();
            scope.count = 5;
            scope.getData = function (pagingOptions) {
                console.log(pagingOptions);
            };

            spyOn(scope, 'getData');

            element = angular.element('<lx-Pager count="count" page-sizes="[1, 5, 10]" on-paging="getData(pagingOptions)"></lx-Pager>');
            compile(element)(scope);
            scope.$digest();

            elementScope = element.scope();
        }));

        it('should be initialized correctly', function () {
            expect(element.html()).toContain('0 items');
            expect(elementScope.count).toBe(0);
            expect(elementScope.pageSize).toBe(5);
            expect(elementScope.currentPage).toBe(1);
            expect(elementScope.pageSizeOptions).toEqual([1, 5, 10]);
            expect(scope.getData).toHaveBeenCalled();
            expect(scope.getData.calls.length).toEqual(1);
        });

//        it('should convert empty text to html', function () {
//            var element = angular.element('<markdown ng-model="post.content"></markdown>');
//
//            compile(element)(scope);
//            scope.$digest();
//
//            expect(element.html()).toBe('');
//        });
//
//        it('should convert markdown to html', function () {
//            scope.post = {
//                content: '###Test'
//            };
//            var element = angular.element('<markdown ng-model="post.content"></markdown>');
//
//            compile(element)(scope);
//            scope.$digest();
//
//            expect(element.html()).toBe('<h3 id="test">Test</h3>');
//        });
    });
});