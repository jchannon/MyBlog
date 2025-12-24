+++

title = "Announcing Botwin"
aliases = ["/2017/05/04/announcing-botwin/"]
tags = ["OSS","ASP.NET","csharp","Botwin"]
+++

Whilst keeping my eye on what's going on in .NET Core v2 I came across some planned changes for ASP.NET Core regarding the [routing](https://github.com/aspnet/Routing/blob/dev/src/Microsoft.AspNetCore.Routing/RequestDelegateRouteBuilderExtensions.cs).  I had also read this [blog post](https://www.strathweb.com/2017/01/building-microservices-with-asp-net-core-without-mvc/) from [Filip](https://twitter.com/filip_woj) about using the planned changes for microservices and a lightbulb went off in my head.  I thought to myself I wonder if I could adapt the new extensions to create Nancy-esque routing.  Turns out, I could!

### Sample  
```csharp
    public class ActorsModule : BotwinModule
    {
        public ActorsModule()
        {
            this.Get("/", async (req, res, routeData) =>
            {
                await res.WriteAsync("Hello World!");
            });
        }
    }
```
<!--more-->
Whilst the extensions in the routing allowed users to create some funcs I thought to myself once you get above 3 or 4 of them you are going to want to put them in their own file which tidies things up but then you would still have to register all the routes in your application at one central location ie. in a Startup class or as part of the WebHostBuilder setup.  Whilst that's ok for some I didn't like it particularly so I came up with the BotwinModule.  Now I'm sure many of you who are [Nancy](http://nancyfx.org) lovers are thinking this looks exactly the same as a NancyModule and you'd be correct but sometimes you can't improve on perfection so I took what I knew from Nancy and made it work in a similar fashion.  Each BotwinModule is found and each route is registered with ASP.NET Core.  This is all under the hood, all the user has to do is below:

```csharp
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddBotwin();
        }

        public void Configure(IApplicationBuilder app)
        {
            app.UseBotwin();
        }
    }
```

## Extensions

When I had got the initial routing complete I then started going through some simple scenarios and realised I needed to add some extensions to make usability better.  At the moment this comes at a cost of dependencies and an opinionated approach.

### Binding & Validating

```csharp
    this.Put("/actors/{id:int}", async (req, res, routeData) =>
    {
        var result = req.BindAndValidate<Actor>();

        if (!result.ValidationResult.IsValid)
        {
            res.StatusCode = 422;
            await res.Negotiate(result.ValidationResult.GetFormattedErrors());
            return;
        }

        //Update the user in your database

        res.StatusCode = 204;
    });
```

The above code uses FluentValidation under the hood and validates the incoming request body to `Actor`. The result of BindAndValidate is a Tuple of ValidationResult and T.  At the moment the ValidationResult is from FV so that probably needs abstracting at some point however, as you can see you can check if validation is valid and if not act accordingly.  In this example I return the errors from the validation result using an extension `GetFormattedErrors` and also use a `HttpRequest` extension that negotiates the result ie. if the user asked for JSON with their `Accept` header they get JSON, if they asked for XML or PDF they get that (as long as they implement a `IResponseNegotiator`). Out of the box Botwin will return JSON.

If the user doesn't want to validate incoming data but does want the body deserialized they can simply use `req.Bind<Actor>()`.

### Global Before & After Hooks

There may be circumstances where you want to check something in the request before it hits the route handler or you may want to do something after the route handler has been executed.  This can be setup via options:

```csharp
    public void Configure(IApplicationBuilder app)
    {
        app.UseBotwin(new BotwinOptions(
            async (ctx) => { await ctx.Response.WriteAsync("GlobalBefore"); return true; }, 
            async (ctx) => await ctx.Response.WriteAsync("GlobalAfter")
        ));
    }
```

Here we setup that for each route it will write to the response body on the before and after hook.  Notice that the before hook has a boolean to signify if the routing should continue.  You may not want to continue the route execution for some reason after inspecting it in the Global before hook so can return false.


### Module Before & After Hooks

Like the global before & after hooks these can be applied at a module level:

```csharp
    public class TestModule : BotwinModule
    {
    	public TestModule()
    	{
    		this.Before = async (req, res, routeData) => { await res.WriteAsync("Before"); return res; };
    		
    		this.After = async (req, res, routeData) => { await res.WriteAsync("After"); };
    		
    		this.Get("/", async (request, response, routeData) => { await response.WriteAsync("Hello"); });
    	}
    }
```

Again fairly similar to the global hook but you can return the response object to continue execution or return null to stop the request in the before hook.

### IStatusCodeHandler

An implementation of `IStatusCodeHandler` means you can determine what happens if your route returns a certain status code. ASP.NET Core provides middleware called `UseStatusCodePages` but it is not very elegant for users to use so I felt this was a cleaner option:

```csharp
    public class ConflictStatusCodeHandler : IStatusCodeHandler
    {
    	public bool CanHandle(int statusCode)
    	{
    		return statusCode == 409;
    	}

    	public async Task Handle(HttpContext ctx)
    	{
    		await ctx.Response.WriteAsync("Can't we all just get along?");
    	}
    }
```

You can obviously do whatever you want in the Handle method.

### IResponseNegotiator

Mentioned previously, implementing this interface allows you to handle content negotiation if selected in the route:

```csharp
    public class TestResponseNegotiator : IResponseNegotiator
    {
    	public bool CanHandle(IList<MediaTypeHeaderValue> accept)
    	{
    		return accept.Any(x => x.MediaType.IndexOf("foo/bar", StringComparison.OrdinalIgnoreCase) >= 0);
    	}

    	public async Task Handle(HttpRequest req, HttpResponse res, object model)
    	{
    		await res.WriteAsync("FOOBAR");
    	}
    }
```

Obviously here you can make your response return CSV, PDF etc etc.  If you call `response.Negotiate` and Botwin can't find a relevant implementation it will default to JSON.

If you explicitly want to return JSON from your route you can use another extension like so:

```csharp
    this.Get("/actors", async (req, res, routeData) =>
    {
    	var people = actorProvider.Get();
    	await res.AsJson(people);
    });
```

### Dependency Injection

You can inject dependencies into Botwin modules and these are resolved automatically via the ASP.NET Core built in DI so if you use Structuremap, Autofac etc that is plugged into ASP.NET Core then it will work fine:

```csharp
    public class ActorsModule : BotwinModule
    {
        public ActorsModule(IActorProvider actorProvider)
        {
           //Do stuff
        }
    }
```
## Summary

So what have we got here? This is not Nancy re-imagined on ASP.NET Core, this is me wondering whether I could easily and quickly use some of the lower level parts of the routing to use Nancy-esque style routing.  It runs on pre-released binaries from Microsoft so just a warning for now!  The one thing I have never liked about ASP.NET is the routing whether that be configured in Global.asax or attribute routing or convention based methods in controllers.  This is not a framework.  Things like authentication and error handling etc should be handled by other middleware that comes with ASP.NET Core but Botwin contains enough functionality to get a decent sized app running.  My commitment to Nancy is still as strong but these days finding time to contribute to it is difficult so kind of makes me sad that there is no choice for web frameworks for .NET.  The performance is very good as it sits directly within the ASP.NET Core pipeline.  If you'd like to help out or have some ideas please visit the repo [here](https://github.com/jchannon/Botwin) but today I'm happy to announce Botwin!
