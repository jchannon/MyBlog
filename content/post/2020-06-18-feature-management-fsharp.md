+++

title = "Feature Management in F#/Giraffe/ASP.NET Core"
tags = ["OSS","fsharp","giraffe"]
+++

Following on from [Joe's post](https://joestead.codes/posts/testing-in-production-feature-toggling-netcore/) I thought I'd see how one would do this in F# and Giraffe because why not?  Turns out its quite simple.  First, create a `features.json` file:
<!--more-->
```json
{
    "FeatureManagement": {
        "customGreeting": false
    }
}
```

Then you can create your app and if you want to put it all in one file then you can copy/paste this:

```fsharp
open System
open Microsoft.AspNetCore.Builder
open Microsoft.AspNetCore.Hosting
open Microsoft.AspNetCore.Http
open Microsoft.Extensions.Configuration
open Microsoft.Extensions.DependencyInjection
open Giraffe
open Microsoft.FeatureManagement
open FSharp.Control.Tasks.V2.ContextInsensitive

let getFeatureResponse =
    fun (_: HttpFunc) (ctx: HttpContext) ->
        let featureManager = ctx.GetService<IFeatureManager>()
        task {
            let! enabled = featureManager.IsEnabledAsync("customGreeting")
            match enabled with
            | true -> return! ctx.WriteTextAsync "Hello Jonathan, how are you?"
            | false -> return! ctx.WriteTextAsync "Hello, how are you?"
        }

let webApp: HttpHandler =
    choose
        [ route "/" >=> (text "Welcome to my API")
          subRoute "/features" (choose [ route "" >=> choose [ GET >=> getFeatureResponse ] ]) ]

let configureApp (app: IApplicationBuilder) =
    app.UseGiraffe(webApp)

let configureServices (services: IServiceCollection) =
    services.AddGiraffe().AddFeatureManagement() |> ignore

[<EntryPoint>]
let main _ =
    let configuration = ConfigurationBuilder().AddJsonFile("features.json").Build()
    WebHostBuilder()
        .UseKestrel()
        .UseConfiguration(configuration)
        .Configure(Action<IApplicationBuilder> configureApp)
        .ConfigureServices(configureServices)
        .Build()
        .Run()
    0

```

Start your console app and issue a request to `http://localhost:5000/features` and you should get a different response based on your boolean value you set in `features.json`

Enjoy!