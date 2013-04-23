angular.module('enterprise', [
        'enterprise.services'
    ])
/**
 * Enterprise config area
 */

    .config(function ($routeProvider) {
        $routeProvider.when('/', {templateUrl: 'enterprise/enterprise.html', controller: 'enterpriseCtrl'});
        $routeProvider.when('/new', {templateUrl: 'enterprise/edit.html', controller: 'newCtrl'});
        $routeProvider.when('/edit/:id', {templateUrl: 'enterprise/edit.html', controller: 'editCtrl'});
    })
/**
 * Enterprise controller
 */
    .controller('enterpriseCtrl', ['$scope', 'enterpriseCrew', function ($scope) {
//        $scope.alerts = [
//            { type: 'error', msg: 'Oh snap! Change a few things up and try submitting again.' },
//            { type: 'success', msg: 'Well done! You successfully read this important alert message.' }
//        ];

        $scope.open = function () {
            $scope.shouldBeOpen = true;
        };

        $scope.close = function () {
            $scope.closeMsg = 'I was closed at: ' + new Date();
            $scope.shouldBeOpen = false;
        };

        $scope.items = ['item1', 'item2'];

        $scope.opts = {
            backdropFade: true,
            dialogFade:true
        };

    }])

/**
 * Accordion Controller
 */
    .controller('AccordionDemoCtrl',['$scope',function ($scope) {
        $scope.oneAtATime = true;

        $scope.groups = [
            {
                title: "Dynamic Group Header - 1",
                content: "Dynamic Group Body - 1"
            },
            {
                title: "Dynamic Group Header - 2",
                content: "Dynamic Group Body - 2"
            }
        ];

        $scope.items = ['Item 1', 'Item 2', 'Item 3'];

        $scope.addItem = function() {
            var newItemNo = $scope.items.length + 1;
            $scope.items.push('Item ' + newItemNo);
        };
    }])
/**
 * Buttons Radios Checkboxes Controller
 */
    .controller('AlertsCtrl',['$scope',function ($scope) {
        $scope.alerts = [
            {
                "type": "success",
                "title": "Holy guacamole!",
                "content": "Best check yo self, you're not looking too good.<br><br><pre>2 + 3 = {{ 2 + 3 }}</pre>"
            },
            {
                "type": "info",
                "title": "Heads up!",
                "content": "To prevent databinding issues, <em>\"the rule of thumb is, if you﻿ use <code>ng-model</code> there has to be a dot somewhere.\" Miško Hevery</em>"
            }
        ];

        $scope.addAlert = function() {
            $scope.alerts.push({content: 'Another alert!'});
        };

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };
    }])
/**
 * Buttons Radios Checkboxes Controller
 */
    .controller('ButtonsCtrl',['$scope',function ($scope) {
        $scope.singleModel = 1;

        $scope.radioModel = 'Middle';

        $scope.checkbox = {
            left: false,
            middle: true,
            right: false
        };

        $scope.radio = {
            left: false,
            middle: true,
            right: false
        };

        $scope.button =  {
            "active": true
        };
        $scope.buttonSelect = {
                "price": "89,99",
                "currency": "$"
        }
    }])
/**
 * Carousel Controller
 */
    .controller('CarouselDemoCtrl',['$scope',function ($scope) {

        $scope.myInterval = 5000;
        $scope.slides = [
            {image: 'http://placekitten.com/200/200',text: 'Kitten.'},
            {image: 'http://placekitten.com/225/200',text: 'Kitty!'},
            {image: 'http://placekitten.com/250/200',text: 'Cat.'},
            {image: 'http://placekitten.com/275/200',text: 'Feline!'}
        ];
        $scope.addSlide = function() {
            $scope.slides.push({
                image: 'http://placekitten.com/'+(200+25*Math.floor(Math.random()*4))+'/200',
                text: ['More','Extra','Lots of','Surplus'][Math.floor(Math.random()*4)] + ' ' +
                    ['Cats', 'Kittys', 'Felines', 'Cutes'][Math.floor(Math.random()*4)]
            });
        };
    }])

/**
 * Collapse Controller
 */
    .controller('CollapseDemoCtrl',['$scope',function ($scope) {

        $scope.isCollapsed = false;
    }])


//function TestDialogController($scope, dialog){
//    $scope.close = function(result){
//        dialog.close(result);
//    };
//}
/**
 * Modal Dialog MsgBox Controller
 */
    .controller('TestDialogController',['$scope','dialoglx',function ($scope,dialoglx) {

        $scope.close = function(result){
            dialoglx.close(result);
        };
    }])
    .controller('DialogDemoCtrl',['$scope','$dialoglx',function ($scope, $dialoglx) {

        // Inlined template for demo
        var t = '<div class="modal-header">'+
            '<h1>This is the title</h1>'+
            '</div>'+
            '<div class="modal-body">'+
            '<p>Enter a value to pass to <code>close</code> as the result: <input ng-model="result" /></p>'+
            '</div>'+
            '<div class="modal-footer">'+
            '<button ng-click="close(result)" class="btn btn-primary" >Close</button>'+
            '</div>';

        $scope.opts = {
            backdrop: true,
            keyboard: true,
            backdropClick: true,
            template:  t, // OR: templateUrl: 'path/to/view.html',
            controller: 'TestDialogController'
        };

        $scope.openDialog = function(){
            var d = $dialoglx.dialog($scope.opts);
            d.open().then(function(result){
                if(result)
                {
                    alert('dialog closed with result: ' + result);
                }
            });
        };

        $scope.openMessageBox = function(){
            var title = 'This is a message box';
            var msg = 'This is the content of the message box';
            var btns = [{result:'cancel', label: 'Cancel'}, {result:'ok', label: 'OK', cssClass: 'btn-primary'}];

            $dialoglx.messageBox(title, msg, btns)
                .open()
                .then(function(result){
                    alert('dialog closed with result: ' + result);
                });
        };
    }])



/**
 * Enterprise edit controller
 */
    .controller('editCtrl', ['$scope', '$location', '$routeParams', function ($scope, $location, $routeParams) {

        $scope.person = $scope.enterpriseCrew[$routeParams.id];
        $scope.save = function () {
            $location.path('/');
        };
    }])
/**
 * Enterprise new controller
 */
    .controller('newCtrl', ['$scope', '$location', function ($scope, $location) {
        $scope.person = {name: '', description: ''};
        $scope.save = function () {
            $scope.enterpriseCrew.push($scope.person);
            $location.path('/');
        };
    }]);
