+++

title = "Porting OWIN middleware to ASP.Net Core"
aliases = ["/2016/06/27/porting-owin-middleware-aspnetcore/"]
tags = ["OSS","OWIN","ASP.Net"]
+++

In our application at work we make use of various middleware and as we are making everything run on .Net Core the time has come to port said middleware to .Net Core.  If you don't already know ASP.Net Core has a bridge that allows you to use OWIN components in an ASP.Net Core application.  This will convert the HttpContext into a OWIN environment dictionary on input and then back again on output.

Lets take an example of some middleware

```csharp
    public class MyMiddleware
    {
        private readonly Func<IDictionary<string, object>, Task> nextFunc;
        private readonly OwinUserMiddlewareOptions options;

        public OwinUserMiddleware(Func<IDictionary<string, object>, Task> nextFunc, MyMiddlewareOptions options)
        {
            this.options = options;
            this.nextFunc = nextFunc;
        }

        public Task Invoke(IDictionary<string, object> environment)
        {
            //Everything is awesome
            return nextFunc(environment);
        }
    }

    public static class MyMiddlewareExtensions
    {
        public static IAppBuilder UseMyMiddleware(this IAppBuilder app, MyMiddlewareOptions options = null)
        {
            return app.Use(typeof(MyMiddleware), options);
        }
    }
```
<!--more-->
Here we see some middleware and an extension so it can be used in an application that uses OWIN.  This would be called in most commonly in a `Startup.cs` file like so:

```csharp
    public void Configuration(IAppBuilder app)
    {
        app.UseMyMiddleware(new MyMiddlewareOptions());  
    }
```

As I said earlier, ASP.Net Core has a bridge to use OWIN components and as long as your middleware can return a `MidFunc` there is very little required for you to do however if you take the example above there is a tiny bit more to do.

## ASP.Net Core Startup.cs

```csharp
    public void Configure(IApplicationBuilder app)
    {
        //Use the ASP.Net Core OWIN bridge
        app.UseOwin(x => x.Invoke(MyMiddleware.ReturnAppFunc()));  
    }
```

Above shows how to use the OWIN bridge if your middleware can already return a `MidFunc`.  For those unclear here's what that looks like `System.Func<System.Func<System.Collections.Generic.IDictionary<string, object>, System.Threading.Tasks.Task>, System.Func<System.Collections.Generic.IDictionary<string, object>, System.Threading.Tasks.Task>>;`

Using our sample middleware above the extension class would now have to look like this:

```csharp
    using System;

    using MidFunc = System.Func<System.Func<System.Collections.Generic.IDictionary<string, object>,
            System.Threading.Tasks.Task>, System.Func<System.Collections.Generic.IDictionary<string, object>,
            System.Threading.Tasks.Task>>;

    public static class MyMiddlewareExtensions
    {
        public static Action<MidFunc> UseMyMiddleware(this Action<MidFunc> builder, MyMiddlewareOptions options = null)
        {
            builder(next => new MyMiddleware(next, options).Invoke);
            return builder;
        }
    }
```

This can now be used in a ASP.NET Core Startup class like so:
```csharp
    public void Configure(IApplicationBuilder app)
    {
      //Use the ASP.Net Core OWIN bridge
      app.UseOwin(x => 
      {
          x.UseMyMiddleware(new MyMiddlewareOptions());
          x.UseNancy();
      });  
    }
```

Tada!  Also note that I only call `UseOwin` once, I don't need to call it for every OWIN middleware I have.  Also just to be clear, if you want your middleware to run on .Net Core you will still have to make sure your middleware is compatible.  The above shows  how you came make your OWIN middleware run in ASP.Net Core pipeline even if its on .Net 4.5 but if it is compatible with .Net Core you can target that from your application and bingo! That is exactly what I have done with my middleware. 

Happy coding!
