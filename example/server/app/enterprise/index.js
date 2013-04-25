module.exports = (function() {

    var pub ={};

    pub.test = function(data, callback) {
        var end = new Date().toTimeString();
        var res = {fromClient: data, fromServer: end};
        callback(res);
    };

    return pub;
})();