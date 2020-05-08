+++

title = "Running Mocha tests within Sublime Text"
aliases = ["/2013/10/21/running-mocha-tests-with-sublime-text/"]
tags = ["javascript","sublime text 2","mocha","oss","unit testing"]
+++

I spend most of my day in Visual Studio with lots of the goodies an IDE can offer.  One of them being able to run your tests from a keystroke.

In a bid to expand my mind I'm working on a little project that is made up of JS entirely so I've dug out [Sublime Text][1]. It has lots of plugins that are very handy, especially [Sublime-HTMLPrettify][2] which will tidy your HTML, CSS & JS for you.

When writing tests for JS there are many libraries you can use but I've chosen [Mocha][3] for now.  The one thing I couldn't work out was to run my tests within Sublime Text until now.

### Build System

Sublime allows you to have build systems a bit like an IDE so you can tell it what to do when you invoke it via <kbd>cmd</kbd>+<kbd>B</kbd>.

To get Mocha to run we need to create a new build system. To do this click Tools - Build System - New Build System and paste in the below:

<!--more-->

    {
        "cmd": ["make"],
        "file_regex": "^(..[^:]*):([0-9]+):?([0-9]+)?:? (.*)$",
        "working_dir": "${project_path:${folder:${file_path}}}",
        "selector": "source.makefile",
        "shell": true,
        "variants": [{
            "name": "Clean",
            "cmd": ["make", "clean"]
        }]
    }
    
Click Save and call it Mocha

Now when you have a project go to Tools - Build System and select Mocha

### Make file

A Make file is a script that allows you to execute various commands and its what our build system looks for when we tell Sublime to build our project. We need a file called `makefile` in the root of our project.  Inside that `makefile` we can invoke Mocha to run our tests.

Place this in your `makefile`:

    test:
        mocha --recursive --reporter spec moviebucketlist.tests/*.js
    .PHONY: test
    
Now when you invoke the build system via <kbd>cmd</kbd>+<kbd>B</kbd> in Sublime it will execute Mocha and give you the results in the console of Sublime.  Mocha by default will look for a folder called `test` and execute the tests inside it. If you have a different folder name you can append the folder name and wildcard to js files like I have done above.

Happy Coding!

[1]: http://sublimetext.com
[2]: https://github.com/victorporof/Sublime-HTMLPrettify
[3]: http://visionmedia.github.io/mocha/
