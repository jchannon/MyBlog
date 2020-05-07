+++

title = "ASP.NET Web API Testing"
tags = [".net","c#","asp.net web api","community","github","nancyfx","oss"]
+++

As the need arose to implement some kind of Web Service/HTTP API I thought I would evaluate [NancyFX][1], [ASP.NET Web API][2] and [ServiceStack][3].

Suffice to say all performed as expected and I was actually surprised to find that implementing ASP.NET Web API was easier than ServiceStack (I know that might be a bit of a statement to make to the ServiceStack followers, sorry). I found Nancy easiest to implement. The very simple API demos can be found on [my Github page][4].

When it came to testing ASP.NET Web API I found it to be wanting slightly in comparison to Nancy. With WebAPI I could make direct calls to the controller methods to make sure data was returned correctly and I could mock a repository and test that the methods in the repository were being called but there was nothing I could see to test the HTTP response I would get.

<!--more-->

I found that you could configure a lot of stuff to get a HttpResponseMessage back as shown below however in my opinion it wasn’t particularly easy on the eye and seemed a bit over the top just to get a response back.

	//Arrange
	var config = new HttpConfiguration();
	var request = new HttpRequestMessage(HttpMethod.Post, "http://localhost/api/products");
	var route = config.Routes.MapHttpRoute("DefaultApi", "api/{controller}/{id}");
	var routeData = new HttpRouteData(route, new HttpRouteValueDictionary { { "controller", "products" } });
	var controller = new ProductsController(repo);
	controller.ControllerContext = new HttpControllerContext(config, routeData, request);
	controller.Request = request;
	controller.Request.Properties[HttpPropertyKeys.HttpConfigurationKey] = config;

Then you can call your controller method and assert against it.

	// Act
	var result = controller.PostProduct(new Product { Id = 1 });
	
	// Assert
	Assert.Equal(HttpStatusCode.Created, result.StatusCode);

I can’t take credit for finding this out though. I found it on [Peter Provost][6] blog post where he says [Brad Wilson][7] helped him construct the code.

I wasn’t positive whether the HTTP response returned was as pure as if the request was actually made to a server. By understanding the [Nancy.Testing][8] library I knew that the response given there was an exact copy of what would be given if hitting a server.

I then investigated a bit more and found a great blog post by [Filip W][9] about in-memory hosting. This essentially mirrors a server in terms of receiving a request and issuing a response.

Knowing what I knew from Nancy I thought I could apply it to Web API. What this meant was you could submit requests and test against the response. I’m not sure how you would classify it in terms of unit testing or integration testing because the tests run very quickly but I suppose you are hitting an actual server albeit in memory.

Here’s what a simple test looks like:

	public class GetDataTests
	{
	    [Fact]
	    public void GetData_WhenRequested_ShouldReturnJSON()
	    {
	        var browser = new Browser();
	        var response = browser.Get("/GetData", (with) =>
	        {
	            with.Header("Accept", "application/json");
	            with.HttpRequest();
	        });
	
	        Assert.Equal("application/json", response.Content.Headers.ContentType.MediaType);
	    }
	
	    [Fact]
	    public void GetData_WhenRequested_ShouldReturnOKStatusCode()
	    {
	        var browser = new Browser();
	        var response = browser.Get("/GetData", (with) =>
	        {
	            with.Header("Authorization", "Bearer johnsmith");
	            with.Header("Accept", "application/json");
	            with.HttpRequest();
	        });
	
	        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
	    }
	}

You define your test, in this case [xUnit][10]. You create an instance of the Browser class. This is just a class name there is no browser, it doesn’t fire up IE or anything like that. You then call a method named after a HTTP verb with a path specified. You also have the ability to specify items within the request such as headers, form values and cookies using a delegate. The methods in the Browser class will return a HttpResponseMessage which is what Web API server returns and you can then assert against the response.

Delving a little deeper into the code, the Browser class takes an optional HttpConfiguration constructor argument or if one is not supplied it uses the below configuration. It then creates an instance of HttpServer and passes the configuration into it.

	private readonly HttpServer _server;
	
	public Browser()
	{
	    var config = new HttpConfiguration();
	    config.Routes.MapHttpRoute(name: "Default", routeTemplate: "api/{controller}/{action}/{id}", defaults: new { id = RouteParameter.Optional });
	    config.IncludeErrorDetailPolicy = IncludeErrorDetailPolicy.Always;
	    _server = new HttpServer(config);
	}

When a method is called it then builds up a HttpRequestMessage using the items defined in the delegate in the unit test and passes it to the server variable and the HttpResponseMessage is returned.

	public HttpResponseMessage Get(string path, Action browserContext = null)
	{
	  return this.HandleRequest(HttpMethod.Get, path, browserContext);
	}
	
	private HttpResponseMessage HandleRequest(HttpMethod method, string path, Action browserContext)
	{
	    var request = CreateRequest(method, path, browserContext ?? this.DefaultBrowserContext);
	
	    if (BrowserHttpClient == null)
	        BrowserHttpClient = new HttpClient(_server);
	
	    HttpResponseMessage response = BrowserHttpClient.SendAsync(request).Result;
	   
	    request.Dispose();
	
	    if (_server != null)
	    {
	        _server.Dispose();
	    }
	
	    return response;
	}

This gives you the ability to pretty much test the full pipeline of a request and response.

The Github repository is located [here][11] and if you like what you see please take a closer look into [NancyFX][1].

![NancyFX][12]

*NancyFX*

**UPDATE 7th Dec 2012:** The project is available on [Nuget][13]

   [1]: http://nancyfx.org/
   [2]: http://www.asp.net/web-api
   [3]: http://www.servicestack.net/
   [4]: http://github.com/jchannon
   [6]: http://www.peterprovost.org/blog/2012/06/16/unit-testing-asp-dot-net-web-api/
   [7]: http://bradwilson.typepad.com/
   [8]: https://github.com/NancyFx/Nancy/tree/master/src/Nancy.Testing
   [9]: http://www.strathweb.com/2012/06/asp-net-web-api-integration-testing-with-in-memory-hosting/
   [10]: http://xunit.codeplex.com/
   [11]: https://github.com/jchannon/WebAPI.Testing
   [12]: /images/blogpostimages/nancy-horizontal-framed-bf-wb-620x240.png (NancyFX)
   [13]: http://nuget.org/packages/WebAPI.Testing
  
