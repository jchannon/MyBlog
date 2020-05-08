+++

title = "Async Route Handling with Nancy"
aliases = ["/2013/08/24/async-route-handling-with-nancy/"]
tags = ["nancyfx","oss","community","async",".net"]
+++
I don't know about you but all I hear is "ASYNC ALL THE THINGS!", I think this is partly down to its new and shiny and us developers love "the shiny" and partly a lot of the things we do in our applications are I/O based whether that be database or file system. 

The problem that comes with the new and shiny bandwagon is you need to understand what you're evangelising. Making asynchronous methods and executing them with no actual reason will not give your codebase any gains and could actually effect your application's performance.  There is more depth to that argument but for simplicity just remember this, only use asynchronous methods if you are doing some sort of I/O. 

It could also be argued that only "use asynchronicity in a web framework if you expect high traffic in your web application". If you only have 10 requests on a small site you're not going to benefit from asynchronous execution as there are plenty of threads available to handle your application.  If you start hitting 1000 concurrent requests (the default IIS limit) then requests will start getting queued up.  If you make your routes asynchronous then any code that is being waited on, the thread that is being used there can be released to process another request thus speeding up the performance of your app and prevent the likely hood of large queues.  I will show how simple it is to make your routes asynchronous with Nancy below.

<!--more-->

## Using Async with Nancy

With the introduction of `async/await` in .NET 4.5 the way to do asynchronous execution simplified the previous approaches in .NET.  Having asynchronous execution within a web framework these days seems to be a "must have" so the Nancy team got their freak on (mainly [@grumpydev][2]) and enabled async/await within Nancy.  Its codebase has been kept backward compatible with .NET 4.0 but has been enabled to use the .NET 4.5 `async/await`, pretty impressive! In fact it uses its own version of `ContinueWith` as the default one was considered not quick enough along with other [TPL][1] optimizations.

Below is the synchronous version of returning "Hello World":

    public class SampleModule : Nancy.NancyModule
    {
        public SampleModule()
        {
            Get["/"] = parameters => "Hello World!";
        }
    }
    
If we wanted to make this `async` (although we wouldn't as there is no I/O and we wouldn't see any benefit) we would change it to look this:

    public class SampleModule : Nancy.NancyModule
    {
        public SampleModule()
        {
            Get["/", true] = async (parameters, ct) => "Hello World!";
        }
    }
    
Simple and elegant hey?!

So what's going on you say?  Well the boolean of "true" on the request path tells Nancy that the request is marked as asynchronous.  We can then mark the route as `async` as you would any `async` method and the delegate of the route now takes and additional `CancellationToken` along with the captured parameters.  If you wanted you could use named parameters and define your route like so: 

    public class SampleModule : Nancy.NancyModule
    {
        public SampleModule()
        {
            Get["/", runAsync:true] = async (parameters, ct) => "Hello World!";
        }
    }


The `CancellationToken` is passed in so you can check the `ct.IsCancellationRequested` property to determine if you want to cooperatively cancel processing in your route handler.  This property may be set for example if there is an internal error or if a piece of middleware decides to cancel the request, or the host is shutting down. If you didn't know Nancy is OWIN compliant and has been pretty much since the OWIN specification came out.

## Demo Time

As I stated above, returning "Hello World" from an asynchronous route is pointless so we need something I/O bound to demonstrate a bit better how we would use async/await in an application.

Lets imagine we are one of those types that love QR codes and we need to generate one:

    public class IndexModule : NancyModule
    {
        public IndexModule()
        {
            Get["/"] = parameters => View["Index"];

            Post["/", true] = async (x, ct) =>
            {
                var link = await GetQrCode(ct);
                var model = new { QrPath = link };
                return View["Index", model];
            };
        }

        private async Task<string> GetQrCode(CancellationToken ct)
        {
            var client = new HttpClient();
            client.DefaultRequestHeaders.Add("X-Mashape-Authorization", "oEzDRdFudTpsuLtmgewrIGcuj08tK7PI");
            var response = await client.GetAsync(
                    "https://mutationevent-qr-code-generator.p.mashape.com/generate.php?content=http://www.nancyfx.org&type=url"
                    , ct);

            var stringContent = await response.Content.ReadAsStringAsync();
            ct.ThrowIfCancellationRequested();
            dynamic model = JsonObject.Parse(stringContent);

            return model["image_url"];
        }
    }

Here we have a GET that returns a view and then an async POST that `await`'s a `GetQrCode` method that returns a `Task<string>` or `string` depending on how you interpret that specific .NET 4.5 behaviour.  At this point the thread can be used to process another request whilst it waits to be notified that `GetQrCode` has finished.  

The `GetQrCode` method uses a `HttpClient` to execute an API call to get a QR code which will link to http://www.nancyfx.org.  Our method will then return the location of the QR code image. 

Anything marked with `async` needs an `await` otherwise it will just execute synchronously.  In our method we execute an asynchronous call (just like our async route) to the API so we `await` it and once we do we `await` reading the response as `string` and then parse the JSON content to a dynamic type.  

We return a string from the method but the compiler will actually convert that to a `Task<string>` for us.  

> "An await expression does not block the thread on which it is executing. Instead, it causes the compiler to sign up the rest of the async method as a continuation on the awaited task. Control then returns to the caller of the async method. When the task completes, it invokes its continuation, and execution of the async method resumes where it left off."[MSDN][3]  

Once the `GetQrCode` returns we set up a simple anonymous type with a QrPath property that is set to the result of `GetQrCode` and we return our view.  

In the view we then have some code that determines when to show the QR image:

    @if (Model != null)
    {
        <img alt="QR Code" src="Model.QrPath"/>
    }

You can view this code as a running application in my Github repository [here][4].

## The Guts of it

If you want a bit more of an understanding how `async/await` works in Nancy then lets take a look at the code below that is located in the [DefaultRouteInvoker][7] class:

    public Task<Response> Invoke(Route route, CancellationToken cancellationToken, DynamicDictionary parameters, NancyContext context)
    {
        var tcs = new TaskCompletionSource<Response>();

        var result = route.Invoke(parameters, cancellationToken);

        result.WhenCompleted(
           completedTask =>
            {
                var returnResult = completedTask.Result;
                ...
            }
        ...
    }
    
Our route that we are executing is invoked and as we know from above the captured parameters on the route eg/customer/{id} and a CancellationToken is passed in.  We can then see the customized `ContinueWith` known as `WhenCompleted` is setup to resolve what our route returns be that a view or data.  So as we know when using async we need to return a `Task<T>` (you can return void and have a method marked as `async` but those should only be used for fire-and-forget methods like event handlers) and in our routes case it returns a Task<Nancy.Responses.Negotiation.Negotiator>.  The DefaultRouteInvoker then carries on to do its thing getting ready to render a view or serialize our data.

## Conclusion
So there's the scope of async/await in Nancy, all the goodies of Nancy still apply now with the addition of asynchronous routes.  If you have read this blog post and not used Nancy before please read [this blog post][6] which reminds me I need to add "ASYNC ALL THE THINGS" to the list of reasons to use Nancy!

[1]: http://msdn.microsoft.com/en-us/library/dd460717.aspx
[2]: http://twitter.com/grumpydev
[3]: http://msdn.microsoft.com/en-us/library/vstudio/hh156528.aspx
[4]: https://github.com/jchannon/Nancy.Demo.Async
[6]: http://blog.jonathanchannon.com/2012/12/19/why-use-nancyfx/
[7]: https://github.com/NancyFx/Nancy/blob/master/src/Nancy/Routing/DefaultRouteInvoker.cs
