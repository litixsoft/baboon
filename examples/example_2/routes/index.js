(function(exports){

    var middleware;

    exports.init = function(options){
        middleware = options.middleware;
    };

    exports.index = function(req, res){
        res.render('index', {
            title: 'Express'
        });
    };

    exports.login = function(req, res){
        res.render('login', { title: 'Express Login' });
    };

    exports.module1 = function(req, res){
        res.render('module1', { title: 'Express Modul1' });
    };
})(module.exports);


