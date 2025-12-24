+++

title = "NancyFX and Hypermedia"
aliases = ["/2015/08/07/hypermedia-and-nancyfx/"]
tags = ["REST",".net","hypermedia","nancyfx","oss"]
+++
I've been slowly educating my self on hypermedia; what it is, how does it help and how to use it.  I must say I've found it a very interesting topic and I thought it was time I put some information into a blog post just in case the 2 people that read this blog might find it useful.

In my day job I'm responsible for a HTTP API (notice I didn't use REST) and some months ago I spoke to Glenn Block around a general discussion about hypermedia.  Glenn put this on YouTube if you want to watch it.

<iframe width="560" height="315" src="https://www.youtube.com/embed/G4YeQMIdO6Q" frameborder="0" allowfullscreen></iframe>

<!--more-->


At the time I was deliberating whether our API should return payloads that adhere to a hypermedia type but from what I could tell its quite hard if you are the client consuming these payloads.  For example, if you have an Angular SPA, you need code to traverse the links that the server returns.  What happens if the user bookmarks a page and then comes back to it at a later date? The app will need to go back to the entry point of the API then traverse. What happens if the user presses the refresh button in the browser? Again more traversal.  My conclusions were that there is very little tooling and libraries to allow web applications to be hypermedia clients.  This was October 2014 and at the time of writing, August 2015 I think there have been some improvements but not a great deal.

After my chat with Glenn, he was using a hypermedia type called [Collection+Json][1] and he wondered if I'd be interested in writing support for it for a [Nancy][3] application.  I obliged as I wanted to learn more about hypermedia and Nancy now has a library you can use for Collection+Json if you choose to use that hypermedia type.  You can find this on nuget [here][4].

In simple terms you may have a module such as:

```csharp 
    public class OrderModule : NancyModule
    {
      public OrderModule(IOrderRepository orderRepo) : base("/orders")
      {
        Get["/"] = _ =>
        {
          var orders = orderRepo.GetOrders();
          return orders;
        };
      }
    }
```

When you send in a request with `Accept : application/json` you will get a JSON representation of an array of orders

```json    
    [
    	{
    		"id" : 1,
    		"status":"Complete",
    		"itemcount":3
    	},
    	{
    		"id" : 2,
    		"status":"Pending",
    		"itemcount":1
    	}
    ]
 ```   

However if you send in a request `Accept : application/vnd.collection+json` you will get a Collection+Json representation
```json
    {
        "version": "1.0",
        "href": "http://localhost:9200/orders/",
        "links": [
            {
                "rel": "Feed",
                "href": "http://localhost:9200/orders/rss"
            }
        ],
        "items": [
            {
                "href": "http://localhost:9200/orders/1",
                "data": [
                    {
                        "name": "id",
                        "value": "1",
                        "prompt": "Id"
                    },
                    {
                        "name": "itemcount",
                        "value": "3",
                        "prompt": "Item Count"
                    },
                    {
                        "name": "status",
                        "value": "complete",
                        "prompt": "Status"
                    }
                ],
                "links": [
                    {
                        "rel": "items",
                        "href": "http://localhost:9200/orders/1/items",
                        "prompt": "Items"
                    }
                ]
            },
            {
                "href": "http://localhost:9200/orders/2",
                "data": [
                    {
                        "name": "id",
                        "value": "2",
                        "prompt": "Id"
                    },
                    {
                        "name": "itemcount",
                        "value": "1",
                        "prompt": "Item Count"
                    },
                    {
                        "name": "status",
                        "value": "pending",
                        "prompt": "Status"
                    }
                ],
                "links": [
                    {
                        "rel": "items",
                        "href": "http://localhost:9200/orders/2/items",
                        "prompt": "Items"
                    }
                ]
            }
        ],
        "queries": [
            {
                "rel": "search",
                "href": "http://localhost:9200/orders/search",
                "prompt": "Search",
                "data": [
                    {
                        "name": "name",
                        "prompt": "Value to match against the order number"
                    }
                ]
            }
        ],
        "template": {
            "data": [
                {
                    "name": "productcode",
                    "prompt": "Product Code"
                },
                {
                    "name": "quantity",
                    "prompt": "Quantity"
                }
            ]
        }
    }
```


How this works is by content negotiation. As with most things, Nancy makes this very simple.  In Nancy.Collection+Json I wrote a `ResponseProcessor` that handles Accept headers for Collection+Json and then finds a "writer" responsible for the entity being requested, which writes all the JSON properties seen above and then this is returned in the response.  The code and demo can be found [here][6] and more documentation is available [here][5].

After some months had passed I saw [Mike Amundsen][7] had done a talk at NDC Oslo 2015 about building clients that consume hypermedia payloads.  This spiked my interest again in hypermedia and I thoroughly recommend you give it a watch.

<iframe src="https://player.vimeo.com/video/131642790" width="500" height="281" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>


Leading on from this video I realised some of the differences between hypermedia types were how they enabled clients to perform.  For example, with [HAL][8] this hypermedia type will return links about the resource you requested but it won't directly tell how you to add an order to the system in its payload, you have to follow a link to find out that information.  Collection+Json does give you that information as a `template` and so does [Siren][9] in its `action`.

It was at this point I thought I'd write another Nancy library that would allow you to return Siren payloads which you can check out [here][10].  This works in a similar way as the Nancy.Collection+Json library, in that you as the programmer create a "writer" class that forms the Siren response for a specific resource.  Check out the demo [here][11].

At around the same time I also listened to a podcast that Mike was on which discussed REST, hypermedia and clients.  I would strongly recommend you listen to this.  I'd come to a lot of conclusions and had thoughts about REST and hypermedia and they were all validated in this podcast so [check it out][12].

One thing the podcast did touch on is browsers as clients and the complexities involved when they consume hypermedia.  I think this area is in need of huge improvement regarding tooling and libraries and I know Mike is working on a [book][16] which may help that but I think we need more people talking about this and people hacking on it to try and make it "a thing".  Tomorrow, Aug 8th 2015, [Darrel Miller][13] is about to do a keynote at DDD Melbourne titled "Consuming REST APIs, for all interpretations of REST" which will be something that illustrates how we can write client apps that consumer hypermedia APIs and gets that information out there.  Without this information we have the potential of making hypermedia a tool that only serves the purpose of machine to machine communication and I'm not sure we want that if we can use it to make our client applications easier to maintain whether they be browsers, desktop apps or mobile apps.  

So in conclusion I recommend you go learn a bit more about REST and hypermedia if it interests you, watch the videos and listen to the podcast.  Then have a play with returning hypermedia payloads with your Nancy app and then trying to consume them.

One thing I will briefly touch on is when deciding upon the hypermedia type I think you need to discuss this with your consumers.  Its very easy to write an API and say "we are going to return X" but if you're not the client developer that has to handle that then you haven't made an informed decision.  You should try and make it as easy as possible for your consumers.  Discuss the types that they find easiest to use.  You as the API developer should try writing a client that consumes the content and realise the difficulties involved which may help you make a more rounded decision on what hypermedia type to return from your API.  Now this is assuming you only decide to return one hypermedia type from your API, of course if you wanted to go purist then you would return all the major hypermedia types from your API and all your clients would be happy but that's probably not reality.

A quick shout out to [Dan Barua][14] who has written Nancy.HAL, a ResponseProcessor that allows your Nancy API to return HAL payloads.  Check this library out [here][15]. Great work Dan!

So in summary if you're using Nancy and want to return hypermedia payloads we have you covered:

 - [Nancy.Hal][15]
 - [Nancy.Collection+Json][6]
 - [Nancy.Siren][10]

Finally a big thank you to Glenn Block and Darrel Miller on answering all my API and hypermedia questions over the last year, you've been a great help.  If I now have any questions on API and hypermedia I bring out the big guns and call "Glenn Miller". I really need to get their phone numbers so I can have this ringtone. (For all you youngsters who have no idea who Glenn Miller is, Google it!)

<iframe width="560" height="315" src="https://www.youtube.com/embed/xPXwkWVEIIw?list=PLc9JoCRiZqs2us9wpl46_eKGO3_AkaIE-" frameborder="0" allowfullscreen></iframe>

  [0]: http://martinfowler.com/articles/richardsonMaturityModel.html
  [1]: http://amundsen.com/media-types/collection/
  [3]: http://nancyfx.org
  [4]: http://www.nuget.org/packages/Nancy.CollectionJson/
  [5]: https://github.com/WebApiContrib/CollectionJson.Net#returning-a-read-document-from-a-server
  [6]: https://github.com/jchannon/Nancy.CollectionJson
  [7]: https://twitter.com/mamund
  [8]: http://stateless.co/hal_specification.html
  [9]: https://github.com/kevinswiber/siren
  [10]: https://github.com/jchannon/Nancy.Siren
  [11]: https://github.com/jchannon/Nancy.Siren/tree/master/src/Nancy.Siren.Demo
  [12]: https://t.co/V9NoBlWLOc
  [13]: https://twitter.com/darrel_miller
  [14]: https://twitter.com/danbarua
  [15]: https://github.com/danbarua/Nancy.Hal
  [16]: https://twitter.com/LCHBook
