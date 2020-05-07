+++

title = "Nancy, ASP.Net vNext, OSX and Sublime Text"
tags = ["nancyfx","oss",".net","community","osx"]
+++
One of the great things that ASP.Net vNext is bringing is the ability to use it cross platform with Microsoft actively testing their libraries against [Mono][2].  Along with this MS are developing a web server that is cross platform and goes by the name of [Kestrel][5].  One thing they aren't doing, yet, is making Visual Studio cross platform so we need something to write our code in.  There a few editors out there but one of the most common is [Sublime Text][4].  This gives you syntax highlighting and build systems that can all be configured so if you are not aware of it check it out.  Obviously before we can start writing code on OSX with our editor we need Mono installed.

**UPDATE - As of August 13th 2014 there is a Mono 3.6 release which means you no longer need to compile Mono but you will need to install Homebrew for ASP.Net vNext. [Skip to nnext section][14]**

At the time of writing the official binary for Mono is 3.4.0 and this does not include some features needed for ASP.Net vNext to run so we are going to have to manually compile Mono ourselves.  Now I know this sounds scary but its not as bad as it seems and I've gone through the pain of setting it up so hopefully this blog post should make it easier for you

There is a [guide][6] on Mono's website on how to compile but I found some issues with it.  I'm running on OSX Mavericks so I'm not sure if that resulted in issues but here's my guide to get it compiling.

<!--more-->
Download 3.4.0 from [here][7] and install with the PKG installer because when compiling the latest Mono source it needs a compiler on the machine.

Install [Homebrew][8] and install the dependencies as shown in Mono's guide. The guide discusses compiling these dependencies but it conflicted with something already on the system.

    brew install autoconf
    brew install automake
    brew install libtool

**NOTE:** You could install Mono using Homebrew if you wish but I didn't realise this until afterwards

Copy the below and put it in a `mymonoinstall.sh` file. Make **$PREFIX** to be a folder on your system, I used `/Users/jonathanchannon/mono`

    PATH=$PREFIX/bin:$PATH
    git clone https://github.com/mono/mono.git
    cd mono
    CC='cc -m32' ./autogen.sh --prefix=$PREFIX --disable-nls --build=i386-apple-darwin11.2.0
    sudo make
    sudo make install

Execute this by typing `mymonoinstall.sh` in a terminal under the folder where the file is. This may take some time based on your internet connection and power of your machine but once done you should be able to run `mono --version` and hopefully see something greater than 3.4.0.

<a name="vnext"></a> 
Now we have Mono installed we're ready to start coding so download [Sublime Text 3][4] and install it.  Once installed we need to install the ASP.Net vNext tools using the following instructions:

    brew tap aspnet/k
    brew install kvm

Create a `.profile` file in your home directory and enter `source kvm.sh`. This is so the system knows what the kvm command is when its typed into the console.
    
We now need to install the [Kulture][9] Sublime plugin that will enable us to run ASP.Net vNext from Sublime.  In Sublime open the console `View -> Show Console` and paste in the below

    import urllib.request,os,hashlib; h = '7183a2d3e96f11eeadd761d777e62404' + 'e330c659d4bb41d3bdf022e94cab3cd0'; pf = 'Package Control.sublime-package'; ipp = sublime.installed_packages_path(); urllib.request.install_opener( urllib.request.build_opener( urllib.request.ProxyHandler()) ); by = urllib.request.urlopen( 'http://sublime.wbond.net/' + pf.replace(' ', '%20')).read(); dh = hashlib.sha256(by).hexdigest(); print('Error validating download (got %s instead of %s), please try manual install' % (dh, h)) if dh != h else open(os.path.join( ipp, pf), 'wb' ).write(by)

**NOTE: These instructions are for Sublime Text 3. At the time of writing Kulture is only supported on version 3 so if you have version 2 you're out of luck I'm afraid**

This will install a package manager for Sublime, you can never have too many package managers eh!

`Bring up the Command Palette in Sublime (Cmd + Shift + P)`

`Select Package Control: Install Package`

`Select Kulture when the list appears.`

So now we have the ability to run, restore and build our ASP.Net vNext apps in Sublime we're ready to create a Nancy app.  Now you could create 4 files manually and build and run them but we might as well install another package manager that will create a Nancy app for us!  I've made a [Yeoman][11] plugin which [creates a Hello World app][15] in Nancy for ASP.Net vNext which can be opened in Sublime.

Go and install [Node.js][10] and then open up a terminal and type:

    npm install -g yo
    npm install -g generator-nancy

Go to a folder in your terminal and type `yo nancy`, it will ask you what you want to call your app, you can type something in or accept the default and it will create the files needed to create the app.  It will also do a NuGet restore for all the dependencies the app has.  In Sublime go to `File -> Open Folder` and select the folder with your app in.

`Go to Tools -> Build System and select ASP.Net`

`Type Cmd + B`

`You should see the build output in the Sublime console`

`Bring up the Command Palette in Sublime (Cmd + Shift + P)`

`Type 'K' and select Run K commands`

`Select Kestrel and a terminal window will open and you should see 'Started'`

`Open a browser and go to http://localhost:5000 and you should see 'Hello World' from your Nancy app`
 
There we have it, a Nancy ASP.Net vNext building and running from Sublime Text.  Here's a video to prove it works!

<iframe width="560" height="315" src="//www.youtube.com/embed/qZDRhNw_TPI" frameborder="0" allowfullscreen></iframe>


**Tip** : Put a syntax error in your code and build your app and see the error reported in the Sublime console.  Double click that error line and watch it open the offending file!

For bonus points you can have a play with [this plugin][12] that aims to give C# intellisense in Sublime!

Have fun!



  [1]: http://blog.jonathanchannon.com/2014/06/14/nancy-aspnet-vnext-vs2014-azure/
  [2]: http://www.mono-project.com/Main_Page
  
  [4]: http://www.sublimetext.com/3
  [5]: https://github.com/aspnet/KestrelHttpServer
  [6]: http://mono-project.com/Compiling_Mono_on_OSX
  [7]: http://www.go-mono.com/mono-downloads/download.html
  [8]: http://brew.sh/
  [9]: https://github.com/ligershark/Kulture
  [10]: http://nodejs.org/
  [11]: http://yeoman.io/
  [12]: https://github.com/moonrabbit/OmniSharpSublime
  [14]: #vnext
  [15]: https://www.npmjs.org/package/generator-nancy
