+++

title = "A quick look at Visual Node"
aliases = ["/2013/08/22/a-quick-look-at-visual-node/"]
tags = ["visual studio","javascript","visual node"]
+++
I came across [Visual Node][1] a few months ago and was excited by the looks of it.  For those that didn't click that link, it basically brings the power of Visual Studio debugging to a node.js app.  You can write your node.js app in Visual Studio, fire up the debugger by hitting F5 and use breakpoints and watches to see what's going on.  

The hipster in me is screaming saying "You should be using Sublime Text and [node-inspector][2] for debugging" but to be honest I found it a bit hackety-hack and it seemed a bit odd debugging my server app in Chrome but maybe that's just something I need to get over.  JavaScript is getting a huge surge in popularity recently so its your duty as a developer to investigate this.  I want to learn and understand JS better but I always get frustrated with it after 10mins and swear that I'm never going to touch a dynamic language again, "give me a statically typed language every time with a compiler".  I have a bit of a Jekyll and Hyde situation going on that I need to overcome.

<!--more-->

When I saw Visual Node it appeared to my statically typed side. "Ooooh, proper debugging, this looks interesting".  So I signed up to be kept up to date when they were ready for beta testers and yesterday I got my email saying I could download a private beta version and give it a whirl. So that's what I did.

I went over to their [README][3] page which explained how to install it and some of the features.  I installed a VSIX which gives me a project template to choose from when creating a project in Visual Studio(VS).

![Project Template][7]

Selecting this gives you a basic http server app template.

![Project Layout][8]

I like that they have tried to bring a [NuGet][5] style dialog for searching packages in [NPM][4].

![NPM Picture][6]

This brings a sense of familiarity to Visual Studio users which is great. It orders its results alphabetically. I found the searching a bit slow but I'm not sure if that's down to my internet connection or how NPM handles searching.

The code in the template is:

    // Load the http module to create an http server.
    var http = require('http');
    
    // Configure our HTTP server to respond with Hello World to all requests.
    var server = http.createServer(function (request, response) {
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.end("Hello World\n");
    });
    
    // Listen on port 8000, IP defaults to 127.0.0.1
    server.listen(8000);
    
    // Put a friendly message on the terminal
    console.log("Server running at http://127.0.0.1:8000/");

I then pressed F5 to see what happened.

It fires up a console app and a browser:

![Console][9]
![Browser][10]

I then went back to Visual Studio and put a breakpoint on the `response.end("Hello World\n");"` to see what would happen when I refreshed my browser.

![Debugging][11]

It stopped on the breakpoint and gives me information about the objects in scope etc and let me step into the current line.

![F11][12]

That's a pretty basic hello world style of seeing what Visual Node can do but that static language side of me really likes the look of this and the potential it can bring. I believe [WebStorm][13] also provides node.js debugging so check that out but for pure familiarity reasons I like the look of this.

For a better understanding here's a video:

<iframe width="560" height="315" src="//www.youtube.com/embed/gXGLGVWWwKI" frameborder="0" allowfullscreen></iframe>

[1]: http://www.visualnode.info/
[2]: https://github.com/dannycoates/node-inspector
[3]: http://www.visualnode.info/readme
[4]: https://npmjs.org/
[5]: http://www.nuget.org/
[6]: https://www.visualnode.info/images/readme/package.png
[7]: https://www.visualnode.info/images/readme/new-project.png
[8]: /images/blogpostimages/projectlayout.PNG
[9]: /images/blogpostimages/console.png
[10]: /images/blogpostimages/helloworldbrowser.PNG
[11]: /images/blogpostimages/debugging.png
[12]: /images/blogpostimages/f11.png
[13]: http://www.jetbrains.com/webstorm
