//var test = 'lxInlineEdit'.match(/[a-z][A-Z]/g);
//var test2 = '';//test[0].toLowerCase() + test[1];
//var test3 = '';
//console.log(test, test2);

//var test = 'lxInlineEdit'.match(/[A-Z][a-z]+/g);
//var test2 = test[0].toLowerCase() + test[1];
//var test3 = ''
//console.log(test, test2);

//var test = "lxInlineEdit"
//    // insert a space before all caps
//    .replace(/([A-Z])/g, '.$1').toLowerCase();
//    // uppercase the first character
////    .replace(/^./, function(str){ return str.toLowerCase(); });

//console.log(test);

var lxHelpers = require('lx-helpers');

var resolveImportName = function (modulName) {

    var arr = modulName.match(/[A-Z]?[a-z]+|[0-9]+/g),
        importString = '',
        i = 0,
        max = 0;

    if (arr.length >= 2) {

        // set first caracter after prefix to lowercase
        arr[1].toLowerCase();

        // make import string
        importString = arr[0] + '.' + arr[1].toLowerCase();

        // if arr is greater than 2, then add the rest.
        for(i = 2, max = arr.length; i < max; i += 1) {
            importString += arr[i];
        }
    }
    else {
        throw new Error('Modul name: ' + modulName + ' is incorrect. Must be in CamelCase format: prefixName');
    }

    return importString;
};

//console.log(resolveImportName('lxInlineEdit'));

var arr = ['lxAuth', 'lxCache', 'lxSession'];
var res = lxHelpers.arrayFilter(arr, function(item) {
    return item == 'lxAuth';
});
if (res.length > 0) {
    console.log('schon da');
}
else {
    console.log('nicht da');
}
console.log(res);