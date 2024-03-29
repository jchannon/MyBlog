+++

title = "Easily publish a NuGet package"
aliases = ["/2012/12/07/easily-publish-a-nuget-package/"]
tags = [".net","asp.net web api","community","nuget","oss"]
+++

I recently published [WebAPI.Testing][1] on [Nuget][2] but found it a bit tricky to build a package ready for NuGet.

There is [documentation ][3]about how to do it but I found it hard to follow so I thought I’d document how I finally got my package ready.

The easiest way I thought was to have something built into Visual Studio. I spoke to [David Fowler][4] and he told me you can edit your *.csproj file and add `<BuildPackage>true</BuildPackage>` to it.

When you build your project a *.nupkg is created ready for publishing with NuGet.

<!--more-->

However if you have no AssemblyInfo.cs or *.nuspec file then that package won’t contain anything that useful about your package.

So the easiest thing to do is amend your AssemblyInfo.cs file [with information about your package][5] if you have an AssemblyInfo.cs file. If you don’t have one its not a problem.

Build your project, open the *.nupkg file that was created with [Nuget Package Explorer][6] and edit the metadata adding any extra information you want about your project.

**Note:** If your solution has NuGet restore turned on the build will pick up the dependencies required for your project. Cool eh!

Click File – Save Metadata As, and save the *.nuspec file into the same place as your *.csproj file.

Go to Visual Studio and include this *.nuspec file in your project. Open it and remove the `<files></files>` node unless you are including other specific files with your package. I found it created a node that pointed to /lib/net45/myProject.dll which was unnecessary and resulted in my project not compiling.

In the future you can edit this *.nuspec file for example when you have a new version and when you build your project it will create a nice new *.nupkg file based on the information provided in the *.nuspec file.

Then go to [nuget.org][7] and register/logon and upload your *.nupkg file

   [1]: http://blog.jonathanchannon.com/2012/11/29/asp-net-web-api-testing/ (ASP.NET Web API Testing)
   [2]: http://nuget.org/packages/WebAPI.Testing
   [3]: http://docs.nuget.org/docs/creating-packages/creating-and-publishing-a-package
   [4]: https://twitter.com/davidfowl
   [5]: http://docs.nuget.org/docs/creating-packages/creating-and-publishing-a-package#From_a_project
   [6]: http://docs.nuget.org/docs/creating-packages/using-a-gui-to-build-packages
   [7]: http://nuget.org/
