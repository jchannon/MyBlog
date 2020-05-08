+++

title = "Node.js, Express, Hello World Formula 1 Style"
aliases = ["/2012/10/08/node-js-express-hello-world-formula-1-style/"]
tags = ["editor","express","f1","ide","jade","json","node.js","oss","st2","sublime text 2"]
+++

In my ongoing efforts to be a better developer (plus I just like tinkering) I thought I would take a look at [node.js][1].

I did play with node.js about a year ago where I setup a TCP listener to listen to a TCP Server on the network broadcasting XML messages, I then took these, formatted them to JSON and passed it to a browser using [Socket.IO][2]. It was pretty cool but the project never came to anything.

However, I thought I would re-visit and setup a proper development environment on my Mac at home.

## Editors

There are many editors/IDE’s that you can use for node.js development such as Vim, Eclipse, WebStorm, Aptana Studio, Emacs and Cloud9 IDE.  As I have used [Sublime Text 2][3] (ST2) before I thought I would use this because I like it and all the cool kids use it!!

Coming from a mainly IDE based background I started to find things a bit hard going however ST2 allows plugins to be used to make the user experience a lot nicer.  Below are a list of plugins I have installed:

<!--more-->

* [Bracket Highlighter](https://github.com/facelessuser/BracketHighlighter) - highlights start/end brackets
* [JsFormat](https://github.com/jdc0589/JsFormat) - tidies code
* [SublimeLinter](https://github.com/SublimeLinter/SublimeLinter) using [node-jshint](https://github.com/jshint/node-jshint) - tells you if your code is any good or not
* [SublimeText-NodeJS](https://github.com/tanepiper/SublimeText-Nodejs) – provides node.js autocomplete
* [Grandson Of Obsidian](https://github.com/jfromaniello/Grandson-of-Obsidian) - ST2 theme using Consolas font

To set it up exactly how I have it you need to go to Preferences->Settings-User and copy &amp; paste the below in:

	{
	    "color_scheme": "Packages/Color Scheme - Default/son-of-obsidian.tmTheme",
	    "dictionary": "Packages/Language - English/en_GB.dic",
	    "ignored_packages":
	    [
	      "Vintage"
	    ],
	    "font_face": "Consolas",
	    "font_size": 13
	}

I did find setting up SublimeLinter a bit tricky as I wanted it to use the “use strict”; option. _Strict Mode is a new feature in ECMAScript 5 that allows you to place a program, or a function, in a “strict” operating context. This strict context prevents certain actions from being taken and throws more exceptions._

For example:

	function DoCode()
	{
	  message = "Hi";
	  console.log(message);  //Without strict mode you would not get any warnings that message is not defined.
	}
	
	//With strict mode on, this is what you should have
	function DoCode()
	{
	  var message = "Hi";
	  console.log(message);
	}

My settings for SublimeLinter are below and should be added to Preferences->Package Settings->SublimeLinter->Settings-User

	{
	    "sublimelinter_popup_errors_on_save": true,
	    "jshint_options":
	    {
	        "globalstrict": true,
	        "node": true,
	        "es5": true
	    }
	}

This configuration will popup warnings when you save the file and will allow you to put “use strict”; at the top of every file. This global definition is not allowed by default and it should be put in every function which I think is unnecessary. I also think “use strict”; should be turned on by default without the need for it to be declared but there may be more to it than that as I’m just a newbie.

## From Scratch

If you are completely new to Node then its probably worth taking a look at their website but if you want to start developing web sites straight away I highly recommend taking a look at the course [Web Development with ExpressJS][4] by [@hhariri][5] on [Pluralsight][6].  I found it very informative and helped me start this little project. Also read [@robashton][7] blog post called [Keeping JS Sane][8].

## Hello World

As with all new pet projects I come up with I find you always need an idea to write an app to use the technology you want to play with. I ended up choosing Formula 1 as I managed to find an API that provided lots of statistics. I’m still not entirely sure what this app will end up becoming so if anyone has any ideas and/or wants to use node.js get in touch and maybe we can collaborate.

I’m not going to go into detail about how this [app][9] works as you can browse the source code and watch [@hhariri][5]‘s [course][4] to get further information but I’ll just show a couple of snippets to “whet the appetite” (yes, that is how you spell “whet”).

In our main application file we set up the routes like so:

	var express = require('express'),
	    home = require('./routes/index.js');
	
	app.configure(function(){
	  app.set('view engine', 'jade');
	});
	
	var app = express();
	
	app.get('/current-schedule', home.currentSchedule)

We define what we are going to use, we configure our app using express and setup a route that points to a function called currentSchedule in the ./routes/index.js file

Then in our ./routes/index.js file we configure what the response will be:

	var request = require('request');
	
	exports.currentSchedule = function(req, response) {
	
	    var date = new Date();
	    var year = date.getUTCFullYear();
	
	    request.get("http://ergast.com/api/f1/" + year + ".json", function(err, res, body) {
	        if(!err) {
	            var model = JSON.parse(body);
	
	            response.render("current/currentSchedule", {
	                title = ""Current Race Schedule","
	                currentUrl: req.path,
	                RaceData: model.MRData.RaceTable
	            });
	        }
	    });
	
	};

Again we define what modules we are going to use. To expose our currentSchedule function we use the exports keyword. This function has a request and response argument that we can interrogate if needs be. We need to determine the current year, make a separate request to the API, which also exposes a error object, a response object but also the body of content returned. We put that into a JSON object and then call a view with a title, currentUrl and our data as a view model.

Its then up to our view to display this:

	ul  
	    each item in RaceData.Races
	        - var raceDate = new Date(item.date).toDateString();
	        li #{item.raceName},  #{item.Circuit.Location.locality}, #{item.Circuit.Location.country}
	            = raceDate

Our view uses the [Jade][10] view engine. This took me a while to get used to as it is based on indentation in your files. PRO Tip: Always use tabs to make things easier and use the View->Indentation->Convert Indentation to Tabs option in ST2. Lets just say it took me a few hours to get somethig working. Things were lined up but they were a mixture of spaces and tabs but I couldn’t see that in ST2. If anyone knows how to display all symbols in ST2 like [Notepad++][11] does then please let me know. It would have saved a lot of time and swear words.

So we setup an unordered list and for each item in our RaceData.Races element in our view model we format the date and output various bits of information about the current schedule. The hyphen in Jade allows you to do code behind and the #{} is how you tell the view to output data from the view model. We don’t always have to do it like that, we could do li= item.raceName but in our scenario the above was needed, I assume because of the code behind logic.

## Summary

Hopefully that gives you a bit of insight into node.js and Express. If you have any suggestions about moving my [app][9] forwards then let me know. I would like to add forms authentication, validation, unit tests and a database to see how these things work in node.js. Moving over to a text editor and a dynamic language is certainly a lot different to using Visual Studio and C#. Its a classic case of the bell arch learning curve, where you start out excited, then seriously frustrated and then I hope you peek and start to love it. I’m surprised at how much I have actually enjoyed it, a bit like taking the stabilisers off your bike, there’s certainly a freedom to not using Visual Studio. I think I have passed the extreme frustration stage in what I have done so far anyway but no doubt I’m sure I will hit more frustration as the application progresses but I think the key to it is definitely having a half decent editor to help in some areas.

**UPDATE 9th Oct 2012:** I realised that I didn’t mention debugging. I will keep this short because I researched it and I believe this is the best way. You need to install [node-inspector][12] which gives you a node debugger that uses the Google Chrome developer tools UI. You also need [nodemon][13] which runs your app and when you make changes in your script it will restart node automatically. To run this side by side, you can fire up terminal and run _nodemon –debug app.js &amp; node-inspector_ and that will work a treat. I wanted to streamline this a bit more so I looked into the [Build Systems][14] ST2 offers. This [link][15] also provides some more information. Essentially what we want to do is have a key binding that will put our app into debug mode and allow us to step through our lines of code. In ST2, go to Project-&gt;Save Project As and choose a name. This will create a project file which can add your build system for the project. (You do not have to do this as your build system can apply globally if you want.) Add the following piece of code in your .sublime-project file:

	"build_systems":
	[
	    {
	        "name": "GiveMeAName",
	        "shell": true,
	        "cmd": ["nodemon --debug $project_path/app.js &amp; node-inspector"],
	        "file_regex": "^[ ]*File \"(...*?)\", line ([0-9]*)",
	        "selector": "source.js"
	    }
	]
Save it, in ST2, go to Tools-&gt;Build System and select the option you entered in the “name” element. Now press Cmd%2BB and you’ll see a console appear in ST2 telling you that nodemon and node-inspector are running. If you really wanted, you could modify the key bindings ST2 offers and change Cmd%2BB to F5 but I’ll leave that one to you. Enjoy!

   [1]: http://nodejs.org
   [2]: http://socket.io/
   [3]: http://www.sublimetext.com/
   [4]: http://pluralsight.com/training/courses/TableOfContents?courseName=expressjs
   [5]: http://twitter.com/hhariri
   [6]: http://Pluralsight.com
   [7]: http://twitter.com/robashton
   [8]: http://codebetter.com/robashton/2012/09/03/keeping-js-sane/
   [9]: https://github.com/jchannon/NodeF1
   [10]: http://jade-lang.com/
   [11]: http://notepad-plus-plus.org/
   [12]: https://github.com/dannycoates/node-inspector
   [13]: https://github.com/remy/nodemon
   [14]: http://sublimetext.info/docs/en/reference/build_systems.html
   [15]: http://addyosmani.com/blog/custom-sublime-text-build-systems-for-popular-tools-and-languages
  
