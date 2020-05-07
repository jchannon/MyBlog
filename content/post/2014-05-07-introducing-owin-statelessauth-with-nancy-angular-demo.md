+++

title = "Introducing Owin.StatelessAuth with Nancy/Angular demo"
tags = [".net","nancyfx","oss","owin","angularjs"]
+++
If you're writing an API, current thinking is to provide a token in the `Authorization` header for your app to validate when the request comes in.  I have used the [Nancy.Authentication.Stateless][1] package in the past for my APIs and even have a demo of it [here][2] if you're interested (there are more Nancy demos at [http://samples.nancyfx.org][3]). This is a great package and does a great job but what if one day you want to use [SignalR][4] v2 that uses [OWIN][5] and you want to validate not just requests to your Nancy app but also the SignalR requests?  You're going to need to validate requests as they come in before they get to SignalR or Nancy.

For those of you who are not quite up to date or unsure what OWIN is let me try and give you the tl:dr, no doubt others may say its something slightly different.  Imagine you are asked to create a ASP.Net MVC 3 app (ignore the fact that that person needs a slap) so you fire up Visual Studio and create the app.  So what has it done? Its created an app that runs on IIS and all requests come straight into your app.   

<!--more-->

###Enter OWIN

What OWIN introduces is an HTTP abstraction from the host to framework and therefore you have access to the whole request at any point. As an example, [here][6] is a node.js web server (replacing IIS) and then calling out to Nancy.  Pretty cool huh!  As HTTP is abstracted you can have two applications, one in Nancy and one in WebAPI in the same project and via OWIN you can tell it which requests go to Nancy and which go to WebAPI.

###Authentication

Due to the HTTP abstraction we can now inspect the requests and then determine whether we should return a 401 or let the request continue. So how does that look?

    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
             app
               .RequiresStatelessAuth(new MySecureTokenValidator())
               .MapSignalR() //This could be WebAPI etc
               .UseNancy();
        }
    }

In an OWIN app we need a Startup class to configure our application and we wire up the requests and how they may be handled in order of processing.  So as I stated earlier we want to use SignalR and Nancy and validate the requests before they hit our application, using [Owin.StatelessAuth][7] we can do that.  It takes an implementation of `ITokenValidator` where a method gets called to determine if the request is valid by passing in a token from the `Authorization` header.  How you implement the interface and determine what is a valid request is up to you.  Luckily I have a demo available in the [Github repository][8] which I'll now explain.

###Demo Time

About 2 days after publishing [Owin.StatelessAuth][8], Mike Hadlow published a great [blog post][9] on using JWT (JavaScript Web Tokens) & OWIN & Angular so I thought I would do a similar post just to throw my 2 cents in.  Its going to be hard not to say the same things as Mike so I may skip some stuff but it just means you should read his post too!  So lets get the code to do the talking...

**Startup.cs**

    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.RequiresStatelessAuth(
                  new MySecureTokenValidator(new ConfigProvider()), 
                  new StatelessAuthOptions() {IgnorePaths = new List<string>(new []{"/login","/content"})})
                .UseNancy();

        }
    }

So we pass in our implementation of ITokenValidator called MySecureTokenValidator and pass in some options to Owin.StatelessAuth which says if the paths contain the items in the list then Owin.StatelessAuth will not try and authenticate those requests.  In the demo we have javascript and images in the content folder so we don't want to authenticate those requests.  We also don't want to authenticate requests to the login path.  Why not? This is the route that will give us the token for all subsequent requests.

**Nancy Module**

    public HomeModule(IConfigProvider configProvider, IJwtWrapper jwtWrapper)
    {
        Get["/login"] = _ => View["Login"];
    
        Post["/login"] = _ =>
        {
            var user = this.Bind<UserCredentials>();
            
            //Verify user/pass
            if (user.User != "fred" && user.Password != "securepwd")
            {
                return 401;
            }
    
            var jwttoken = new JwtToken()
            {
                Issuer = "https://i.suer.com",
                Audience = "http://mycoolwebsite.com",
                Claims =
                    new List<Claim>(new[]
                    {
                        new Claim(ClaimTypes.Role, "Administrator"),
                        new Claim(ClaimTypes.Name, "Fred")
                    }),
                Expiry = DateTime.UtcNow.AddDays(7)
            };
            
            var token = jwtWrapper.Encode(jwttoken, configProvider.GetAppSetting("securekey"), JwtHashAlgorithm.HS256);
            return Negotiate.WithModel(token);
        };
    
        Get["/"] = _ => "Hello Secure World!";
    }
    
Here on the GET request to login we return a view where Angular wil be used.  On the POST request to login we Bind the posted values to a class called UserCredentials, we then need to validate these credentials (I assume yours will be better than mine) and then create a new instance of JwtToken which is just another class in our application which has properties that relate to the [JWT spec][10] and then we encode the object to return a token for our user using the [JWT][11] library (I have created a wrapper for it in the demo as they are static methods out of the box).  

**Angular View**

Here's the code:

    <!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml" ng-app="owinstatelessauthexample">
    <head>
        <meta charset="utf-8" />
        <title></title>
    </head>
    <body ng-controller="appCtrl">
        <h1>Login</h1>
        <form ng-submit="getToken()">
            <input type="text" name="user" ng-model="user" />
            <input type="password" name="password" ng-model="password" />
            <input type="submit" value="Login" />
        </form>
        <label>Status: {{loggedinstatus}}</label>
        <span>{{secureresponse}}</span>
        <button ng-click="getsecureresponse()">Get Secure Response</button>
    
        <script src="/content/localforage.js"></script>
        <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.16/angular.min.js"></script>
        <script src="/content/angular-localforage.js"></script>
        <script src="/Content/app.js"></script>
    </body>
    </html>
    
We have a form that will POST to our login route, a label to show our logged in status, a button to hit our route that should return "Hello Secure World"

**Angular Code**

    (function () {
        'use strict';
    
        var app = angular.module('owinstatelessauthexample', ['LocalForageModule'])
            .controller('appCtrl', ['$scope', '$localForage', '$http', function ($scope, $localForage, $http) {
                // Start fresh
                $localForage.clearAll();
    
                $scope.user = 'fred';
                $scope.password = 'securepwd';
                $scope.secureresponse = '';
                $scope.loggedinstatus = 'Not Logged In';
    
                $scope.getToken = function () {
                    $http({
                        method: 'POST',
                        url: '/login',
                        data: {
                            "user": $scope.user,
                            "password": $scope.password,
                        }
                    })
                        .success(function (data, status) {
                            console.log('All ok : ' + data);
                            $localForage.setItem('mysecuretoken', JSON.parse(data));
                            $scope.loggedinstatus = 'Logged In';
                        })
                        .error(function (data, status) {
                            console.log('Oops : ' + data);
                        });
    
                };
    
                $scope.getsecureresponse = function () {
                    $localForage.get('mysecuretoken').then(function (data) {
                        $http({
                            method: 'GET',
                            url: '/',
                            headers: { 'Authorization': data }
    
                        })
                       .success(function (data, status) {
                           console.log('All secure : ' + data);
                           $scope.secureresponse = data;
                       })
                       .error(function (data, status) {
                           console.log('Oops : ' + data);
                           $scope.secureresponse = "Oops!" + data;
                       });
                    });
    
                };
            }]);
    
    })();

When the form from our view is posted to our login route we get take the response data and store it in localStorage.  However, here we are using a library called [localForage][12] which has a fallback option if you don't have HTML5 in your browser.  When the user clicks the button to hit our secure route it will retrieve the token from localForage and pass it in the request and hopefully we get the expected response as Owin.StatelessAuth will validate it via MySecureTokenValidator.

**MySecureTokenValidator**

    public class MySecureTokenValidator : ITokenValidator
    {
        private readonly IConfigProvider configProvider;

        public MySecureTokenValidator(IConfigProvider configProvider)
        {
            this.configProvider = configProvider;
        }

        public ClaimsPrincipal ValidateUser(string token)
        {
            try
            {
                //Claims don't deserialize :(
                //var jwttoken = JsonWebToken.DecodeToObject<JwtToken>(token, configProvider.GetAppSetting("securekey"));
                
                var decodedtoken = JsonWebToken.DecodeToObject(token, configProvider.GetAppSetting("securekey")) as Dictionary<string, object>;

                var jwttoken = new JwtToken()
                {
                    Audience = (string)decodedtoken["Audience"],
                    Issuer = (string)decodedtoken["Issuer"],
                    Expiry = DateTime.Parse(decodedtoken["Expiry"].ToString()),
                };

                if (decodedtoken.ContainsKey("Claims"))
                {
                    var claims = new List<Claim>();

                    for (int i = 0; i < ((ArrayList)decodedtoken["Claims"]).Count; i++)
                    {
                        var type = ((Dictionary<string, object>)((ArrayList)decodedtoken["Claims"])[i])["Type"].ToString();
                        var value = ((Dictionary<string, object>)((ArrayList)decodedtoken["Claims"])[i])["Value"].ToString();
                        claims.Add(new Claim(type, value));
                    }

                    jwttoken.Claims = claims;
                }

                if (jwttoken.Expiry < DateTime.UtcNow)
                {
                    return null;
                }

                return new ClaimsPrincipal(new ClaimsIdentity(jwttoken.Claims, "Token"));
            }
            catch (SignatureVerificationException)
            {
                return null;
            }
        }
    }
    
My first comment in the code is that the class [Claim][13] won't deserialize which would have made our code a one liner but unfortunately not. Possibly if the JWT library used JSON.Net or ServiceStack.Text it may work but for now I had to do some logic to assign the properties of the JwtToken class.  It really is some ugly code so hopefully a PR or so to JWT it may be cleaned up.  So we decode the token to a dictionary and then assign the values to our class, loop over the claims, see if the expiry date is before now and if so return null which will cause Owin.StatelessAuth to return a 401.  If all is well we return a [ClaimsPrincipal][14] instance.  Owin.StatelessAuth will add it to the Owin environment which can be read further down the request stack.

**Nancy Bootstrapper**

    public class Bootstrapper : DefaultNancyBootstrapper
    {
        protected override void RequestStartup(TinyIoCContainer container, IPipelines pipelines, NancyContext context)
        {
            base.RequestStartup(container, pipelines, context);
            var owinEnvironment = context.GetOwinEnvironment();
            var user = owinEnvironment["server.User"] as ClaimsPrincipal;
            if (user != null)
            {
                context.CurrentUser = new DemoUserIdentity()
                {
                    UserName = user.Identity.Name,
                    Claims = user.Claims.Where(x => x.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role").Select(x => x.Value)
                };
            }
        }
    }
    
Nancy has a CurrentUser property on the NancyContext, if this is not null then we know the user is authenticated.  In the introduction of the blog post I mentioned Nancy.Authentication.Stateless (other Nancy.Authentication libraries are available) which does exactly that, it assigns the the CurrentUser to the validated user.  In our Bootstrapper we use the ClaimsPrincipal instance in the Owin environment that Owin.StatelessAuth put in there for us to assign the properties of `IUserIdentity` in Nancy to assign the current user.  We can then use `RequiresAuthentication` on our Nancy routes to secure routes based on extra security such as claim types.

###Conclusion
What we have now is a way using Owin.StatelessAuth to secure all incoming requests, the option to ignore some requests for authentication, a way for tokens to be issued, a way for them to be validated and the ability to assign Nancy's user to the user we validated using Owin.StatelessAuth.

I enjoyed writing Owin.StatelessAuth middleware component and the demo with it so please take a look, any constructive feedback welcomed along with pull requests :)

Finally just to prove this works, here's some pretty pictures:

**POST to generate a token**

![Post Get Token][15]

**GET with our token**

![Get Secure Request][16]

Enjoy!

  [1]: http://www.nuget.org/packages/Nancy.Authentication.Stateless/
  [2]: https://github.com/jchannon/Nancy.Demo.StatelessAuth
  [3]: http://samples.nancyfx.org/
  [4]: http://www.asp.net/signalr
  [5]: http://owin.org/
  [6]: https://github.com/bbaia/connect-owin-samples/tree/master/Samples.Nancy
  [7]: https://www.nuget.org/packages/Owin.StatelessAuth/
  [8]: https://github.com/jchannon/Owin.StatelessAuth
  [9]: http://mikehadlow.blogspot.co.uk/2014/04/json-web-tokens-owin-and-angularjs.html
  [10]: http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html
  [11]: https://www.nuget.org/packages/JWT/
  [12]: https://github.com/mozilla/localForage
  [13]: http://msdn.microsoft.com/en-us/library/system.identitymodel.claims.claim(v=vs.110).aspx
  [14]: http://msdn.microsoft.com/en-GB/library/system.security.claims.claimsprincipal.aspx
  [15]: https://i.imgur.com/FlI4NAi.png
  [16]: https://i.imgur.com/GeCP9IJ.png
