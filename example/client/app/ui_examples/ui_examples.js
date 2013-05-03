/*global kendo, google, alert */

angular.module('uiexamples', [])

/**
 * Enterprise config area
 */

    .config(function ($routeProvider) {
        $routeProvider.when('/ui', {templateUrl: 'ui_examples/ui_examples.html', controller: 'ui_examplesCtrl'});
    })




/**
 * Enterprise controller
 */
    .controller('ui_examplesCtrl', ['$scope', function ($scope) {

        $scope.title = 'UI-Examples';

    }])



/**
 * ng-grid controller
 */
    .controller('ngGridCtrl', ['$scope', function ($scope) {

        $scope.gridOptions = {
            data: 'myData',
            enablePinning: true,
            columnDefs: [{ field: 'name', width: 120, pinned: true },
                { field: 'age', width: 120 },
                { field: 'birthday', width: 120 },
                { field: 'salary', width: 120 }]
        };
        $scope.gridOptions2 = {
            data: 'myData',
            showGroupPanel: true
        };
        $scope.myData = [{ name: 'Moroni', age: 50, birthday: 'Oct 28, 1970', salary: '60,000' },
            { name: 'Tiancum', age: 43, birthday: 'Feb 12, 1985', salary: '70,000' },
            { name: 'Jacob', age: 27, birthday: 'Aug 23, 1983', salary: '50,000' },
            { name: 'Nephi', age: 29, birthday: 'May 31, 2010', salary: '40,000' },
            { name: 'Enos', age: 34, birthday: 'Aug 3, 2008', salary: '30,000' },
            { name: 'Moroni', age: 50, birthday: 'Oct 28, 1970', salary: '60,000' },
            { name: 'Tiancum', age: 43, birthday: 'Feb 12, 1985', salary: '70,000' },
            { name: 'Jacob', age: 27, birthday: 'Aug 23, 1983', salary: '40,000' },
            { name: 'Nephi', age: 29, birthday: 'May 31, 2010', salary: '50,000' },
            { name: 'Enos', age: 34, birthday: 'Aug 3, 2008', salary: '30,000' },
            { name: 'Moroni', age: 50, birthday: 'Oct 28, 1970', salary: '60,000' },
            { name: 'Tiancum', age: 43, birthday: 'Feb 12, 1985', salary: '70,000' },
            { name: 'Jacob', age: 27, birthday: 'Aug 23, 1983', salary: '40,000' },
            { name: 'Nephi', age: 29, birthday: 'May 31, 2010', salary: '50,000' },
            { name: 'Enos', age: 34, birthday: 'Aug 3, 2008', salary: '30,000' }];


    }])

    .controller('kendoGridCtrl', ['$scope', function ($scope) {

        $scope.myData = [{'ProductID':1,'ProductName':'Chai','Supplier':{'SupplierID':1,'SupplierName':'Exotic Liquids'},'Category':{'CategoryID':1,'CategoryName':'Beverages'},'UnitPrice':18.0,'UnitsInStock':39,'Discontinued':false},{'ProductID':2,'ProductName':'Chang','Supplier':{'SupplierID':1,'SupplierName':'Exotic Liquids'},'Category':{'CategoryID':1,'CategoryName':'Beverages'},'UnitPrice':19.0,'UnitsInStock':17,'Discontinued':false},{'ProductID':3,'ProductName':'Aniseed Syrup','Supplier':{'SupplierID':1,'SupplierName':'Exotic Liquids'},'Category':{'CategoryID':2,'CategoryName':'Condiments'},'UnitPrice':10.0,'UnitsInStock':13,'Discontinued':false},{'ProductID':4,'ProductName':'Chef Anton\u0027s Cajun Seasoning','Supplier':{'SupplierID':2,'SupplierName':'New Orleans Cajun Delights'},'Category':{'CategoryID':2,'CategoryName':'Condiments'},'UnitPrice':22.0,'UnitsInStock':53,'Discontinued':false},{'ProductID':5,'ProductName':'Chef Anton\u0027s Gumbo Mix','Supplier':{'SupplierID':2,'SupplierName':'New Orleans Cajun Delights'},'Category':{'CategoryID':2,'CategoryName':'Condiments'},'UnitPrice':21.35,'UnitsInStock':0,'Discontinued':true},{'ProductID':6,'ProductName':'Grandma\u0027s Boysenberry Spread','Supplier':{'SupplierID':3,'SupplierName':'Grandma Kelly\u0027s Homestead'},'Category':{'CategoryID':2,'CategoryName':'Condiments'},'UnitPrice':25.0,'UnitsInStock':120,'Discontinued':false},{'ProductID':7,'ProductName':'Uncle Bob\u0027s Organic Dried Pears','Supplier':{'SupplierID':3,'SupplierName':'Grandma Kelly\u0027s Homestead'},'Category':{'CategoryID':7,'CategoryName':'Produce'},'UnitPrice':30.0,'UnitsInStock':15,'Discontinued':false},{'ProductID':8,'ProductName':'Northwoods Cranberry Sauce','Supplier':{'SupplierID':3,'SupplierName':'Grandma Kelly\u0027s Homestead'},'Category':{'CategoryID':2,'CategoryName':'Condiments'},'UnitPrice':40.0,'UnitsInStock':6,'Discontinued':false},{'ProductID':9,'ProductName':'Mishi Kobe Niku','Supplier':{'SupplierID':4,'SupplierName':'Tokyo Traders'},'Category':{'CategoryID':6,'CategoryName':'Meat/Poultry'},'UnitPrice':97.0,'UnitsInStock':29,'Discontinued':true},{'ProductID':10,'ProductName':'Ikura','Supplier':{'SupplierID':4,'SupplierName':'Tokyo Traders'},'Category':{'CategoryID':8,'CategoryName':'Seafood'},'UnitPrice':31.0,'UnitsInStock':31,'Discontinued':false},{'ProductID':11,'ProductName':'Queso Cabrales','Supplier':{'SupplierID':5,'SupplierName':'Cooperativa de Quesos \u0027Las Cabras\u0027'},'Category':{'CategoryID':4,'CategoryName':'Dairy Products'},'UnitPrice':21.0,'UnitsInStock':22,'Discontinued':false},{'ProductID':12,'ProductName':'Queso Manchego La Pastora','Supplier':{'SupplierID':5,'SupplierName':'Cooperativa de Quesos \u0027Las Cabras\u0027'},'Category':{'CategoryID':4,'CategoryName':'Dairy Products'},'UnitPrice':38.0,'UnitsInStock':86,'Discontinued':false},{'ProductID':13,'ProductName':'Konbu','Supplier':{'SupplierID':6,'SupplierName':'Mayumi\u0027s'},'Category':{'CategoryID':8,'CategoryName':'Seafood'},'UnitPrice':6.0,'UnitsInStock':24,'Discontinued':false},{'ProductID':14,'ProductName':'Tofu','Supplier':{'SupplierID':6,'SupplierName':'Mayumi\u0027s'},'Category':{'CategoryID':7,'CategoryName':'Produce'},'UnitPrice':23.25,'UnitsInStock':35,'Discontinued':false},{'ProductID':15,'ProductName':'Genen Shouyu','Supplier':{'SupplierID':6,'SupplierName':'Mayumi\u0027s'},'Category':{'CategoryID':2,'CategoryName':'Condiments'},'UnitPrice':15.5,'UnitsInStock':39,'Discontinued':false},{'ProductID':16,'ProductName':'Pavlova','Supplier':{'SupplierID':7,'SupplierName':'Pavlova, Ltd.'},'Category':{'CategoryID':3,'CategoryName':'Confections'},'UnitPrice':17.45,'UnitsInStock':29,'Discontinued':false},{'ProductID':17,'ProductName':'Alice Mutton','Supplier':{'SupplierID':7,'SupplierName':'Pavlova, Ltd.'},'Category':{'CategoryID':6,'CategoryName':'Meat/Poultry'},'UnitPrice':39.0,'UnitsInStock':0,'Discontinued':true},{'ProductID':18,'ProductName':'Carnarvon Tigers','Supplier':{'SupplierID':7,'SupplierName':'Pavlova, Ltd.'},'Category':{'CategoryID':8,'CategoryName':'Seafood'},'UnitPrice':62.5,'UnitsInStock':42,'Discontinued':false},{'ProductID':19,'ProductName':'Teatime Chocolate Biscuits','Supplier':{'SupplierID':8,'SupplierName':'Specialty Biscuits, Ltd.'},'Category':{'CategoryID':3,'CategoryName':'Confections'},'UnitPrice':9.2,'UnitsInStock':25,'Discontinued':false},{'ProductID':20,'ProductName':'Sir Rodney\u0027s Marmalade','Supplier':{'SupplierID':8,'SupplierName':'Specialty Biscuits, Ltd.'},'Category':{'CategoryID':3,'CategoryName':'Confections'},'UnitPrice':81.0,'UnitsInStock':40,'Discontinued':false}];

        $scope.things = new kendo.data.DataSource({
            data: $scope.myData
        });

        $scope.rowSelected = function(e) {
            var grid = e.sender;
            var selectedRows = grid.select();
            for (var i = 0; i < selectedRows.length; i++) {
                $scope.selectedItem = grid.dataItem(selectedRows[i]);
                break;
            }
        };
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
 * Calendar Controller
 */
    .controller('CalendarCtrl',['$scope', function ($scope) {

        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();

        $scope.eventSource = {
            url: 'http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic',
            className: 'gcal-event',           // an option!
            currentTimezone: 'America/Chicago' // an option!
        };

        $scope.events = [
            {title: 'All Day Event',start: new Date(y, m, 1)},
            {title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
            {id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
            {id: 999,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
            {title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
            {title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
        ];

        $scope.eventSources = [$scope.events, $scope.eventSource];

        $scope.addEvent = function() {
            $scope.events.push({
                title: 'Open Sesame',
                start: new Date(y, m, 28),
                end: new Date(y, m, 29)
            });
        };

        $scope.remove = function(index) {
            $scope.events.splice(index,1);
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
    .controller('CodemirrorDemoCtrl',['$scope',function ($scope) {

        $scope.codeMirrorModel = 'var test = 12;';
    }])



/**
 * Collapse Controller
 */
    .controller('CollapseDemoCtrl',['$scope',function ($scope) {

        $scope.isCollapsed = false;
    }])

/**
 * Datepicker Controller
 */
    .controller('DatepickerCtrl',['$scope',function ($scope) {

        $scope.datepicker = {
            date: '2012-09-01T00:00:00.000Z'
        };

        $scope.timepicker = {
            time: ''
        };
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
 * Eventbinder Controller
 */
    .controller('EventbinderCtrl',['$scope', function ($scope) {
        $scope.text = '';
        $scope.input = '';
        $scope.blurCallback = function() {
            $scope.text = $scope.input;
        };
    }])

/**
 * Google Maps Controller
 */
    .controller('MapsCtrl',['$scope', function ($scope) {

        $scope.myMarkers = [];

        $scope.mapOptions = {
            center: new google.maps.LatLng(35.784, -78.670),
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        $scope.addMarker = function($event) {
            $scope.myMarkers.push(new google.maps.Marker({
                map: $scope.myMap,
                position: $event.latLng
            }));
        };

        $scope.setZoomMessage = function(zoom) {
            $scope.zoomMessage = 'You just zoomed to '+zoom+'!';
            console.log(zoom,'zoomed');
        };

        $scope.openMarkerInfo = function(marker) {
            $scope.currentMarker = marker;
            $scope.currentMarkerLat = marker.getPosition().lat();
            $scope.currentMarkerLng = marker.getPosition().lng();
            $scope.myInfoWindow.open($scope.myMap, marker);
        };

        $scope.setMarkerPosition = function(marker, lat, lng) {
            marker.setPosition(new google.maps.LatLng(lat, lng));
        };
    }])

/**
 * Keypress Controller
 */
    .controller('KeypressCtrl',['$scope', function ($scope) {
        $scope.first = 'ui-keypress   Hit [Enter]. The $event hersdae is different from keypress, but fires earlier.';
        $scope.second = 'ui-keydown    Hit [Enter] or [Alt]+[Space] and remember that this normally adds a new line if we don\'t $event.preventDefault()';
        $scope.third = 'ui-keyup      Hit [Enter]. Remember not to close the alert using [Enter] or it will refire keyup.';
        $scope.keypressCallback = function($event) {
            alert('Voila!');
            $event.preventDefault();
        };
    }])

/**
 * Navbar Controller
 */
    .controller('NavbarCtrl',['$scope', '$location', function ($scope, $location) {

        $scope.$location = $location;
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
 * Sortable controller
 */
    .controller('SortableCtrl', ['$scope',function ($scope) {

        $scope.parents = [
            { name: 'Anna',
                children: ['Alvin', 'Becky' ,'Charlie'] },
            { name: 'Barney',
                children: ['Dorothy', 'Eric'] },
            { name: 'Chris',
                children: ['Frank', 'Gary', 'Henry'] }
        ];

        $scope.items = ['One', 'Two', 'Three'];

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

        $scope.tabs.activeTab = 0;
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

    }])

/**
 * Enterprise edit controller
 */
    .controller('TypeaheadCtrl', ['$scope', function ($scope) {

        $scope.selected = undefined;
        $scope.states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Dakota', 'North Carolina', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];

        $scope.typeaheadFn = function(query, callback) {
            // $http.get('/stations/autocomplete?term='+query).success(function(stations) {
            callback($scope.states); // This will automatically open the popup with retrieved results
            // });
        };
    }])

/**
 * Validate  controller
 */
    .controller('ValidateCtrl', ['$scope', function ($scope) {
        $scope.email = '';
        $scope.password = '';
        $scope.confirm = '';

        $scope.notBlackListed = function(value) {
            var blacklist = ['bad@domain.com','verybad@domain.com'];
            return blacklist.indexOf(value) === -1;
        };
    }]);