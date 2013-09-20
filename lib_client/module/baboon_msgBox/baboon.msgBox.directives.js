/*global angular*/
angular.module('baboon.msgBox.directives',[]) //
    .directive('bbMsgbox', ['msgBox', function (msgBox){
        return {
            restrict: 'E,A',
            scope: {
                msgHeadline: '=',
                msgType: '=',
                msgMessage: '=',
                msgShow: '=',
                msgCbs: '='
            },
            link: function (scope) {

                scope.checkVisibility = function(){
                    //if visible use factory to show msgbox
                    if(scope.msgShow){
                        msgBox.modal.show(scope.msgHeadline,scope.msgMessage,scope.msgType,scope.msgCbs);
                    }
                }

                scope.$watch('msgShow',function(value){
                    scope.checkVisibility();
                });
            }
        };
    }]);
