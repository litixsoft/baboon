angular.module('uiexamples', [])
/**
 * Enterprise config area
 */

    .config(function ($routeProvider) {
        $routeProvider.when('/ui', {templateUrl: 'ui_examples/ui_examples.html', controller: 'uiexamplesCtrl'});
    })

/**
 * Enterprise controller
 */
    .controller('uiexamplesCtrl', ['$scope', function ($scope) {

        $scope.title = 'UI-Examples';

    }])


/**
 * Accordion Controller
 */
    .controller('AccordionDemoCtrl',['$scope',function ($scope) {
        $scope.oneAtATime = true;

        $scope.groups = [
            {
                title: 'Dynamic Group Header - 1',
                content: 'Dynamic Group Body - 1'
            },
            {
                title: 'Dynamic Group Header - 2',
                content: 'Dynamic Group Body - 2'
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
                type: 'success',
                title: 'Holy guacamole!',
                content: 'Best check yo self, you are not looking too good.<br><br><pre>2 + 3 = {{ 2 + 3 }}</pre>'
            },
            {
                type: 'info',
                title: 'Heads up!',
                content: 'Best check yo self, you are not looking too good.<br><br><pre>2 + 3 = {{ 2 + 3 }}</pre>'
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
            active: true
        };
        $scope.buttonSelect = {
            price: '89,99',
            currency: '$'
        };
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
    .controller('StrapDialogController',['$scope','$modal',function ($scope,$modal) {

        $scope.modal = {content: 'Hello Modal', saved: false};

        $scope.viaService = function() {
            // do something
//            var modal = $modal({
            $modal({
                template: 'enterprise/popup.html',
                show: true,
                scope: $scope, //undokumentiert
                backdrop: 'static'
            });
        };
        $scope.parentController = function(dismiss) {
            console.warn(arguments);
            // do something
            dismiss();
        };
    }])
    .controller('TestDialogController',['$scope','dialog',function ($scope,dialog) {

        $scope.close = function(result){
            dialog.close(result);
        };
    }])
    .controller('DialogDemoCtrl',['$scope','$dialog',function ($scope, $dialog) {

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

        $scope.message = '';
        $scope.message2 = '';

        $scope.openDialog = function(){
            var d = $dialog.dialog($scope.opts);
            d.open().then(function(result){
                if(result)
                {
                    $scope.message = result ;
                    //alert('dialog closed with result: ' + result);
                }
            });
        };

        $scope.openMessageBox = function(){
            var title = 'This is a message box';
            var msg = 'This is the content of the message box';
            var btns = [{result:'cancel', label: 'Cancel'}, {result:'ok', label: 'OK', cssClass: 'btn-primary'}];

            $dialog.messageBox(title, msg, btns)
                .open()
                .then(function(result){
                    $scope.message2 = result ;
                    //alert('dialog closed with result: ' + result);
                });
        };
    }])
    .controller('ModalDemoCtrl',['$scope',function ($scope) {
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
 * Pagination Controller
 */
    .controller('PaginationDemoCtrl',['$scope',function ($scope) {

        $scope.noOfPages = 7;
        $scope.currentPage = 4;
        $scope.maxSize = 5;

        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };
    }])

/**
 * Popover Controller
 */
    .controller('PopoverDemoCtrl',['$scope',function ($scope) {

        $scope.dynamicPopover = 'Hello, World!';
        $scope.dynamicPopoverText = 'dynamic';
        $scope.dynamicPopoverTitle = 'Title';

        $scope.popover = {
            content: 'Nix neues',
            title: 'Titel'
        };
    }])

/**
 * Enterprise edit controller
 */
    .controller('DropdownCtrl', ['$scope', function ($scope) {
        $scope.items = [
            'The first choice!',
            'And another choice for you.',
            'but wait! A third!'
        ];
        $scope.message = '';
        $scope.action = function(){
            //alert('Klick');
            $scope.message = 'Klick';
        };
        $scope.dropdown = [
            {
                text: 'Another action',
                href: '#anotherAction'
            },
            {
                text: 'Something else here',
                click: '$alert(\'working ngClick!\')'
            },
            {
                divider: true
            },
            {
                text: 'Separated link',
                href: '#',
                submenu: [
                    {
                        text: 'Second level link',
                        href: '#'
                    },
                    {
                        text: 'Second level link 2',
                        href: '#'
                    }
                ]
            }
        ];
    }])

/**
 * Tabs controller
 */
    .controller('TabsDemoCtrl', ['$scope',function ($scope) {

        $scope.panes = [
            { title:'Dynamic Title 1', content:'Dynamic content 1' },
            { title:'Dynamic Title 2', content:'Dynamic content 2' }
        ];

        $scope.tabs = [
            {
                title: 'Home',
                content: 'Raw denim you probably haven\'t heard of them jean shorts Austin. Nesciunt tofu stumptown aliqua, retro synth master cleanse. Mustache cliche tempor, williamsburg carles vegan helvetica.'
            },
            {
                title: 'Profile',
                content: 'Food truck fixie locavore, accusamus mcsweeney\'s marfa nulla single-origin coffee squid. Exercitation +1 labore velit, blog sartorial PBR leggings next level wes anderson artisan four loko farm-to-table craft beer twee.'
            },
            {
                title: 'About',
                content: 'Etsy mixtape wayfarers, ethical wes anderson tofu before they sold out mcsweeney\'s organic lomo retro fanny pack lo-fi farm-to-table readymade.'
            }
        ];

        $scope.activeTab = 0;
    }])


/**
 * Tooltip  controller
 */
    .controller('TooltipDemoCtrl', ['$scope', function ($scope) {

        $scope.dynamicTooltip = 'Hello, World!';
        $scope.dynamicTooltipText = 'dynamic';


        $scope.checked = false;
        $scope.tooltip = {
            title: 'Hello Tooltip<br />Haken ist gesetzt:'
            //checked: false
        };

    }]);

