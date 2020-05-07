+++

title = "Mocking HttpContext with Fake It Easy"
tags = [".net","asp.net mvc","fake it easy","nancyfx","oss","unit testing","xunit"]
+++

Lets start with the conclusion first and say “use [Nancy][1] for your web applications and APIs” as its brilliant!

If you want to continue reading lets crack on.

I’m currently working on a ASP.Net MVC project and one of the controller methods writes directly to the Response, _eg. Response.Write(“How will I mock thee?”);_

Having moved over to [xUnit][2] and [FakeItEasy][3] recently I wanted to write a unit or integration test depending how you see it to assert against the Http Response.

Doing this is no easy feat with MVC (with Nancy its all [done for you][4]) and you have to mock a lot of things. I’m hoping that in later releases this will be fixed because I know that ASP.Net Web API has made things a bit easier for testing (and wrote a testing library for it) so I assume the two projects will use bits of each other or their roadmap will merge.

<!--more-->

I found that there a quite a lot of samples with Moq but nothing for Fake It Easy(FIE) so I checked in at the [FIE Jabbr room][5] and got some help and worked through some ideas and below is the result.

	//Controller
	public class MyController : Controller
	{
	    [HttpPost]
	    public void Index()
	    {
	        Response.Write("This is fiddly");
	        Response.Flush();
	    }
	}
	
	//Unit Test
	[Fact]
	public void Should_contain_fiddly_in_response()
	{
		var sb = new StringBuilder();

        var formCollection = new NameValueCollection();
        formCollection.Add("MyPostedData", "Boo");

        var request = A.Fake<HttpRequestBase>();
        A.CallTo(() => request.HttpMethod).Returns("POST");
        A.CallTo(() => request.Headers).Returns(new NameValueCollection());
        A.CallTo(() => request.Form).Returns(formCollection);
        A.CallTo(() => request.QueryString).Returns(new NameValueCollection());

        var response = A.Fake<HttpResponseBase>();
        A.CallTo(() => response.Write(A<string>.Ignored)).Invokes((string x) => sb.Append(x));

        var mockHttpContext = A.Fake<HttpContextBase>();
        A.CallTo(() => mockHttpContext.Request).Returns(request);
        A.CallTo(() => mockHttpContext.Response).Returns(response);

        var controllerContext = new ControllerContext(mockHttpContext, new RouteData(), A.Fake<ControllerBase>());

        var myController = GetController();
        myController.ControllerContext = controllerContext;
        

        myController.Index();

        Assert.Contains("fiddly", sb.ToString());
	}

As we are not running this against a live web server we need to mock everything from base controller types to requests, responses and everything in between. My example initiates a bit more than is required ie. querystring and headers but hopefully it demonstrates what’s needed.

Firstly we create an instance of a StringBuilderthat will store the response information that we can assert against. We setup a NameValueCollection to add keys/values for posted data, we could do the same for headers etc if we wanted.

We then create an instance of a fake HttpRequestBase using FIE and setup all the relevant request properties.

We then create an instance of a fake HttpResponseBase and configure a callback that is invoked when our controller calls Response.Write. We also configure it to watch any calls to Response.Write with any string using the FIE syntax of A.Ignored, you could change it so it only looks for specific argument contents if you wanted. When the method is called it then takes the argument and adds it to the StringBuilder.

We then create a fake instance of HttpContextBase and assign the properties of Request and Response to the previously setup fakes.

We then have to create a ControllerContext and pass the fake Http context, a route collection and a fake ControllerBase which the controller under test inherits off. We then assign the controller context to an instance of the controller class we are testing.

We can now finally call the method under test and assert the results.

I would obviously recommend you put the fake setup in a factory method if you have multiple tests you class to prevent duplication. You can obviously then add header, querystring, form method arguments if you want the context populated with that kind of information.

Hope this helps anyone in a similar situation and provides a point of reference for the Fake It Easy project.

   [1]: http://nancyfx.org
   [2]: http://xunit.codeplex.com/
   [3]: https://github.com/FakeItEasy/FakeItEasy
   [4]: https://github.com/NancyFx/Nancy/wiki/Testing-your-application
   [5]: https://jabbr.net/#/rooms/fakeiteasy

  
