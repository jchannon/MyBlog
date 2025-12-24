+++

title = "Using Azure AD authentication for a Go API"
tags = ["golang","authentication","auth","golang"]
+++
So after a long time I thought I'd take another look at Go and whilst struggling to think what little app should I write to get back in the saddle with, the legend that is [Christos Matskas](https://twitter.com/christosmatskas) mentioned he wanted to try using a Go api against Azure AD for authentication. So I fired up [GoLand](https://www.jetbrains.com/go/) and got to work writing an API.

## Setting up Azure AD

1. You will need to create an Azure Directory in your account which is pretty straightforward. The only user in the directory will be you. 
2. Inside the directory you will then need to register an application, again pretty straightforward. 
3. Next under Certificates & Secrets, you will need to create a secret, this will be used as part of the auth handshake. Give it a name and Azure will create the value. Take a copy of it ready for your API
4. On the Overview page take a copy of the Application (client) ID
5. On the Overview page take a copy of the Directory (tenant) ID
6. Go to Expose An API
7. Click Add a scope
8. Create something like "allow_user" and choose Admins and users
9. Go to API Permissions and click Add a Permission
10. Select My APIs and select your application/API
11. Tick the scope you just created
12. Now here's a weird thing, if you don't see your scope, try going to another tab in your browser or refresh you Azure Portal page. Something is broken IMO in that it takes time or needs refreshing for it to show up
13. Click Manifest on the left hand side
14. Change `accessTokenAcceptedVersion` to `2` and click Save

<!--more-->

## Setting up your API

1. Create a docker hub account and repo, you will be pushing your Go API app to this account. Azure cannot run Go binaries as a web app strangely so you have to deploy to docker and get the web app to look there.
2. Build your API, more on that later
3. `docker build` and `docker push` to your new docker hub account

## Setting up Azure App Service

1. In Azure, go to App Services
2. Click Create
3. Choose your subscription
4. Choose Docker container
5. Choose Linux
6. Choose a unique URL for your app
7. Click Next for Docker
8. Select Docker Hub from the dropdown
9. Enter in the image and tag that you pushed to Dockerhub
10. Click Review & Create

## Setting up Redirect URIs

1. Back in Azure Directory...
2. Click Authentication on the left
3. Under Redirect URIs add the url you chose above with the route that AD will call back into with the auth code and state that will be swapped to create a JWT.
4. NOTE: If you want to test your app locally before pushing to Docker, enter in the localhost address you are using



So now you should be good to go, but I'm guessing you want to see some code? If you just want to take a look on GitHub the code is [here](https://github.com/jchannon/AzureSecuredAPIWithOT)

So I've defined some routes in the app:

```go
http.HandleFunc("/", HandleMain)
http.HandleFunc("/login-ms", HandleMicrosoftLogin)
http.HandleFunc("/callback-ms", CallBackFromMicrosoft)
http.HandleFunc("/protected-ms", middleware(ProtectedRoute))
http.HandleFunc("/logout-ms", LogoutRoute)
```

The first route shows a page that allows you to click a link to /login-ms, here it will use your clientid, secret and tenant from earlier to create a URL to MS that will log you in and validate the app who's trying to log in for users and the if all is well you can enter your MS username and password so it redirects back to your app as defined in /callback-ms and what you defined as the RedirectURI in Azure.

```go
func handleLogin(w http.ResponseWriter, r *http.Request, oauthConf *oauth2.Config, oauthStateString string) {
	URL, err := url.Parse(oauthConf.Endpoint.AuthURL)
	if err != nil {
		logger.Log.Error("Parse: " + err.Error())
	}
	logger.Log.Info(URL.String())
	parameters := url.Values{}
	parameters.Add("client_id", oauthConf.ClientID)
	parameters.Add("scope", strings.Join(oauthConf.Scopes, " "))
	parameters.Add("redirect_uri", oauthConf.RedirectURL)
	parameters.Add("response_type", "code")
	parameters.Add("state", oauthStateString)
	URL.RawQuery = parameters.Encode()
	url := URL.String()
	logger.Log.Info(url)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}
```

If you are logged in you will be redirected to the app and you will want to generate a JWT for further usage in your app so areas of your app are secure.

```go
func CallBackFromMicrosoft(w http.ResponseWriter, r *http.Request) {
	logger.Log.Info("Callback-ms..")

	state := r.FormValue("state")
	logger.Log.Info(state)
	if state != oauthStateStringMs {
		logger.Log.Info("invalid oauth state, expected " + oauthStateStringMs + ", got " + state + "\n")
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	code := r.FormValue("code")
	logger.Log.Info(code)

	if code == "" {
		logger.Log.Warn("Code not found..")
		w.Write([]byte("Code Not Found to provide AccessToken..\n"))
		reason := r.FormValue("error_reason")
		if reason == "user_denied" {
			w.Write([]byte("User has denied Permission.."))
		}
		// User has denied access..
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
	} else {

		token, err := oauthConfMs.Exchange(oauth2.NoContext, code)
		if err != nil {
			logger.Log.Error("oauthConfMs.Exchange() failed with " + err.Error() + "\n")
			return
		}
		logger.Log.Info("TOKEN>> AccessToken>> " + token.AccessToken)
		logger.Log.Info("TOKEN>> Expiration Time>> " + token.Expiry.String())
		logger.Log.Info("TOKEN>> RefreshToken>> " + token.RefreshToken)

		http.SetCookie(w, &http.Cookie{
			Name:     "access_token",
			Value:    token.AccessToken,
			Expires:  time.Now().Add(time.Hour * 24),
			HttpOnly: false,
		})

		tokenjson, err := json.Marshal(token)
		if err != nil {
			logger.Log.Error("Error in Marshalling the token")
		}

		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(pages.CallBackHeaderPage))
		w.Write(tokenjson)
		w.Write([]byte(pages.CallBackFooterPage))

	}
```

Just for demo purposes here, I store the created JWT in a cookie so that when you make a request to /protected-ms the browser will pass the cookie across and we can read it out and take the token out and validate it.

```go
func middleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		_, err := verifyToken(r)

		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(pages.UnAuthorizedPage))
			return
		}

		next(w, r)
	}
}

func extractToken(r *http.Request) string {
	accessCookie, err := r.Cookie("access_token")
	if err != nil {
		return ""
	}

	bearToken := accessCookie.Value

	return bearToken
}

func verifyToken(r *http.Request) (*jwt.Token, error) {
	tokenString := extractToken(r)

	keySet, err := jwk.Fetch(r.Context(), "https://login.microsoftonline.com/common/discovery/v2.0/keys")

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if token.Method.Alg() != jwa.RS256.String() {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}
		kid, ok := token.Header["kid"].(string)
		if !ok {
			return nil, fmt.Errorf("kid header not found")
		}

		keys, ok := keySet.LookupKeyID(kid)
		if !ok {
			return nil, fmt.Errorf("key %v not found", kid)
		}

		publickey := &rsa.PublicKey{}
		err = keys.Raw(publickey)
		if err != nil {
			return nil, fmt.Errorf("could not parse pubkey")
		}

		return publickey, nil
	})

	if err != nil {
		return nil, err
	}

	return token, nil
}

```

So we have a middleware fun that wraps the route to get to the protected page, if the middleware succeeds you will get access to the next handler and see the secure content otherwise you will get a 401.

Azure uses RSA256 JWT signing so we need to get the public key it uses to sign the JWT and pass it into the validation.  If you do not follow my steps in creating the permissions, you can still get this far and a JWT is issued for MS Graph however validation will fail and it will not give you any idea why, it is all in the configuration of AzureAD that allows you to get here. 

The code here is using a lib to get a list of keys that AzureAD uses and using the `kid` JWT header to match it up so it knows which public key it should use. When the `jwt.Parse` is executed it will use the key to validate the token as well as things like issuer and expiry date and let you continue in the app.

Hopefully this helps someone and is of interest, it nearly drove me mad trying to get this to work but glad I did in the end.
