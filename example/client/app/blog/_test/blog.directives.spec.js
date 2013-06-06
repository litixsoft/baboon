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
            spyOn(elementScope, 'refresh');
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

        it('should use the default page-Sizes if the page-Sizes injected through the attrs are no array', function () {
            element = angular.element('<lx-Pager count="count" page-sizes="23" on-paging="getData(pagingOptions)"></lx-Pager>');
            compile(element)(scope);
            scope.$digest();
            elementScope = element.scope();

            expect(elementScope.pageSizeOptions).toEqual([1, 5, 10, 25, 100]);
        });

        it('should have a function skip() which returns the skip value', function () {
            expect(elementScope.skip()).toBe(0);

            elementScope.currentPage = 5;

            expect(elementScope.skip()).toBe(20);

            elementScope.pageSize = 1;

            expect(elementScope.skip()).toBe(4);
        });

        it('should have a function numberOfPages() which returns number of pages', function () {
            expect(elementScope.numberOfPages()).toBe(0);

            elementScope.count = 5;

            expect(elementScope.numberOfPages()).toBe(1);

            elementScope.pageSize = 0;

            expect(elementScope.numberOfPages()).toBe(5);
        });

        it('should have a function getOptions() which returns the paging options', function () {
            expect(elementScope.getOptions()).toEqual({limit: 5, skip: 0});

            elementScope.pageSize = 3;

            expect(elementScope.getOptions()).toEqual({limit: 3, skip: 0});

            elementScope.currentPage = 5;

            expect(elementScope.getOptions()).toEqual({limit: 3, skip: 12});
        });

        it('should have a function nextPage() which should page to the next page', function () {
            elementScope.nextPage();
            expect(elementScope.currentPage).toBe(1);

            elementScope.count = 50;
            elementScope.nextPage();

            expect(elementScope.currentPage).toBe(2);
        });

        it('should have a function previousPage() which should page to the previousPage page', function () {
            elementScope.previousPage();
            expect(elementScope.currentPage).toBe(1);

            elementScope.count = 50;
            elementScope.currentPage = 3;
            elementScope.previousPage();

            expect(elementScope.currentPage).toBe(2);
        });

        it('should have a function firstPage() which should page to the first page', function () {
            elementScope.firstPage();
            expect(elementScope.currentPage).toBe(1);

            elementScope.count = 50;
            elementScope.currentPage = 3;
            elementScope.firstPage();

            expect(elementScope.currentPage).toBe(1);
        });

        it('should have a function lastPage() which should page to the last page', function () {
            elementScope.lastPage();
            expect(elementScope.currentPage).toBe(1);

            elementScope.count = 50;
            elementScope.currentPage = 3;
            elementScope.lastPage();

            expect(elementScope.currentPage).toBe(10);
        });

        describe('has a function refresh() which', function () {
            it('should refresh the data when the pageSize changes', function () {
                elementScope.pageSize = 7;

                setTimeout(function () {
                    expect(elementScope.refresh).toHaveBeenCalled();
                    expect(elementScope.refresh.calls.length).toEqual(1);
                }, 250);
            });

            it('should refresh the data when the count changes', function () {
                elementScope.currentPage = 99;
                elementScope.count = 20;

                setTimeout(function () {
                    expect(elementScope.numberOfPages()).toBe(4);
                    expect(elementScope.currentPage).toBe(4);
                    expect(elementScope.refresh).toHaveBeenCalled();
                    expect(elementScope.refresh.calls.length).toEqual(1);
                }, 250);
            });

            it('should not refresh the data when the count changes but the current page is smaller than the number of pages', function () {
                elementScope.count = 7;

                setTimeout(function () {
                    expect(elementScope.refresh).not.toHaveBeenCalled();
                    expect(elementScope.refresh.calls.length).toEqual(0);
                }, 250);
            });
        });
    });
});