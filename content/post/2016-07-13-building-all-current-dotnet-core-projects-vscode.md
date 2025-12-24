+++

title = "Building all and current dotnet core projects in VSCode"
aliases = ["/2016/07/13/building-all-current-dotnet-core-projects-vscode/"]
tags = ["VSCode","ASP.Net"]
+++
As you may or may not know I try to work on OSX as much as possible and with .Net that's quite painful to be honest.  Things are moving along nicely with Jetbrains Rider,
VSCode, Xamarin and Omnisharp.  I'll be honest, none of them are perfect and I often find myself using Visual Studio in a VM because it just works (yes, its clunky etc etc).
Recently, VSCode got a 1.3 release with some new features, tabs being one of them.  I never really got on with VSCode so dismissed it most of the time but this new release
opened my eyes a bit more and thought I'd give it a go.  Its C# support now runs on .Net Core RTM and most of my work at the moment is porting projects to .Net Core so it seemed
this would be worthwhile.  I've tried to setup keybindings that are the ones I know from Visual Studio and installed couple of extensions to make things easier and prettier.  

As VSCode is language agnostic the one thing I found was how to build .Net Core projects was a bit off.  For each project you have you have to configure a task runner.  VSCode tries to 
help you here and gives you a few languages to choose from.  For .Net Core it creates a `dotnet build` task.  The problem with this is that it runs that command from the workspace root, 
ie the folder where VSCode is opened.  What if you open it from the git root folder and your project(s) are under a src/MyProject folder?  It will fail as it cant find project.json.
What you can do is set the `cwd` to be a specific directory by hardcoding it in the task configuration but thats not great if you have multiple projects.  You could use some predefined
variables that VSCode provides eg/`${fileDirname}` but again if you are in a folder 4 levels deep that wont work either.
<!--more-->
I wanted a Build All projects command and a Build Current project command but with the above limitations I set about investigating some terminal commands that could be run to get this to work
and below is what I came up with:
```json
    {
        // See https://go.microsoft.com/fwlink/?LinkId=733558
        // for the documentation about the tasks.json format
        "version": "0.1.0",
        "command": "zsh",
        "isShellCommand": true,
        "showOutput": "always",
        "args": [
            "-c"
        ],
        "options": {
            "cwd": "${fileDirname}"
        },
        "tasks": [{
            "taskName": "Build Current Project",
            "suppressTaskName": true,
            "isBuildCommand": true,
            "args": [
                "setopt extended_glob && print -l (../)#project.json(:h) | xargs dotnet build"
            ],
            "problemMatcher": "$msCompile"
        }, {
            "taskName": "Build All Projects",
            "suppressTaskName": true,
            "isBuildCommand": true,
            "args": [
                "cd ${workspaceRoot} && dotnet build ./**/**/project.json && echo Build Completed"
            ],
            "problemMatcher": "$msCompile"
        }]
    } 
```
**One thing to note, this will only work for OSX/Linux users with ZSH.**

So what we have is a build task that runs a command (the first task) which calls out to `zsh` with the argument `-c` that shows the output in the task panel within VSCode and it executes it
within the current file's directory.  This then calls `setopt extended_glob` to turn on ZSH extended globbing, it finds the closest parent directory that has a project.json and then passes
that to `xargs` which will execute `dotnet build` with the output from the glob.  

We also have another task which will build all projects by changing directory to the workspace root and then running `dotnet build` with a glob pattern to find all the folders with project.json
inside of them.  You will have to change that glob pattern to fit your folder structure but this is what works for the [NancyFX](http://nancyfx.org) project.

To invoke these presee `CMD + P` and type `task` and add a space after task, VSCode will list your tasks, you can then execute either Build Current Project or Build All Projects.

Have fun!
