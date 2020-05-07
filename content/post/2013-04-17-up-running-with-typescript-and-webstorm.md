+++

title = "Up & Running with TypeScript and WebStorm"
tags = ["javascript","oss","osx","typescript","webstorm"]
+++

I love my iMac and I’m on a mission to find a language I enjoy that I can use my Mac for (no Windows fan boy jokes please). There’s something in my mind I associate with work and my Windows laptop. Therefore, I don’t feel to excited about getting my laptop out of my bag in the evenings/weekends to play with other stuff.

As I want to broaden my knowledge I wanted to find something ideally statically typed (although I’m currently looking into Python) that would work on OS X. I’ve said previously that JavaScript seems the way to go in my current situation so I thought I’d take a look at TypeScript and also use [WebStorm][1] from Jetbrains as my IDE seeing as I’ve heard so many great things about them and their products (don’t worry I use ReSharper).

## TypeScript

So I went over to TypeScript’s [website][2] and followed the Hello World type code examples under the “Learn” tab.

<!--more-->

After understanding the basics of it and wanting to learn more I spotted this demo code:

	class Student {
	    fullname : string;
	    constructor(public firstname, public middleinitial, public lastname) {
	        this.fullname = firstname %2B " " %2B middleinitial %2B " " %2B lastname;
	    }
	}
	
	interface Person {
	    firstname: string;
	    lastname: string;
	}
	
	function greeter(person : Person) {
	    return "Hello, " %2B person.firstname %2B " " %2B person.lastname;
	}
	
	var user = new Student("Jane", "M.", "User");
	
	document.body.innerHTML = greeter(user);

There is an interface that expects public properties of firstname and lastname. There is a Student class that has a constructor with arguments for firstname, middleinitial and lastname. TypeScript constructor arguments are shorthand for making the arguments properties on the object itself without having to code all that yourself. We then have a function called greeter that takes a method argument of our Person interface and uses the properties of it to return a string. We then create a new instance of the Student class and then call the greeter function with our instance. Woooaaahhh! I want static typing, WTF is going on here? Essentially TypeScript allows for [Duck Typing][3] where any object that makes calls to or uses properties that match another type, it will allow. Now technically you can do this in C# by using the “dynamic” keyword but I would still keep and one to one mapping even if it was dynamic/duck typed so not to confuse future users.

It may be this example that I don’t like where properties are being un-used or the fact that the keyword “interface” is being used and the class is not statically implementing it but I guess this is how TypeScript uses interfaces ie/duck typing. I can’t think of a reason why you’d have an object that exposes properties that are not used when they have been shoe horned/duck typed into another with fewer properties etc, however, this might just be my statically typed mind not liking it and it should chill and get with the dynamic nature of things!

## Webstorm

So in my quest to develop something on my Mac I chose Webstorm as my IDE. I haven’t heard one bad thing against Jetbrains so it must be good right? Must be simple and intuitive? Ummm, no. Webstorm has support for TypeScript and uses the computer’s version of TypeScript to compile *.ts files into *.js files. So I installed Node.js and TypeScript (_npm install -g typescript_) and fired up Webstorm. Webstorm offers various project types to create new projects from but unfortunately no TypeScript one so I created an empty application. I added a *.ts file and Webstorm spots that this is a TypeScript file and wants to add a File Watcher. This means every time a change is made it recompiles in the background to produce *.js, that seems a bit keen for my liking and would prefer it on every time the file is saved but each to their own. I copied the above code into my my *.ts file. I then created a html file and referenced the JavaScript file that was created from the TypeScript compilation in the head section. (I’m using the term compilation but I guess it should be transpiling but you know what I’m getting at).

Ok, we’re ready to go and debug and here comes the confusion!

Being used to Visual Studio I thought it would start a web server instance up, open my system browser and away we go but unfortunately not. I was baffled but that doesn’t take much! I found the Run menu item and it had a Debug option and it then popped up window with a Edit Configuration option so I clicked that and it came up with the below:

![WebStorm Debug][4]

As there was no TypeScript option I assumed JavaScript was the option to go with. Under this option it has Local and Remote menu items to choose from. If you look at Local it autofills a path to the index.html on the filesystem, under the Remote option it shows the project structure and asks for a URL. I tried localhost:1234 but nothing so I went back to the filesystem option and clicked Apply but that doesn’t actually do anything.

So went through it all again and saw the + icon in the screenshot and it gives you an option to add a JavaScript configuration and is a complete mirror of the above screenshot. Very odd. Clicked Apply, then tried to Debug again and it gave me the configuration I chose and then opened Chrome. Nothing. WTF!

Had a rummage around WebStorm and saw a note about needing a Jetbrains Chrome extension to debug. So off to the Chrome Store I went and installed the plugin. Tried to Debug and it now opened a browser with my page so things are looking good. Went to the TypeScript file and put a breakpoint on a line but it wasn’t getting hit. I then put a breakpoint on a line in the JavaScript file and it got hit. Yay! But no content was in my page. Baffled again. WebStorm was saying that it couldn’t set the innerHTML property of null. Eh? How can a body be null? After a while of head scratching I sussed it. Those of you that are eagle eyed will have spotted that I put the script declaration in my head and therefore when it got executed there was no such thing as a body tag in the DOM yet. So I moved the script declaration to the body and bingo we have content. I should know better and should have put the script tag at the bottom of the body anyway but this was just a “Hello World” app so wasn’t too worried.

Anyway it now works and either I’m too entrenched in Visual Studio and should learn to adapt to new IDE’s or I expect things to just work without having to [RTFM][5]. I must say if I have to read the manual on how to use pieces of software you have an instant fail however, as I’ve heard such great things about Jetbrains and Webstorm I’m willing to give it another go but it has me on the back foot already. I’m also still unsure how to set WebStorm up to use a local web server because debugging by pointing to a file system seems wrong, if anyone knows please let me know.

I hope this helps someone else to get up and running with TypeScript and WebStorm, if not I’m sure there are plenty who’ve had a laugh from this article asking how one person can be so dumb :)

   [1]: http://www.jetbrains.com/webstorm/
   [2]: http://www.typescriptlang.org/
   [3]: http://en.wikipedia.org/wiki/Duck_typing
   [4]: /images/blogpostimages/WebstormDebug-620x390.png (Webstorm Debug)
   [5]: http://en.wikipedia.org/wiki/RTFM
  
