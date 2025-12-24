+++

title = "Introducing Negotiator  - a GoLang content negotiation library"
aliases = ["/2015/11/16/content-negotiation-golang/"]
tags = ["golang","oss","nancyfx"]
+++
In my continued experience learning GoLang I started looking at how to best use it when dealing with HTTP.  The idiomatic way to use GoLang and HTTP is to use the standard library which keeps things minimal but there are a few features missing.  The first thing is a router.  OOTB GoLang doesn't have a router and the majority seem to suggest using a package called Mux from Gorilla Toolkit, a set of libraries that aims to improve the standard library from Go.  After having a play with it I didn't really warm to it so spent some time looking into the alternatives (and there are plenty!) and eventually decided upon [Goji][1]

Once I had started using Goji I then wanted to handle content negotiation in my HTTP handler.  As I said earlier GoLang is minimal in its offerings OOTB and this is a good thing.  Just for the record there are a few frameworks out there if you want/need and all encompassing framework such as Martini, Revel and Echo.  These tend to bend the idioms  of GoLang a bit and even the author of Martini blogged on this fact due to feedback from the community that although its capabilities are great they aren't idiomatic Go.
<!--more-->
### Introducing Negotiator

After realising that Goji didn't have content negotiation seeing as its just a router (although there are Goji compatible middleware, which in turn are standard library compatible) I started playing on how to implement conneg.

My first attempt was a piece of middleware that allowed the request to go to Goji and then on the way back up it would interrogate the context for a model which the HTTP handler would have inserted, it would then interrogate the Accept header obviously and then write out the JSON/XML to the response.


    //***** HTTP Handler *****
```go
    func HelloWorldHTTPHandler(ctx web.C, w http.ResponseWriter, req *http.Request) {
        user := &User{"Joe","Bloggs"}

        ctx.Env["model"] = user
    }
```
    //*****First stab at content negotiation midleware *****
```go
    package conneg

    import (
    "encoding/json"
    "encoding/xml"
    "net/http"

    "github.com/zenazn/goji/web"
    )

    func Conneg(c *web.C, h http.Handler) http.Handler {
        fn := func(w http.ResponseWriter, r *http.Request) {

            h.ServeHTTP(w, r)

            accept := r.Header.Get("Accept")
            if model := c.Env["model"]; model != nil {

                switch accept {
                case "application/json":

                    w.Header().Set("Content-Type", "application/json")

                    js, err := json.Marshal(model)

                    if err != nil {
                        http.Error(w, err.Error(), http.StatusInternalServerError)
                        return
                    }
                    if statuscode := c.Env["statuscode"]; statuscode != nil {
                        w.WriteHeader(statuscode.(int))
                    }
                    w.Write(js)

                case "application/xml":
                    x, err := xml.MarshalIndent(model, "", "  ")
                    if err != nil {
                        http.Error(w, err.Error(), http.StatusInternalServerError)
                        return
                    }

                    w.Header().Set("Content-Type", "application/xml")
                    w.Write(x)
                }
            }

        }
        return http.HandlerFunc(fn)
    }
```

As you can see its pretty rudimentary but does the job but if I developed multiple web applications I would have to copy and paste this into every app that I wrote.  I would also have to add to the switch statement for every media type I wanted to handle.

I wanted to write a library that I could reference for every web application, separate out each response processor instead of having a switch statement, have the ability to write new response processors that conformed to an interface plus get more experience with Go and of course make it OSS.

To cut a long story short if you install a reference to `github.com/jchannon/negotiator` you can how have a HTTP handler like so:

```go
    func getUser(w http.ResponseWriter, req *http.Request) {
        user := &User{"Joe","Bloggs"}
        negotiator.Negotiate(w, req, user)
    }
```

This in my humble opinion keeps things pretty tidy.  If you want to extend the base functionality of JSON/XML handling you can implement this interface for your own response processor:

```go
    type ResponseProcessor interface {
    	CanProcess(mediaRange string) bool
    	Process(w http.ResponseWriter, model interface{})
    }
```

CanProcess is called when `negotiator` loops over the media types in the Accept header.  This loop is also ordered by the weighted value in the Accept header eg. `Accept: application/json,application/xml;q=0.8,text/plain;q=0.5`, some great work by [Phil Cleveland][2] who helped with writing `negotiator` (note: if there is no accept header or relevant response processor then `negotiator` will return a 406).  The response processor will return a boolean saying whether it can handle the current media type.  If it returns true then `Process` is called and it will then handle writing the body to the response in the format that is applicable to that response processor.

To add your new custom processor to `negotiator` simple pass it to the `New` method.

```go
    func customHandler(w http.ResponseWriter, req *http.Request) {
        user := &user{"Joe", "Bloggs"}
        textplainNegotiator := negotiator.New(&PlainTextResponseProcessor{})
        textplainNegotiator.Negotiate(w, req, user)
    }

    type PlainTextResponseProcessor struct {
    }

    func (*PlainTextResponseProcessor) CanProcess(mediaRange string) bool {
    	return strings.EqualFold(mediaRange, "text/plain")
    }

    func (*PlainTextResponseProcessor) Process(w http.ResponseWriter, model interface{}) {

    	w.Header().Set("Content-Type", "text/plain")

    	val := reflect.ValueOf(model).Elem()

    	for i := 0; i < val.NumField(); i++ {
    		valueField := val.Field(i).String()
    		typeField := val.Type().Field(i)

    		w.Write([]byte(typeField.Name + " : " + valueField + " "))
    	}

    }
```

This is a slightly contrived example but you can see what needs to be done to add your own response processor for it to be used by `negotiator`.  One thing I don't like about this is that you need to call `New` in every handler however, you may only want this processor in certain route handlers in your application.  Going back to my first example, what you could do is insert the pointer returned from calling `New` and insert it into the http context and then in the handlers pull it out and then call `Negotiate`.  You can see a demo of this in the Github repo [here][6]

Hopefully other Go developers will find this library useful but I'm happy with what I've done here and its allowed me to learn more Go and interact with the community.  I'm also pretty chuffed that its got 100% unit test coverage according to the built in golang tools.  I'm  very impressed with the receptiveness of the Go community and the amount of libraries and blog posts out there to learn from.  I've managed to pick up Go pretty easily and I'm really loving it.  Another big thanks to [Phil Cleveland][2], another .Net developer trying to pick up Go, for his help with `negotiator`.

For more information check out the [Github repository][4] and the `godoc` documentation [here][5]

Shout out to [NancyFX][3], my first love, for inspiring the design of the ResponseProcessor interface.

[1]: https://goji.io
[2]: https://twitter.com/pdoh00
[3]: http://nancyfx.org
[4]: http://github.com/jchannon/negotiator
[5]: https://godoc.org/github.com/jchannon/negotiator
[6]: https://github.com/jchannon/negotiator/blob/master/demo/main.go
