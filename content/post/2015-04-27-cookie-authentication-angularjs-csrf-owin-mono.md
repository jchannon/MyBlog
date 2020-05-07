+++

title = "Cookie Authentication & CRSF with AngularJs, Owin & Mono"
tags = ["mono","owin",".net","angularjs","nancyfx","oss"]
+++
I'm currently working on a project that has [Nancy][1] serving up an API.  For the UI there is AngularJS.  We were using JWT for authentication just to get us up and running but then as things became more final in the product we knew it would be better to swap to cookies for security plus we may as well leverage the browser capabilities  for cookie handling. I'm not going to get into the arguments about JWT security vs cookie security, there are advantages/disadvantages for using both in this scenario.  Our API is built on top of OWIN and Microsoft provide cookie middleware so I thought this would be nice and simple to plug in.  Lets just remember I'm working on Mono!


In our Startup class I added the below

    app.UseCookieAuthentication(new CookieAuthenticationOptions
    {
        AuthenticationMode = AuthenticationMode.Active,
        CookieHttpOnly = true,
        CookieSecure = Microsoft.Owin.Security.Cookies.CookieSecureOption.SameAsRequest,
        SlidingExpiration = true,
        AuthenticationType = "MyCookie",
        CookieName = "MyCookie"
    });


Hopefully thats pretty self explanatory. So I fired up my application and BOOM!

<!--more-->

Could not load type 'Microsoft.Owin.Security.DataProtection.DpapiDataProtector' 


Turns out the default security for cookie auth doesn't work on Mono. **Fix** : Install [Owin.Security.AesDataProtectorProvider][2]

Now we add this to be the bottom of our OWIN middleware:


    app.UseAesDataProtectorProvider();


Fire up our app and bingo!

Now we need to handle logging in our user. As we are using OWIN we need to use Claims for our authenticated users. **Fix** Install [Nancy.MSOwinSecurity][3], this gives us Claims support inside Nancy (in v2 of Nancy the default authentication model will be using Claims, keep an eye out for release information). Below is our login code:

    public class HomeModule : NancyModule
    {
        public HomeModule()
        {
            Post["/login"] = _ =>
            {
                //probably best we validate the user here!!!
                
                var claims = new List<Claim>(new[]
                    {
                        new Claim(ClaimTypes.Email, "blah@blah.com"), 
                        new Claim(ClaimTypes.Name, "Mr Blah")
                    });

                this.Context.GetAuthenticationManager().SignIn(new ClaimsIdentity(claims, "MyCookie"));

                return Response.AsRedirect("/");
            };
        }
    }


What will happen here is as the request comes in it will fall through the cookie middleware, fall in to Nancy, we will login and as the request reverses back up the OWIN pipeline the cookie middleware will see there is someone logged in and return a cookie in the response.

Super duper!

One thing that authentication middleware tends to do however, is still allows requests through the pipeline even if there isn't a authenticated user. The reason being there may be other middleware that may be responsible for authenticating users in another manner.  We plan to add JWT back into our API so we would end up with:


    app.UseJwtBearerAuthentication(); 
    app.UseCookieAuthentication();


Our previous use of [JWT][4] would return a 401 before it dropped through to the next middleware so we needed to swap out Owin.StatelessAuth to the MS middleware above.  The problem now is we need some more middleware to protect our API after the request has dropped through the JWT and cookie middleware:


    public Task Invoke(IDictionary<string, object> environment)
    {
        if (!environment.ContainsKey("owin.RequestPath"))
        {
            throw new ApplicationException("Invalid OWIN request. Expected owin.RequestPath, but not present.");
        }
            

        if (!environment.ContainsKey(ServerUser) || environment[ServerUser] == null)
        {
            return AuthChallengeResponse(environment);
        }

        return nextFunc(environment);
    }

    private Task AuthChallengeResponse(IDictionary<string, object> environment)
    {
        environment["owin.ResponseStatusCode"] = 401;

        if (this.options != null && !string.IsNullOrWhiteSpace(this.options.WWWAuthenticateChallenge))
        {
            var wwwauthenticatechallenge = this.options.WWWAuthenticateChallenge;

            if (!environment.ContainsKey("owin.ResponseHeaders"))
            {
                environment.Add("owin.ResponseHeaders", new Dictionary<string, string[]>());
            }

            var responseHeaders = (IDictionary<string, string[]>)environment["owin.ResponseHeaders"];
            responseHeaders.Add("WWW-Authenticate", new[] { wwwauthenticatechallenge });
        }

        return Task.FromResult(0);
    }


Then we end up with:

    app.UseJwtBearerAuthentication(); 
    app.UseCookieAuthentication();
    app.CheckLoggedInUser();

So now we have it all working but what about [CRSF][5]?

Luckily Angular has some built in mechanisms to cater for CSRF and in its documentation is this:


>To take advantage of this, your server needs to set a token in a JavaScript readable session cookie called XSRF-TOKEN on first HTTP GET request. On subsequent non-GET requests the server 
>can verify that the cookie matches X-XSRF-TOKEN HTTP header, and therefore be sure that only JavaScript running on your domain could have read the token. The token must be unique for each 
>user and must be verifiable by the server (to prevent the JavaScript making up its own tokens). We recommend that the token is a digest of your site's authentication cookie with salt for 
>added security.


So now we need some middleware to create this `XSRF-TOKEN` cookie:

    public class XSRFCookieMiddleware
    {
        private readonly Func<IDictionary<string, object>, Task> nextFunc;

        public XSRFCookieMiddleware(Func<IDictionary<string, object>, Task> nextFunc)
        {
            this.nextFunc = nextFunc;
        }

        public  Task Invoke(IDictionary<string, object> env)
        {
            var context = new OwinContext(env);

            context.Response.OnSendingHeaders(_ =>
                {
                    if ((string)env["owin.RequestPath"] == "/login" && (string)env["owin.RequestMethod"] == "POST")
                    {
                        var responseHeaders = (IDictionary<string, string[]>)env["owin.ResponseHeaders"];
                        if (responseHeaders.ContainsKey("Set-Cookie"))
                        {
                            var setcookies = responseHeaders["Set-Cookie"].ToList();
                            var authcookie = setcookies.FirstOrDefault(x => x.StartsWith("VQCookie"));
                            if (authcookie != null)
                            {
                                var authcookieValue = authcookie.Split(new[]{ '=' }, StringSplitOptions.RemoveEmptyEntries)[1].Split(new [] { ';' })[0];
                                var csrfToken = new CsrfTokenHelper().GenerateCsrfTokenFromAuthToken(authcookieValue);
                                setcookies.Add("XSRF-TOKEN=" + csrfToken + ";path=/");
                                responseHeaders["Set-Cookie"] = setcookies.ToArray();
                            }
                        }
                    }
                    else if ((string)env["owin.RequestPath"] == "/api/authenticate/logout" && (string)env["owin.RequestMethod"] == "GET")
                    {
                        context.Response.Cookies.Append("XSRF-TOKEN", "DEAD", new CookieOptions{ Expires = DateTime.UtcNow.AddDays(-1) });
                    }
                }, null);

            return nextFunc(env);
        }

    }


Note the usage of `OnSendingHeaders`, this is required because when a response stream is first written to in an OWIN pipeline the headers are flushed and using this event from Microsoft they will be called when the response is returned.  I had previously written this middleware similar to the below beforehand but this approach could potentially have unwanted effects:


    public async Task Invoke(IDictionary<string, object> env)
    {
      await nextFunc(env);
      if ((string)env["owin.RequestPath"] == "/login" && (string)env["owin.RequestMethod"] == "POST")
      {
          //
      }
    }


One thing to note that cost me a few days is the ordering of these events.  Suffice to say there is no specification for this but HttpListener, Nowin & System.Web call these events via LIFO (Last In First Out) which means that our middleware needs to be above the `app.UseCookieAuthentication()` line so that our event gets called after the auth cookie has been set.

So now we return the `XSRF-TOKEN` cookie on login Angular will now detect this and then send the `X-XSRF-TOKEN` header on every request. We now need some middleware to obviously validate this:


    public class XSRFMiddleware
    {
        private readonly Func<IDictionary<string, object>, Task> nextFunc;

        public XSRFMiddleware(Func<IDictionary<string, object>, Task> nextFunc)
        {
            this.nextFunc = nextFunc;
        }

        public async Task Invoke(IDictionary<string, object> environment)
        {
            var owinContext = new OwinContext(environment);

            var requestHeaders = (IDictionary<string, string[]>)environment["owin.RequestHeaders"];

            if (owinContext.Request.Method == "GET")
            {
                await nextFunc(environment);
            }
            else if (requestHeaders.ContainsKey("Authorization") && !requestHeaders.ContainsKey("Cookie"))
            {
                await nextFunc(environment);
            }
            else
            {
                if (owinContext.Request.Cookies.Count() == 0)
                {
                    environment["owin.ResponseStatusCode"] = 401;
                    return;   
                }

                if (string.IsNullOrWhiteSpace(owinContext.Request.Cookies["MyCookie"]))
                {
                    environment["owin.ResponseStatusCode"] = 401;
                    return;
                }

                if (!requestHeaders.ContainsKey("X-XSRF-TOKEN"))
                {
                    environment["owin.ResponseStatusCode"] = 401;
                    return;
                }

                var authCookie = owinContext.Request.Cookies["MyCookie"];

                var csrfToken = requestHeaders["X-XSRF-TOKEN"].FirstOrDefault();

                var valid = new CsrfTokenHelper().DoesCsrfTokenMatchAuthToken(csrfToken, authCookie);

                if (!valid)
                {
                    environment["owin.ResponseStatusCode"] = 401;
                    return;
                }

                await nextFunc(environment);
            }
        }
    }


So now we have

    app.UseXSRFCookieMiddleware();  //Add XSRF-TOKEN cookie on login
    app.UseJwtBearerAuthentication(); 
    app.UseCookieAuthentication();
    app.UseXSRFMiddleware(); //Validate XSRF requests
    app.UseOwinUserVerifcation();  //Check server.User key is populated
    app.UseNancy();


One thing to note is the CsrfTokenHelper, below is the code:

    public class CsrfTokenHelper
    {
        const string ConstantSalt = "MYSALT";

        public string GenerateCsrfTokenFromAuthToken(string authToken)
        {
            return GenerateCookieFriendlyHash(authToken);
        }

        public bool DoesCsrfTokenMatchAuthToken(string csrfToken, string authToken)
        {
            return csrfToken == GenerateCookieFriendlyHash(authToken);
        }

        private static string GenerateCookieFriendlyHash(string authToken)
        {
            using (var sha = SHA256.Create())
            {
                var computedHash = sha.ComputeHash(Encoding.Unicode.GetBytes(authToken + ConstantSalt));
                var cookieFriendlyHash = UrlTokenEncode(computedHash);  //HttpServerUtility.UrlTokenEncode
                return cookieFriendlyHash;
            }
        }

        //Borrowed from Mono System.Web ;)
        private static string UrlTokenEncode(byte[] input)
        {
            if (input == null)
                throw new ArgumentNullException("input");
            if (input.Length < 1)
                return String.Empty;
            string base64 = Convert.ToBase64String(input);
            int retlen;
            if (base64 == null || (retlen = base64.Length) == 0)
                return String.Empty;

            // MS.NET implementation seems to process the base64
            // string before returning. It replaces the chars:
            //
            //  + with -
            //  / with _
            //
            // Then removes trailing ==, which may appear in the
            // base64 string, and replaces them with a single digit
            // that's the count of removed '=' characters (0 if none
            // were removed)
            int equalsCount = 0x30;
            while (retlen > 0 && base64[retlen - 1] == '=')
            {
                equalsCount++;
                retlen--;
            }
            char[] chars = new char[retlen + 1];
            chars[retlen] = (char)equalsCount;
            for (int i = 0; i < retlen; i++)
            {
                switch (base64[i])
                {
                    case '+':
                        chars[i] = '-';
                        break;

                    case '/':
                        chars[i] = '_';
                        break;

                    default:
                        chars[i] = base64[i];
                        break;
                }
            }
            return new string(chars);
        }
    }


You'll notice I had to pinch `UrlTokenEncode` from Github from System.Web! OSS FTW! I didn't want to take a dependency on System.Web just for one method!

Once I'd finally got this all sorted I wanted to write some tests to check all was working for example I was getting 2 cookies after logging in.

I was already using [Microsoft.Owin.Testing][6] and all seemed ok however I discovered I couldn't actually test for cookies as there was no handler to pass to the HttpClient that the TestServer returns.  Luckily in all situations OWIN related [@randompunter][8] always has another better option, this time called [OwinHttpMessageHandler][7]. This allowed me to test against cookies which the previous library didn't but then I spotted an issue on Windows. My test passed on Mono and failed on Windows, its usually the other way around.  This is where the ordering of the middleware and `OnSendingHeaders` played a big part.  Anyway after a bit of toing and froing we discovered a bug and it was fixed however, **beware** Microsoft.Owin.Testing also has this bug in that it uses FIFO(first in first out).  So MS hosts act in one way but their test library works the opposite!
 
Here's the test

    public class CookieTests
    {
        [Fact]
        public async Task Should_Have_2_Headers()
        {
            var app = GetAppBuilder();
            var handler = GetHandler(app);
            var client = CreateHttpClient(handler);

            var response = await client.PostAsync("http://localhost/login", new StringContent(""));

            var authCookie = handler
               .CookieContainer
               .GetCookies(new Uri("http://localhost"))["MyCookie"];

            var xsrfCookie = handler
                .CookieContainer
                .GetCookies(new Uri("http://localhost/login"))["XSRF-TOKEN"];

            //Then
            Assert.NotNull(authCookie);
            Assert.NotNull(xsrfCookie);
        }

        private AppBuilder GetAppBuilder()
        {
            var app = new AppBuilder();
            new Startup().Configuration(app);
            return app;
        }

        private OwinHttpMessageHandler GetHandler(AppBuilder builder)
        {
            return new OwinHttpMessageHandler(builder.Build())
            {
                UseCookies = true
            };
        }

        private HttpClient CreateHttpClient(OwinHttpMessageHandler handler)
        {
            var client = new HttpClient(handler)
            {
                BaseAddress = new Uri("http://example.com")
            };

            return client;
        }
    }


So after some lessons learnt and bugs fixed we have Cookie Authentication & CRSF with AngularJs, Owin & Mono.  After getting this all working it was pointed out to me that Kestrel, Microsoft's new cross platform web server behaves the opposite to HttpListener, Nowin & System.Web in its ordering of `OnSendingHeaders` Isn't this all fun!!

As you will see I mentioned having token and cookie middleware in the same app and that is my plan but again we have another long story and heads being bashed on the desk and that can be another blog post but the short answer is it should all work in Mono 4 from looking at the code but at the moment Microsoft's `app.UseJwtBearerAuthentication();` does not work properly on Mono at the time of writing.

I hope this blog post is helpful and prevents the pain I experienced with this but I guess on a positive note it was a learning experience!

One last thing, I can't take the credit for the token generation etc.  I had read a Stackoverflow post about how to do CSRF with Angular and came across [this][10], all I have done is make it work for OWIN.

Thanks to [@PinpointTownes][9] and [@randompunter][8] for helping me out and getting this all working in an OWIN app.


  [1]: http://nancyfx.org 
  [2]: https://www.nuget.org/packages/Owin.Security.AesDataProtectorProvider
  [3]: https://www.nuget.org/packages/Nancy.MSOwinSecurity/
  [4]: https://github.com/jchannon/Owin.StatelessAuth/
  [5]: http://en.wikipedia.org/wiki/Cross-site_request_forgery
  [6]: https://www.nuget.org/packages/Microsoft.Owin.Testing/
  [7]: http://www.nuget.org/packages/OwinHttpMessageHandler/
  [8]: http://twitter.com/randompunter
  [9]: https://twitter.com/PinpointTownes
  [10]: http://stackoverflow.com/questions/15574486/angular-against-asp-net-webapi-implement-csrf-on-the-server
