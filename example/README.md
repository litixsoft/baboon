[![Build Status](https://travis-ci.org/litixsoft/baboon-frontend.svg?branch=master)](https://travis-ci.org/litixsoft/baboon-frontend) [![david-dm](https://david-dm.org/litixsoft/baboon-frontend.svg?theme=shields.io)](https://david-dm.org/litixsoft/baboon-frontend/) [![david-dm](https://david-dm.org/litixsoft/baboon-frontend/dev-status.svg?theme=shields.io)](https://david-dm.org/litixsoft/baboon-frontend#info=devDependencies&view=table)
# baboon-frontend
Baboon SPA frontend reference application, based on Angular, backend independent.

## Documentation

## Configure server for html5Mode

### Express Rewrites
```javascript
var fs = require('fs');
var express = require('express');
var path = require('path');

var app = express();

// app files in public
var pub = path.join(__dirname, 'public');
app.use(express.static(pub));

// Just send the app-name.html or index.html to support HTML5Mode
app.all('/:app*', function (req, res) {

    var app = req.params.app;
    var appFile = app + '.html';

    if (appFile === 'main.html' || !fs.existsSync(path.join(pub, appFile ))) {
        res.sendfile('index.html', {root: pub});
    }
    else {
        res.sendfile(appFile, {root: pub});
    }
});

module.exports = app;
```

### Nginx Rewrites

```bash
server {
	listen *:80
	server_name my-app;

    root /path/to/app;

    location ~ ^/(main)|(/$) {
        try_files $uri /index.html;
    }

	location ~ ^/([a-z]+) {
    	set $var $1;
        try_files $uri /$var.html /index.html;
    }
}
```
### Apache Rewrites

```xml
<VirtualHost *:80>
    ServerName my-app

    DocumentRoot /path/to/app

    <Directory /path/to/app>
        RewriteEngine on

        # Don't rewrite files or directories
        RewriteCond %{REQUEST_FILENAME} -f [OR]
        RewriteCond %{REQUEST_FILENAME} -d
        RewriteRule ^ - [L]

        # Rewrite everything else to index.html or toplevel.html to allow html5 state links
        RewriteRule ^(main)|^($) index.html [L]
        RewriteRule ^([a-z]+) $1.html [L]

    </Directory>
</VirtualHost>
```

# Author
[Litixsoft GmbH](http://www.litixsoft.de)

### License
Copyright (c) 2014 Litixsoft GmbH Licensed under the MIT license.
