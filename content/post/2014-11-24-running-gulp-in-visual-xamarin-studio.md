+++

title = "Running Gulp in Visual & Xamarin Studio"
tags = [".net","javascript","gulp","xamarin studio","visual studio"]
+++
I was going to write a long post explaining about all the pain I went through to get this working but then realised you probably don't really care and you just want the code!

![Show the code](https://i.imgur.com/iYjnPK0.png)

<!--more-->

Where I work we are moving to a Linux stack with .Net using Nancy & Postgres on the backend.  At the moment we have developers working in Windows and others on OSX using Visual Studio and Xamarin Studio respectively.  At the moment when we want to run the whole app, we build our project, drop to the command line and run gulp for the frontend stuff.  In Visual Studio we already have a post build event to copy the static assets to the bin directory (we have a self host and a IIS host) but in Xamarin Studio we don't so if that bin directory gets nuked we have to copy assets across VMs and its one big PITA.

So here's the code:

    <PostBuildEvent Condition=" '$(OS)' != 'Windows_NT' AND $(ConfigurationName) == Debug">  

        export PATH=$PATH:/usr/local/bin

        cd $(ProjectDir)..\MyApp.Clients.AngularJS\

        npm install -verbose

        gulp --minify false --bincopy true --copyto "../MyApp.Hosting.Self/bin/debug/static/"
    </PostBuildEvent>
    <PostBuildEvent Condition=" '$(OS)' != 'Windows_NT' AND $(ConfigurationName) == Release">  

        export PATH=$PATH:/usr/local/bin

        cd $(ProjectDir)..\MyApp.Clients.AngularJS\

        npm install -verbose

        gulp --minify true --bincopy true --copyto "../MyApp.Hosting.Self/bin/debug/static/"
    </PostBuildEvent>
    <PostBuildEvent Condition=" '$(OS)' == 'Windows_NT'  ">  
      if $(ConfigurationName) == Debug  (
        cd $(ProjectDir)..\MyApp.Clients.AngularJS\

        npm install -verbose

        cd $(ProjectDir)..\MyApp.Clients.AngularJS\

        gulp --minify false --bincopy true --copyto "../MyApp.Hosting.Self/bin/debug/static/"
      ) else (
        cd $(ProjectDir)..\MyApp.Clients.AngularJS\

        npm install -verbose

        cd $(ProjectDir)..\MyApp.Clients.AngularJS\

        gulp --minify true --bincopy true --copyto "../MyApp.Hosting.Self/bin/debug/static/"
      )

    </PostBuildEvent>

## Idiosyncrasies

So you can probably see some weird things going on there so I'll explain:

### Separate Build Events for Non-Windows

I have a separate post build event for debug and release for non windows builds, I like that, seems correct to keep them separate. However, for Windows builds I have an `if` statement.  I did get separate build events firing but then when it hit the `npm install` line it just wouldn't work for some reason.

### Export PATH for Non-Windows

I spent a long time trying to get gulp running on OSX. I tried it via executable shell scripts and in a post build event but it just wouldn't work but yet in the terminal all was fine.  I'm not sure if `xbuild` gets executed as a different user or with limited privielges but I was stumped until [@yantrio][1] pointed me in the direction of exporting the `PATH`.  As `Gulp` sits in `/usr/local/bin` I had to expose it to the post build event


### Changing directory

In the post build events I change directory to the folder where the gulp file is located.  I did play quickly on doing it without changing directory but there were some disadvantages so I just went with this approach.  On Windows you'll see that I change directory after each command is executed.  For some reason when executed on Windows when the commands are run the current working directory is changed so you have to change it back to folder where you want to run gulp from.  On OSX & Linux you can set it once and all is fine.

## Conclusion

So there you have it.  You're asking why not use the [Visual Studio 2013][2] extension that enables running gulp from VS?  That would only work for those developers using Visual Studio and we have developers using Xamarin Studio so we wanted an across the board solution for all developers.  I know VS 2015 will have Gulp runners baked into it but I'm not sure of Xamarin Studio plans.  If you use this and get it working without a `if` statement for Windows let me know. 

Also check out [OmniSharp][3] a little project I've been working on!

  [1]: http://twitter.com/yantrio 
  [2]: https://visualstudiogallery.msdn.microsoft.com/8e1b4368-4afb-467a-bc13-9650572db708
  [3]: http://omnisharp.net
