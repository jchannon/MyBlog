+++

title = "Debugging .Net Core apps inside Docker container with VSCode"
aliases = ["/2017/06/07/debugging-netcore-docker/"]
tags = ["OSS","ASP.NET","csharp","Docker"]
+++

So by now using .Net Core on Linux is old news, everyone is doing it and deploying their production apps on Kubernetes to reach peak "I can scale" points.  However, one thing that can get tricky is when you have a requirement to debug an application in a container.  I believe VS on Windows and VS for Mac has some sort of capability to do that (I have no idea what it does underneath but hey who cares I can right click debug right!?) but the information about doing this in VSCode is a bit sketchy.  I tend to use VSCode on OSX the most so I wanted to see how I could do this.

For demonstration purposes lets take a very simple application and we are going to publish it as a self contained application ie/one that has all the runtime and application binaries outputted so you don't have to install dotnet in a container.

To be able to debug that application we are going to need VSDBG(the .Net Core command line debugger) inside the container.

`curl -sSL https://aka.ms/getvsdbgsh | bash /dev/stdin -v latest -l ~/vsdbg`

We are also going to need to append the launch.json for VSCode in your project's root to have the below:


    {
        "name": ".NET Core Remote Attach",
        "type": "coreclr",
        "request": "attach",
        "processId": "${command:pickRemoteProcess}",
        "pipeTransport": {
            "pipeProgram": "bash",
            "pipeArgs": [ "-c", "docker exec -i json ${debuggerCommand}" ],
            "debuggerPath": "/root/vsdbg/vsdbg",
            "pipeCwd": "${workspaceRoot}",
            "quoteArgs": true
        },
        "sourceFileMap": {
            "/Users/jonathan/Projects/jsonfile": "${workspaceRoot}"
        },
        "justMyCode": true
    }


<!--more-->

They key things to note are the `pipeArgs` and `sourceFileMap`. Where it says `json`, under `pipeArgs` this will need to be replaced the name of the container that you are trying to debug.  The `sourceFileMap` is a mapping between where it was compiled on your machine and where it is in VSCode.  The rest of the properties are explained [here](https://github.com/OmniSharp/omnisharp-vscode/wiki/Attaching-to-remote-processes#configuring-launchjson) 

The final Dockerfile looks like this:


    FROM microsoft/dotnet:1.1-runtime-deps

    RUN apt-get update

    RUN apt-get install curl unzip

    RUN curl -sSL https://aka.ms/getvsdbgsh | bash /dev/stdin -v latest -l ~/vsdbg

    COPY ./publish /app

    WORKDIR /app

    ENTRYPOINT ./jsonfile


So we're ready to go with the following steps:

`dotnet publish -c Debug -f netcoreapp1.1 -r debian.8-x64 -o ./publish`


`docker build -t jchannon/jsonfile --rm .` 

`docker run -t —name json jchannon/jsonfile`

Add a breakpoint to you application

Go to VSCode Debug pane, select `.NET Core Remote Attach` and hit F5

SUCCESS!!

One thing to note with this is, is that you cannot debug a project that has been compiled in Release mode.  Whilst the config above looks like it should work it doesn't. I tried! I believe there may be plans to allow this and the issue can be tracked [here](https://github.com/OmniSharp/omnisharp-vscode/issues/220) .  A sample application and Dockerfile can be found [here](https://github.com/jchannon/DockerDebug) 
