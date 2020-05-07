+++

title = "JavaScript is the future…maybe!"
tags = [".net","angularjs","backbonejs","csharp","javascript","knockoutjs","learning","node.js","oss","typescript"]
+++

I’m not one for New Years resolutions but I thought it was time I looked at JavaScript more in depth.

I looked at [Node.js a while back][1] and found it very interesting and I probably need to go back to it. Over the last month or so there has been a large discussion about async in .Net frameworks and there appears to be a lot of misunderstanding about it (and lets leave it at that, I don’t want to start another flame war) but the thing we can definitely say with [Node.js][2], well JavaScript to be fair is that it is perfectly asynchronous and non-blocking.

As a web developer I have used JavaScript from the early days of Response.Write moving onto frameworks such as [script.aculo.us][3] and [MooTools][4] and finally ending up with [jQuery][5] which has come pretty much a standard these days so my JavaScript skills are not completely new.

However, there has been a large push to use JS more and more for rich user friendly applications with things like [KnockoutJS][6], [AngularJS][7] and [BackboneJS][8] on the client and Node.js on the server. Microsoft has even taken a prominent role in helping bring Node.js to a Windows environment as it started out on *nix based platforms. They have also started contributing to and including scripts in their Visual Studio project templates for jQuery.

<!--more-->

JavaScript can now promote one language to develop on the server and the client which makes things easier and that is one argument I understand and I’m sure there are many others which either I have forgotten or I’m unaware of but the truth is JavaScript seems to be picking up pace in the development world.

We now have things like [CoffeeScript][9] that abstracts JS and allows users to type arguably neater code which then compiles into JS.

The big news is that Microsoft have developed [Typescript][10] which is an attempt to coerce or make the transition easier for C# developers to use JavaScript. Their mantra for TypeScript is

> TypeScript is a language for application-scale JavaScript development. TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. Any browser. Any host. Any OS. Open Source.

With this development along with the fact that Windows 8 applications can be written in C#/XAML **or** JavaScript/HTML proves that MS and therefore probably the mainstream of developers are taking JS as a serious platform to start writing large production systems.

I am off to a [talk][11] about TypeScript with [@markrendle][12] on Jan 22nd so it’ll be interesting to see the language and the points put forward about it and JS as a whole.

As I mentioned earlier there is a large focus on rich content applications which use JS to make the application quick and easy to use and frameworks like KnockoutJS, AngularJS and Backbone have popped up allowing you to create these types of applications.

My biggest concern is which one do you use? I’ve had recommendations for each one which hasn’t helped. KnockoutJS is developed by [@stevensanderson][13] who works for MS so you could say it might be best to use that as it maybe more main stream and a more common requirement for employers to see you know it. I’ve heard arguments that AngularJS &amp; BackBone provide the ability to write a more larger scale JS application where Knockout only provides JS type data binding and validation so again this is beneficial. I also discussed with someone that they and their company evaluated all of them and decided that the learning curve was too high for each and they went with jQuery and various plugins and [Mustache][14] for binding scenarios.

Obviously there are arguments that you should use a library/framework that supplies the solution to your requirements but generally developers want to learn something that will have long lasting benefits to them, yes they learn things for the sake of it but mostly it will benefit them in the long run, for example, you don’t hear of much use for the [Whitespace][15] programming language do you? So whilst there is an obvious push for more intensive use of JavaScript there still seems to be some sort of barrier to entry in deciding upon the correct path to take. Maybe over time the strongest will survive but whilst you’re waiting 1-2 years for something to mature you’re possibly losing business.

   [1]: http://blog.jonathanchannon.com/2012/10/08/node-js-express-hello-world-formula-1-style/ (Node.js, Express, Hello World Formula 1 Style)
   [2]: http://nodejs.org/
   [3]: http://script.aculo.us/
   [4]: http://mootools.net/
   [5]: http://jquery.com/
   [6]: http://knockoutjs.com/
   [7]: http://angularjs.org/
   [8]: http://backbonejs.org/
   [9]: http://coffeescript.org/
   [10]: http://www.typescriptlang.org/
   [11]: http://www.dotnetdevnet.com/Meetings/tabid/54/EntryID/73/Default.aspx
   [12]: http://twitter.com/markrendle
   [13]: http://twitter.com/stevensanderson
   [14]: http://mustache.github.com/
   [15]: http://compsoc.dur.ac.uk/whitespace/
  
