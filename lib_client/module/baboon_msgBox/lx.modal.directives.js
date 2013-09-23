/*global angular*/
angular.module('lx.modal.directives',[]) //
    .directive('bbMsgbox', ['$rootScope','lxModal', function ($rootScope, lxModal){
        return {
            restrict: 'E,A',
            scope: {
                msgHeadline: '=',
                msgType: '=',
                msgMessage: '=',
                msgShow: '=',
                msgCbs: '=',
                msgClass: '='
            },
            link: function (scope) {

                scope.$watch('msgShow',function(value){
                    //if visible use factory to show msgbox
                    if(value){
                        lxModal.msgBox(scope.msgHeadline,scope.msgMessage,scope.msgType,scope.msgCbs,scope.msgClass);
                    }
                });
            }
        };
    }]);
