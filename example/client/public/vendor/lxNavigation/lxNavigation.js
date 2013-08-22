/*!
 * lxtreeview v0.1 - 2013-08-09 
 * Sven Bernstein
 * Copyright (c) 2013 Litixsoft GmbH
 * Licensed MIT
 */ 
 
angular.module("ui.lxnavigation", ["template/lxlinktree/outer.html", "template/lxlinktree/inner.html","template/lxnavbar/outer.html", "template/lxnavbar/inner.html","template/lxtreeview/outer.html", "template/lxtreeview/inner.html"])
.controller("LxTreeViewCtrl", ["$scope", "$element", "$attrs", "$window","$interpolate",
    function ($scope, $element, $attrs, $window,$interpolate) {


        //$scope.treeData = angular.copy($scope.$parent[$attrs.itemlistAttr]);
        $scope.treeData = angular.copy($scope[$attrs.itemlistAttr]);
//        console.log($scope.treeData);
        $scope.type = $attrs.typeAttr;

//        $attrs.$observe( 'itemlistAttr', function ( val ) {
            //$scope.testAttr = $interpolate(val)($scope);
//            $scope.treeData = $scope.testAttr;
//        });

        $scope.toggleShow = function (data) {
            if (data.hide == "lxclose" || data.hide == undefined) {
                data.hide = "lxopen";
            } else {
                data.hide = "lxclose";
            }			
        }
		$scope.toggleNav = function (data) {
			console.log("toggle");
            if (data.hide == "" || data.hide == undefined) {
                data.hide = "open";
			} else {
                data.hide = "";
            }			
        }
    }
]).directive("lxlinktree", function () {
        return {
            restrict: "E",
//            controller: "LxTreeViewCtrl",
            transclude: false,
            replace: true,
            scope: {
                iconAttr: "@",
                itemlistAttr: "=",
                labelAttr: "@",
                linkAttr: "@",
                ngModel: "@"
            },
            templateUrl: "template/lxlinktree/outer.html"
        }
    })
    .directive("lxtreeview", function () {
    return {
        restrict: "E",
        controller: "LxTreeViewCtrl",
        transclude: false,
        replace: true,
        scope: {
			iconAttr: "@",
            itemlistAttr: "@",
            labelAttr: "@",
			linkAttr: "@",
            ngModel: "@"
        },
        templateUrl: "template/lxtreeview/outer.html"
    }
}).directive("lxbootnav",function () {
    return {
        restrict: "E",
        controller: "LxTreeViewCtrl",
        transclude: false,
        replace: true,
        scope: {
			iconAttr: "@",
            itemlistAttr: "@",
            labelAttr: "@",			
			linkAttr: "@",
            typeAttr: "@",
            ngModel: "@"
        },
		templateUrl: "template/lxnavbar/outer.html"
    }
});

/*---------------------------bar---------------------------*/
angular.module("template/lxnavbar/outer.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/lxnavbar/outer.html",
        '<ul class="nav {{type}}">\n' +
            '<li class="{{data.hide}}" ng-class="{active: $uiRoute, dropdown: data.children.length}" ui-route="{{data[linkAttr]}}" ng-repeat="data in treeData"  ng-include="\'template/lxnavbar/inner.html\'"></li>\n' +
            '</ul>');
}]);

angular.module("template/lxnavbar/inner.html", []).run(["$templateCache", function ($templateCache) { //
    $templateCache.put("template/lxnavbar/inner.html",
            '<a ng-href="{{data[linkAttr]}}" ui-if="!data.children.length"  target="_self">{{data[labelAttr]}} <b class="caret" ui-if="data.children.length"></b></a>\n'+
            '<a ng-href="{{data[linkAttr]}}" ui-if="data.children.length" class="dropdown-toggle">{{data[labelAttr]}} <b class="caret" ui-if="data.children.length"></b></a>\n'+
            '<ul class="dropdown-menu" ui-if="data.children.length">\n'+
                '<li ng-class="{ \'dropdown-submenu\' : data.children.length}" ng-repeat="data in data.children" ng-include="\'template/lxnavbar/inner.html\'">\n'+
                '</li>\n'+
            '</ul> ');
}]);
/*---------------------------tree---------------------------*/

angular.module("template/lxtreeview/outer.html", []).run(["$templateCache", function ($templateCache) {
	$templateCache.put("template/lxtreeview/outer.html", 
		'<ul>\n' +
		'<li ng-repeat="data in treeData"  ng-include="\'template/lxtreeview/inner.html\'"></li>\n' +
		'</ul>');
}]);

angular.module("template/lxtreeview/inner.html", []).run(["$templateCache", function ($templateCache) {
	$templateCache.put("template/lxtreeview/inner.html", 
		'<div class="list-item"  ng-class="{active: $uiRoute}" ui-route="{{data[linkAttr]}}">\n' +
			'<div class="opensub {{data.hide}}" ng-show="data.children" ng-click="toggleShow(data)"></div>\n'+
			'<div class="nav-icon {{data[iconAttr]}}"></div>\n'+
			'<a ng-href="{{data[linkAttr]}}"><span>{{data[labelAttr]}}</span></a>\n'+
		'</div>\n'+
		'<ul class="display {{data.hide}}" ui-if="data.children.length">\n'+
		'<li ng-repeat="data in data.children" ng-include="\'template/lxtreeview/inner.html\'">\n'+
		'</li>\n'+
		'</ul> ');
}]);
/*---------------------------linklisttree---------------------------*/

angular.module("template/lxlinktree/outer.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/lxlinktree/outer.html",
        '<ul>\n' +
            '<li ng-repeat="data in itemlistAttr"  ng-include="\'template/lxlinktree/inner.html\'"></li>\n' +
            '</ul>');
}]);

angular.module("template/lxlinktree/inner.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/lxlinktree/inner.html",
        '<div class="list-item"  ng-class="{active: $uiRoute}" ui-route="{{data[linkAttr]}}">\n' +
            '<div class="opensub {{data.hide}}" ng-show="data.children" ng-click="toggleShow(data)"></div>\n'+
            '<div class="nav-icon {{data[iconAttr]}}"></div>\n'+
            '<a ng-href="{{data[linkAttr]}}"><span>{{data[labelAttr]}}</span></a>\n'+
            '</div>\n'+
            '<ul class="display {{data.hide}}" ui-if="data.children.length">\n'+
            '<li ng-repeat="data in data.children" ng-include="\'template/lxlinktree/inner.html\'">\n'+
            '</li>\n'+
            '</ul> ');
}]);