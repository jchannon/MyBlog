+++

title = "Microsoft Endorsing C# as a First Class Citizen in Sublime Text"
tags = ["oss",".net","community","sublimetext","csharp"]
+++
At the end of my last [post][1] on using ASP.Net vNext with Sublime Text I briefly mentioned a [plugin][2] that aimed at giving intellisense for C# within the editor.  Well 2 months later and I'm happy to announce that intellisense works and I've added a slew of other features that will hopefully make you feel at home away from Visual Studio.

I discovered the plugin thanks to [Jason Imison][3] but at that point there was some issues getting the intellisense working consistently because at that time I was using it with an ASP.NET vNext application which didn't have a solution file (*.sln) and the plugin was expecting that.  After speaking to Jason I found out I could change the settings so it wouldn't expect a solution file and give me the intellisense I was after in a text editor.  Eureka, it worked!  I was now on a mission to make Sublime be a first class citizen when writing C#.  Some may question why on earth would I want to edit C# in something other than Visual Studio.  I don't really want to get into that debate here but all I'll say is, it's nice to have other editor options and with Microsoft's mission to provide vNext compatibility with Mono and Visual Studio not running on OSX/Linux it makes sense to have an editor with feature rich C# support (yes I know there is Xamarin Studio but "options" people, "options").

<!--more-->

##How does it work?

I should really introduce [Jason Imison][3].  Jason is the author of a library called [OmniSharpServer][4] which is a -  
> HTTP wrapper around NRefactory allowing C# editor plugins to be written in any language.

> NRefactory is the C# analysis library used in the SharpDevelop and MonoDevelop IDEs. It allows applications to easily analyze both syntax and semantics of C# programs. It is quite similar to Microsoft's Roslyn project; except that it is not a full compiler – NRefactory only analyzes C# code, it does not generate IL code.  

In simple terms OmniSharpServer is a local web server (written in [Nancy][5]) that accepts requests to various different endpoints which returns results about the code you sent to it.  For example, in Sublime Text when you have a string variable and you type `.` after the variable a request is sent to OmniSharpServer with a specific payload and the response contains all the possible completions for that variable.  

The editor plugin is responsible for initiating the requests and dealing with the response in order to provide the user a rich user experience for editing C# and this is hopefully what I have done with [OmniSharpSublime][2].

##Getting Started

For Mac & Linux users you will need Mono installed.

For Windows users you will need Python installed and in your PATH.

Well versed users in Sublime know there is a package manager that allows you to easily install plugins.  In the package manager if you search for OmniSharp you will see the plugin avaiable for install.  Install and away you go!  Please note that I would not consider the plugin a stable release, its close but not quite there yet.

As I mentioned earlier you can use OmniSharpSublime with a traditional C# solution or with an ASP.Net vNext project (that does not require a solution file) however, you will need a `sublime-project` file.

Let's assume you already have a solution.

`Go to "File -> Open" and select the folder with your solution in it.`

`Go to "Project -> Save Project As" and save a YOURPROJECTNAME.sublime-project in the same location as your *.sln`

`Open your YOURPROJECTNAME.sublime-project file that should now appear in the sidebar on the left`

`Enter the location to the *.sln file like below`

Your `.sublime.project` file should look like this

    {
        "folders":
        [
            {
                "follow_symlinks": true,
                "path": "."
            }
        ],
        "solution_file": "./testconsoleprj.sln"
    }
    
Once the `YOURPROJECT.sublime-project` is set up and saved follow the below:

`Close Sublime (YMMV but this seems to be the best way to open the YOURPROJECTNAME.sublime-project)`
    
`Open Sublime`
    
`Click "Project -> Open Project", and select your YOURPROJECTNAME.sublime-project file`
    
Now with the `sublime.project` open you should be ready to edit your `*.cs` files.

There is one last "nice touch" to add to Sublime before you edit your files.  Sublime allows syntax specific settings so for C# it would be great if we could invoke intellisense when we type a full stop.

`Click "Sublime Text -> Preferences -> Settings - More -> Syntax Specific - User"`
    
Paste in the below code and save

    {
        "auto_complete": true,
        "auto_complete_selector": "source - comment",
        "auto_complete_triggers": [ {"selector": "source.cs", "characters": ".<"} ],
    }

Now you're ready to rock!

##Features

Below I will highlight some of the cool features of [OmniSharpSublime][2] by the power of animated gifs (hope you have a decent internet connection, sorry!)

###Intellisense

This is probably one of the most important features that springs to mind when editing a C# file in a text editor. 

![Intellisense](http://i.imgur.com/IkirwAE.gif)

###Go To Definition

![Go to definition](http://i.imgur.com/ZClA8qG.gif)

###Rename

![Rename](http://i.imgur.com/6ByBw5R.gif)

###Find Usages

![Find Usages](http://i.imgur.com/yUGl59t.gif)

###Go To Implementation

![Go to Implementation](http://i.imgur.com/3Ypv6H8.gif)

###Format Document

Checkout the key binding!

![Format Document](http://i.imgur.com/kkkUiRZ.gif)

###Override

![Override](http://i.imgur.com/EntuVe1.gif)

###Add Reference

![Add Reference](http://i.imgur.com/nWZndb0.gif)

###Syntax Errors

![Syntax Errors](http://i.imgur.com/Ka4tHk6.gif)

###Semantic Errors

![Semantic Errors](http://i.imgur.com/ljEfdfv.gif)

###Code Issues

![Code Issues](http://i.imgur.com/qRN9ydy.gif)

###Fix Code Issues

![Fix Code Issues](http://i.imgur.com/xWD8qwn.gif)

###Fix Using Statements

![Fix Usings](http://i.imgur.com/7fmRFqm.gif)

###Code Actions

Checkout the key binding for Resharper lovers!

![Code Actions](http://i.imgur.com/16UsVBf.gif)

###Add New C# File

There is also add new C# interface and you can add [your own templates][28]!

![Add new c# file](http://i.imgur.com/0S5T48f.gif)

###Type Lookup

![Type Lookup](http://i.imgur.com/5Wu44i5.gif)

###Build Solution

You can press F4 & Shift+F4 to cycle through the errors reported!

![Build](http://i.imgur.com/g6Adivm.gif)

###Unit Tests

![Unit Tests](http://i.imgur.com/gSuTami.gif)

###Add/Remove from Project

If you create an empty chsarp file or paste a file into the folder, if you open it up and simple save the file it will be added to the `*csproj` file. You can also right click a file and choose `Remove from Project` and this will remove the file from a `*.csproj` file.  

##OSS FTW!

Hopefully that's given you a taste of what the plugin can do and I hope you think its as cool as I do.  I believe that this will give users another option when deciding what editor to use when editing C# files.  A big thanks to [Jason Imison][3] for OmniSharpServer which allows the plugin to provide all the code options and for him putting up with my questions.

If you're interested please [download][26] the plugin and enjoy it.  Please let me know of any issues or features you think need adding, I already have plenty in my head but I'm sure there are more additions we can add to make the plugin better and better.  Some documentation can be found [here][27].

Also thanks to the guys who originally came up with the idea of the plugin and to the other contributors who have already submitted pull requests.

##Microsoft & OSS

This blog post and project has been sitting on my file system for probably 4-5 weeks ready to be published but during that time I've had chance to make new friends and add new features which I've shown you above! 

> Question: Why did I wait 4-5 weeks to publish this post?  
> Answer  : Microsoft!

Since my last [blog post][1] I'd been in touch with the authors of the Kulture plugin ([Sayed Ibrahim Hashimi](18)) who just happened to work for Microsoft.  They liked my [Nancy][5] yeoman generator and I managed to convince them to merge my generator with their ASP.Net generator.  I asked a few questions here and there and [Jason Imison][3] came onboard, then [Martijn Laarman][8] showed some interest in getting intellisense working and soon we started growing something.  [David Fowler][9] was brought in to answer some questions and we started having Skype chats with [Scott Hanselman][10] and we then decided upon the path we were going to take.  OmniSharp was born!

##OmniSharp

Our path was going to be make C# available on all the popular editors.  Soon we had [Stephen James][11] and [Martijn Laarman][8] working on making OmniSharp work with [Atom][22], [Jason Imison][3] working with [Vim][23], [Simon Carter][12], [Mika Vilpas][13] & [Jason Imison][3] on [Emacs][24], [Mat McLoughlin][14] on [Brackets][25] and me on [Sublime][2].

We then moved all our repositories to an [OmniSharp Github organization][15]

We built a [website][7]

We created a [twitter account][16]

We created a [Jabbr room][17]

Lets just make this clear, Microsoft were working with us to publicise and demonstrate C# working on all the major editors where we predominantly used them on OSX so Mono was going to be needed and they were happy about this!  

*Hang on, why did you have to wait 4-5 weeks to release the blog post?*  

The reason was that Microsoft were going to have a **big** announcement to make on November 12th 2014 and it was going to be that the .NET CLR was going to be built as a cross platform and open source tool and that they were going to demonstrate the work we'd been doing on OmniSharp as part of this announcement so we decided after that we'd go public so to speak!  

>**WHAT?!**

That's right, .NET is going OSS & cross platform! HUGE NEWS and we were working as part of an OSS team with Microsoft to highlight that you can use any editor you like to build .NET applications on any platform.  It appears Leopards can change their spots. Lets hope this new open Microsoft will continue for many years to come!

###Taking OmniSharp forward

Jason has started working with the [Design Time Host][21] that is used for ASP.NET vNext projects which provides information about vnext assemblies and this will be integrated into OmniSharpServer and there are areas already in OmniSharpSublime that I have highlighted that need to become more vNext focused.  [Sayed][18] is making changes to Kulture such as intellisense in project.json for NuGet packages, maybe our two projects will merge.  NRefactory are looking to use Roslyn for the code analysis engine underneath which effects OmniSharpServer. I'm hoping that OmniSharp will become an OSS success for all of us to gain from and I hope you will want to be apart of it.


##Conclusion
So there you have it, C# as a first class citizen in Sublime Text, .Net as a cross platform tool and .Net going open source.  What a day! 

Enjoy!

Scott Hanselman has posted his views on OmniSharp and a cross platform OSS .NET [here][19]

Mat McLoughlin has posted information on the Brackets plugin [here][29]

Martijn Laarman has posted information on the Brackets plugin [here][30]

##Leave them wanting more!

I've been spiking NuGet support for Sublime and here's a brief intro

![NuGet](http://i.imgur.com/MB7EH6x.gif)


  [1]: http://blog.jonathanchannon.com/2014/08/05/nancy-aspnetvnext-osx-sublime-text/
  [2]: https://github.com/OmniSharp/omnisharp-sublime
  [3]: http://twitter.com/jasonimison
  [4]: https://github.com/OmniSharp/omnisharp-server
  [5]: http://www.nancyfx.org
  [6]: https://github.com/OmniSharp/Kulture
  [7]: http://www.omnisharp.net/
  [8]: http://twitter.com/mpdreamz
  [9]: http://twitter.com/davidfowl
  [10]: http://twitter.com/shanselman
  [11]: http://twitter.com/stephenhjames
  [12]: http://twitter.com/bbbscarter
  [13]: http://twitter.com/sp3ctum
  [14]: http://twitter.com/mat_mcloughlin
  [15]: https://github.com/OmniSharp/
  [16]: http://twitter.com/OmniSharp/
  [17]: https://jabbr.net/#/rooms/omnisharp  
  [18]: https://twitter.com/sayedihashimi
  [19]: http://hnsl.mn/dotnet2015
  [20]: http://mat-mcloughlin.net/
  [21]: https://github.com/aspnet/KRuntime
  [22]: https://github.com/OmniSharp/omnisharp-atom
  [23]: https://github.com/OmniSharp/omnisharp-vim
  [24]: https://github.com/OmniSharp/omnisharp-emacs
  [25]: https://github.com/OmniSharp/omnisharp-brackets
  [26]: https://sublime.wbond.net/packages/OmniSharp
  [27]: http://omnisharp-sublime.readthedocs.org/en/latest/
  [28]: http://omnisharp-sublime.readthedocs.org/en/latest/filetemplates/
  [29]: http://mat-mcloughlin.net/2014/11/12/time-to-cast-away-visual-studio-and-use-a-text-editor/
  [30]: http://localghost.io/articles/getting-your-c-sharp-on-with-atom-2014-11-12/
  
<!-- 
Notes for tooling blog post:

    Nrefactory looking to move to Roslyn
    MS providing DTH access that feeds OmniSharpServer
-->
