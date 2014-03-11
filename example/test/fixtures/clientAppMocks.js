'use strict';

// socket io mock
window.io = {
    connect: function () {
        return {
            on: function () {},
            emit: function () {}
        };
    }
};