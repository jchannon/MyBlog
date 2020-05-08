+++

title = "Simple .Net Twitter,Google,Facebook Authentication"
aliases = ["/2012/10/25/simple-net-twittergooglefacebook-authentication/"]
tags = ["authentication","community","dinnerparty","nancyfx","oss","social","social authentication"]
+++

Logging into websites is no longer a matter of typing in your username and password and clicking the login button. If you already have an account with the main social networks you can log into a site using your credentials from that website saving you having to register your details *again*. This obviously makes things a bit easier as you don’t have to remember another password. (Although you should all be using a password manager such as [LastPass][1].)

## Current Social Login Providers

There are currently providers out there that allow you to use their services to integrate into your website to provide authentication via the social networks. The main two that I know of are [Janrain][2] and [DotNetOpenAuth][3]. I’ve not worked with DotNetOpenAuth but I have with Janrain when building [DinnerParty][4].

The process was reasonably easy but not as simple as it could be.

<!--more-->

### .Net Simple Social Authentication

I was made aware of an OSS project by [@philliphaydon][5] whilst keeping up to speed with the latest [NancyFX ][6]goings on in [Jabbr][7] that aims to provide a simple way of using social networks to log into a site.

It started out aimed at ASP.Net MVC but after a bit of arm bending from [@philliphaydon][5] it was refactored to be web framework agnostic so it could be used with [NancyFX ][6].

Being enthusiastic, I asked if any help was needed and I ended up making a simple demo website using [NancyFX][6]

## Code Examples

Let me see some code I hear you say so here we go:

**Bootstrapper:**

	public class Bootstrapper : DefaultNancyBootstrapper
	{
	    private const string TwitterConsumerKey = "Rb7qNNPUPsRSYkznFTbF6Q";
	    private const string TwitterConsumerSecret = "pP1jBdYOlmCzo08QFJjGIHY4YSyPdGLPO2m1q47hu9c";
	    private const string FacebookAppId = "159181340893340";
	    private const string FacebookAppSecret = "97c4e4d0fa548232cf8f9c68a7adcff9";
	    private const string GoogleConsumerKey = "587140099194.apps.googleusercontent.com";
	    private const string GoogleConsumerSecret = "npk1_gx-gqJmLiJRPFooxCEY";

       protected override void ApplicationStartup(TinyIoCContainer container, IPipelines pipelines)
       {
           RegisterAuthenticationProviders(container);

           base.ApplicationStartup(container, pipelines);

           CookieBasedSessions.Enable(pipelines);
       }

       private static void RegisterAuthenticationProviders(TinyIoCContainer container)
       {
           Condition.Requires(container).IsNotNull();

           var twitterProvider = new TwitterProvider(TwitterConsumerKey, TwitterConsumerSecret,
                                                     new Uri(
                                                         "http://localhost:6969/AuthenticateCallback?providerKey=Twitter"));

           var facebookProvider = new FacebookProvider(FacebookAppId, FacebookAppSecret,
                                                       new Uri(
                                                           "http://localhost:6969/AuthenticateCallback?providerKey=facebook"));

           var googleProvider = new GoogleProvider(GoogleConsumerKey, GoogleConsumerSecret,
                                                   new Uri(
                                                       "http://localhost:6969/AuthenticateCallback?providerKey=google"));

           var authenticationService = new AuthenticationService();
           authenticationService.AddProvider(twitterProvider);
           authenticationService.AddProvider(facebookProvider);
           authenticationService.AddProvider(googleProvider);

           container.Register(authenticationService);
       }
    }

**HomeModule**

	public class HomeModule : NancyModule
	{  
	   private const string SessionGuidKey = "GUIDKey";

       public HomeModule(IAuthenticationService authenticationService)
       {
           Get["/"] = parameters => View["login"];

           Get["/RedirectToAuthenticate/{providerKey}"] = parameters =>
                  {
                      Session[SessionGuidKey] = Guid.NewGuid();
                      Uri uri =
                          authenticationService.
                              RedirectToAuthenticationProvider(
                                  parameters.providerKey,
                                  Session[SessionGuidKey].ToString());
                      
                      return Response.AsRedirect(uri.AbsoluteUri);
                  };

           Get["/AuthenticateCallback"] = parameters =>
                  {
                      if (string.IsNullOrEmpty(Request.Query.providerKey))
                      {
                          throw new ArgumentNullException("providerKey");
                      }

                      // It's possible that a person might hit this resource directly, before any session value
                      // has been set. As such, we should just fake some state up, which will not match the
                      // CSRF check.
                      var existingState = (string)(Session[SessionGuidKey] ?? Guid.NewGuid().ToString());

                      var model = new AuthenticateCallbackViewModel();

                      var querystringParameters = new NameValueCollection();
                      foreach (var item in Request.Query)
                      {
                          querystringParameters.Add(item, Request.Query[item]);
                      }

                      try
                      {
                          model.AuthenticatedClient =
                              authenticationService.CheckCallback(Request.Query.providerKey,
                                                                  querystringParameters,
                                                                  existingState);
                      }
                      catch (Exception exception)
                      {
                          model.Exception = exception;
                      }

                      return View["AuthenticateCallback", model];
                  };
       }
    }

This should hopefully be pretty self explanatory as that is the aim of the game but I will go through it.

Firstly we need to setup our social network key and secret which was provided to us by registering an app at the relevant site. We then setup a IAuthenticationProvider class for Twitter, Google &amp; Facebook with the key, secret and callback URL that the social network will make request to after login. We then register our providers with a IAuthenticationService class.

We then setup our IOC container to use authenticationService so that when our modules like Home take a dependency of IAuthenticationService it will use that.

Our root route provides a login page with hyperlinks to the RedirectToAuthenticate route. For example, using Twitter it will be **_http://mydomain.com/RedirectToAuthenticate/Twitter_**.

We create an item in our session so that it can be retrieved later when [Twitter][9] calls the callback URL. This is so we can validate(if needs be) that its a valid request and not some cheeky hacker. We then use the IAuthenticationService to redirect to the social network login page based on the value of providerKey argument. This could also be Facebook or Google.

The user is redirected to [Twitter][9] and logs in and then gets directed back to our website.

Our AuthenticateCallback route then creates a NameValueCollection from the querystring parameters and passes the providerKey (Twitter,Facebook,Google), NameValueCollection and Session value to the IAuthenticationService to validate all is ok.

If so it creates a view model and passes it to the view and in this example shows us the logged in user’s details.

I think that was pretty simple.

## I want to play

The source code is over at [Github][10] and is written by Pure.Krome or [Lara Eagle][11] if you prefer (same person). It’s also available on [Nuget][12]. Its name you ask? World-Domination.Web.Authentication

   [1]: http://www.lastpass.com
   [2]: http://janrain.com
   [3]: http://www.dotnetopenauth.net/
   [4]: http://blog.jonathanchannon.com/2012/09/21/nancyfx-ravendb-nerddinner-and-me/
   [5]: http://twitter.com/philliphaydon
   [6]: http://nancyfx.org/
   [7]: http://jabbr.net
   [9]: http://twitter.com
   [10]: https://github.com/PureKrome/World-Domination.Web.Authentication
   [11]: https://twitter.com/lara_eagle
   [12]: http://nuget.org/packages/World-Domination.Web.Authentication
  
