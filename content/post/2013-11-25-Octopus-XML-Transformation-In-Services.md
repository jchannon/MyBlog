+++

title = "Octopus XML Transformation in Services"
aliases = ["/2013/11/25/Octopus-XML-Transformation-In-Services/"]
tags = ["octopusdeploy",".net"]
+++
We use [Octopus Deploy][1] at work and its a superb tool for deploying your applications whether they be websites or *.exes.

One of the great things it also provides is the ability to use [Microsoft's Transformation][2] process for config files.  However, when deploying a exe application its a bit trickier than a website.  Unfortunately the documentation doesn't mention the steps needed to get this working so read on!  

Typically a web application will have web.config and a web.Release.config as well as other derivations you may use.  Octopus also supports web.[Environment].config.

<!--more-->

In a console application you have an app.config and maybe a app.Release.config if you create one.  Deploying this via Octopus won't invoke the XML transformation.

The trick is to rename the app.Release.config to be the name of the final config file produced by the build along with the 'exe' extension in it and to make sure in Visual Studio you set the build to Copy Always on the MyApp.exe.Release.config file.

So for example if your project is called MyApp and you have an app.config and app.Release.config, open Windows Explorer and rename it to MyApp.exe.Release.config.  Visual Studio won't allow you to rename these files that are dependent on another so you now have to open up MyApp.csproj and alter the references from app.Release.config to MyApp.exe.Release.config

    <Content Include="App.config" />
    <Content Include="MyApp.exe.Release.config" >
        <DependentUpon>App.Config</DependentUpon>
    </Content>

Go into VS, Reload All when it prompts you and set the Copy to Output Directory value to Copy Always

![VS Property Window](https://i.imgur.com/E8Kbezh.jpg)

Now when you deploy Octopus should run the transformation and replace connection strings etc as you would expect.

[1]: http://octopusdeploy.com/
[2]: http://msdn.microsoft.com/en-us/library/dd465326.aspx
