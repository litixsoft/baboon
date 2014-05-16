Overview, Api Reference and Guide for the Baboon Web Toolkit, modular fullstack web application framework for single-page realtime apps.

# Install
The installation of the Baboon documentation is very simple. Just start with:

    $ npm install


## NodeJS global dependencies

For the autogeneration of the documentation you need to install doxx global dependencies.

Linux / Mac:

    $ sudo npm install -g doxx

Windows:

    $ npm install -g doxx


## Create and start your documentation
Navigate in the root of your project. And type:

    $ grunt doc

If the documentation was build correct you could start the documentation app. Navigate into the docs/bin folder and:

    $ node server


Open a browser window and go to http://localhost:3000
