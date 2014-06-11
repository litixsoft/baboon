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

#Usage

There are two possible ways:

 * create and view the docu in the docs folder
 * create and view the docu from inside the baboon root folder

The docu application runs on port 3060.

##In the docs folder:

####Create the api documentation

    $ grunt build


####Create the api documentation and start docu-application
A browser window and go to http://localhost:3060

    $ grunt serve

##In the baboon root folder:

####Create the api documentation

    $ grunt doc


####Create the api documentation and start docu-application
A browser window and go to http://localhost:3060

    $ grunt doc:serve

#Webstorm

You could also use a configuration to start the task in the docs folder.
Just add a new node configuration and point to the grunt.js file in the scripts subfolder.
As parameter use 'serve'