+++

title = "NancyFX, RavenDB, NerdDinner and Me"
aliases = ["/2012/09/21/nancyfx-ravendb-nerddinner-and-me/"]
tags = ["community","dinner party","nancyfx","oss","ravendb","windows azure"]
+++

As I said in my [first post][1], NancyFX was my first port of call in my OSS adventure.  The reason I had come across it was by following [@squidge][2] and [@cranialstrain][3] on Twitter.  At the time they were talking about it quite a bit so I thought I’d take a look.  I was also keeping track of lots of people talking about [RavenDB][4].

### What is NancyFX?

From the official docs this explains NancyFX:

_Nancy is a lightweight, low-ceremony, framework for building HTTP based services on .Net and Mono. The goal of the framework is to stay out of the way as much as possible and provide a super-duper-happy-path to all interactions._

_This means that everything in Nancy is setup to have sensible defaults and conventions, instead of making you jump through hoops and go through configuration hell just to get up and running. With Nancy you can go from zero to website in a matter of minutes. Literally._

<!--more-->

When ASP.Net MVC was first introduced to the world I was hooked on the framework, it seemed so easy and logical in comparison to ASP.Net Webforms plus it had lots more [benefits][5].  NancyFX took these benefits and added lots more to them. For example creating a website was very easy:

	public class HelloModule : NancyModule
	{
	  public HelloModule()
	  {
	    Get["/"] = parameters => "Hello World";
	  }
	}

If you have experience using MVC and want to check out how Nancy compares check out [@jhovgaard][6] series of posts titled _“From ASP.Net MVC to Nancy”_ ([Part1][7], [2][8] &amp; [3][9])

### What is RavenDB

RavenDB is a transactional, open-source Document Database written in .NET. Data in RavenDB is stored schema-less as JSON documents, and can be queried efficiently using Linq queries from .NET code or using RESTful API using other tools.

What this means is that you no longer have to rely on a RDBMS as your backend data store for your .Net projects. RavenDB is part of a [NoSQL][10] movement that, in simple terms, stores key-value pairs and does not store data in relational tables. It is also very quick in data retrieval.

### Two birds, one stone

As with anything software related the best way to learn something is to write an application that uses that specific piece of technology. So I sent out a tweet something along the lines of _“I need to find a reason to use NancyFX and RavenDB”._Two minutes later I got a response from [@TheCodeJunkie][11], one of the lead developers of NancyFX saying he had wanted to port [NerdDinner][12] to use NancyFX but had not had the time and wondered if I would be interested in doing that and using RavenDB as the data store.  I instantly said yes.

This was my first jump into actually contributing to OSS and I was very excited and honoured.  I thought this was amazing, I thought I’d made it and believed this was going to change everything.  I went home and told my wife that my newest pet project was going to be this and she gave her usual supportive but ambiguous “that’s nice dear” type response.

I got stuck in by browsing the NerdDinner source code and began getting the Razor views working with Nancy. I started converting all the ASP.Net MVC controllers into Nancy Modules and then had an idea for Nancy.  A domain specific language (DSL).  Nancy uses various ways to capture querystring arguments, one of them being regex.  To cut a long story short I created [Nancy.Routehelpers][13] and put it on NuGet.  It was a way to define routes in the modules without the need for using Regex because lets be honest no-one *likes* using Regex!

It meant I could use this:

	public class HomeModule : NancyModule
	{
	  public HomeModule()
	  {
	    //Yay! Readable routes :)
	    Get[Route.Root().AnyIntAtLeastOnce("id")] = parameters =&gt;
	    {
	      return View["Index"];
	    };
	
	    //Boooo! Regex :(
	    Get["/(?[\d]%2B)"] = parameters =&gt;
	    {
	      return View["Index"];
	    };
	  }
	}

So now by helping out and learning stuff at the same time I was already contributing to the community with my own ideas, even though in the small league however, it was all very exciting!

As the logic started to wind up and I needed to put in the data store I was having teething trouble with Raven.  A quick tweet asking for help and [@philjones88][14] to the rescue.  As we were chatting we both realised we only live 40 miles apart! Small world but no matter how large, another great sign of the active community willing to help. I’ve gone on to chat to Phil numerous times and he’s been a huge help not just in RavenDB. I would highly recommend him for anyone needing any contract work as he is a true professional.

Luckily integrating RavenDB was fairly painless, if I did have any quick questions I would pester [@philjones88][14] or use RavenDB’s [Jabbr][15] room or use the official [RavenDB Google group][16]. The only two areas that stand out from memory that caused a few scratches of the head were indexing and clearing out documents of a certain age. The latter was needed due to the database being on a free account with [RavenHQ][17] as it had a database size limit of 15mb.  I’ll post the snippet here just in case anyone comes by and wants to  use it to delete all their documents from RavenDB:

	private void CleanUpDB(IDocumentSession DocSession)
	{
	    var configInfo = DocSession.Load("DinnerParty/Config");
	
	    if (configInfo == null)
	    {
	        configInfo = [new][18] Config();
	        configInfo.Id = "DinnerParty/Config";
	        configInfo.LastTruncateDate = DateTime.Now.AddHours(-48); //No need to delete data if config doesnt exist but setup ready for next time
	
	        DocSession.Store(configInfo);
	        DocSession.SaveChanges();
	
	        return;
	    }
	    else
	    {
	        if ((DateTime.Now - configInfo.LastTruncateDate).TotalHours < 24)
	            return;
	
	        configInfo.LastTruncateDate = DateTime.Now;
	        DocSession.SaveChanges();
	
	        //If database size > 15mb or 1000 documents delete documents older than a week
	
	#if DEBUG
	        var jsonData = RavenSessionProvider.DocumentStore.JsonRequestFactory.CreateHttpJsonRequest(null, "http://localhost:8080/database/size", "GET", RavenSessionProvider.DocumentStore.Credentials, RavenSessionProvider.DocumentStore.Conventions).ReadResponseJson();
	        
	#else
	        var jsonData = RavenSessionProvider.DocumentStore.JsonRequestFactory.CreateHttpJsonRequest(null, "https://1.ravenhq.com/databases/DinnerParty-DinnerPartyDB/database/size", "GET", RavenSessionProvider.DocumentStore.Credentials, RavenSessionProvider.DocumentStore.Conventions).ReadResponseJson();
	
	#endif
	        int dbSize = int.Parse(jsonData.SelectToken("DatabaseSize").ToString());
	        long docCount = RavenSessionProvider.DocumentStore.DatabaseCommands.GetStatistics().CountOfDocuments;
	
	       
	        if (docCount > 1000 || dbSize > 15000000) //its actually 14.3mb but goood enough
	        {
	
	            RavenSessionProvider.DocumentStore.DatabaseCommands.DeleteByIndex("Raven/DocumentsByEntityName",
	                new IndexQuery
	                {
	                    Query = DocSession.Advanced.LuceneQuery()
	                    .WhereEquals("Tag", "Dinners")
	                    .AndAlso()
	                    .WhereLessThan("LastModified", DateTime.Now.AddDays(-7)).ToString()
	                },
	                false);
	        }
	    }
	}

One neat feature of the indexes within RavenDB although initially a tad confusing is the ability to define them in C# so when your application starts you can make a call to **Raven.Client.Indexes.IndexCreation.CreateIndexes** and it will apply them to your database. Slightly cooler than a RDBMS way of creating an index.

### It’s all in the name

As development was winding up we needed to decide upon a name instead of NerdDinner. A couple of ideas were thrown about, FancyNancy, Party with Nancy, Dinner with Nancy, all pretty lame so [@TheCodeJunkie][19] came up with DinnerParty and that’s what we went with plus its a bit more sophisticated than NerdDinner ![;\)][20]

The next issue was having a logo for DinnerParty, a large feat for someone who has no design skills whatsoever. I appreciate good design but have no ability in that area, in fact I’m pretty sure a 3 year old has more skills than me. I went through various rubbish designs and it went back and forth in deliberation via Jabbr but in the end the decision was mine and we went what we have today. I apologise!

### Hosting

At the same time I was finishing development [Windows Azure][21] had made a big change to its offerings and were doing all sorts of cool things including free websites! This was another tech toy I could play with so I signed up for an account so I could host DinnerParty. It was all very shiny and fun however I had found a [bug][22]. It wouldn’t let me store a connection string to an external RavenDB database which was hosted at [RavenHQ][17]. Up went a forum post and a few back and forths and conversations on Twitter with [@davidebbo][23] and he managed to get it working!

One of the other cool features that Windows Azure was touting was “[Git Deploy][24]“, the ability to use Git to deploy the website. Essentially it allowed me to push my source code to Windows Azure and then it would build the code and publish the compiled project to the website. Absolutely brilliant! No more FTP-ing, no more Web Deploy projects, this was genius at work. However there were two steps involved to keep the Github repository and the live website up to date, i) Push changes to Github ii) Push changes to Azure. Not a major problem at all however, those eager beavers at Microsoft have managed to get this down to one step with improved [Continuous Deployment][25] so that when your changes are pushed to Github your Windows Azure account will pick this up, build the project and publish to your website. I highly recommend people check out the new Windows Azure offerings even if you just use the free websites as they offer a lot of cool functionality.

### Go Live!

The code was done, the database was wired up, source control was working, website hosting was in place and a deployment strategy configured. D-day! Excited and nervous at the same time I made DinnerParty live to the world. That moment when it might all go horribly wrong, people would look at the code and laugh or use the website and it would fail. Oh well, no going back now, my time to shine! Luckily it all went well, it was publicised on Jabbr and Twitter and people started to look at it and the odd person played with the website. In my excitement I approached [Oren Eini][26] (or Ayende Rahien as others may know him as) about some publicity about this new port of NerdDinner. Oren is the lead developer of RavenDB so I thought he may be interested. He was very open to the idea and offered to publicise it via a [blog post][27] which I thought was nice of him. I read his article a week before it was due to be published and he pointed out a few things which I took on-board and changed before the blog post went live. At that point I was slightly nervous due to the things he had spotted, what else were people going to find? The day came when it was published and apparently I had faired well in the review according to other people as he is known for speaking his mind.

I also got word of another [review ][28]from the guy who had helped design the NancyFX logo. He was looking at the way DinnerParty was using the per request/per RavenDB session architecture and offered an alternative approach if one was using service layers. DinnerParty only needed access to the RavenDB session in the modules so it didn’t take that approach.

In reviews of developers code their natural instinct is to go defensive however, after counting to ten and looking at both reviews there was room for improvements and room for discussion in DinnerParty. Its hard to sit back and do that when you spend a lot of time developing something of your own and a lot of people have the tendency to just ignore criticism but I feel this is one area that you can progress as a developer. Letting others look at your code and explain why another approach maybe better is one of the key ways you learn. You don’t have to agree with an alternative approach but it helps your perception if there is more than one way you can look at it rather than stick with the “my way or the highway” attitude.

### DinnerParty Impact

A few months have passed since DinnerParty went live and after the initial reviews and feeling of excitement what has happened? Well various large multi-national corporations approached me to go and work for them with a salary of $10m, a private jet, speedboat, holiday villas and unlimited Apple products. Not bad eh!?

Unfortunately my imagination took hold there. DinnerParty the website is still up and running at , the [Github repository][29] was moved under the NancyFX central repository and I think its become a minor port of call as a reference app for new users using NancyFX to look at, see [here][30] and [here][31]. I have also gained a lot of experience using RavenDB and NancyFX and that was my goal at the start of the project so I think I can feel happy about that.

Had I made it? No.  I wasn’t suddenly being pestered by lots of people offering me highly paid jobs but it felt good to have done something for the community and to be part of something for a while.  That I believe is the key to it all.  You’re giving something which makes you feel good but you are also apart of something with other people interested in the same thing as you and also hopefully making a difference that adds to the feeling of belonging and by rolling all of that into one defines the word ‘community’.

   [1]: http://blog.jonathanchannon.com/2012/09/17/ive-started-blogging-why/ (I’ve started blogging. Why?)
   [2]: http://twitter.com/squidge
   [3]: http://twitter.com/cranialstrain
   [4]: http://ravendb.net
   [5]: http://www.asp.net/mvc
   [6]: http://twitter.com/jhovgaard
   [7]: http://jhovgaard.net/from-aspnet-mvc-to-nancy-part-1
   [8]: http://jhovgaard.net/from-aspnet-mvc-to-nancy-part-2
   [9]: http://jhovgaard.net/from-aspnet-mvc-to-nancy-part-3
   [10]: http://en.wikipedia.org/wiki/NoSQL
   [11]: http://twitter.com/TheCodeJunkie
   [12]: http://nerddinner.com
   [13]: https://github.com/jchannon/Nancy.RouteHelpers
   [14]: http://twitter.com/@philjoness88
   [15]: http://jabbr.net/#/rooms/RavenDB
   [16]: https://groups.google.com/forum/?fromgroups#!forum/ravendb
   [17]: https://ravenhq.com/
   [19]: http://twitter.com/thecodejunkie
   [20]: https://blog.jonathanchannon.com/wp-includes/images/smilies/icon_wink.gif
   [21]: http://www.windowsazure.com
   [22]: http://social.msdn.microsoft.com/Forums/en-US/windowsazurewebsitespreview/thread/9ee30e74-7546-4c1e-ac8c-0235e1589920
   [23]: https://twitter.com/davidebbo
   [24]: http://www.windowsazure.com/en-us/develop/net/common-tasks/publishing-with-git/#Step5
   [25]: http://weblogs.asp.net/scottgu/archive/2012/09/17/announcing-great-improvements-to-windows-azure-web-sites.aspx
   [26]: http://ayende.com/blog
   [27]: http://ayende.com/blog/156609/reviewing-dinner-party-ndash-nerd-dinner-ported-to-ravendb-on-ravenhq
   [28]: http://www.dvloop.com/effective-ravendb-session-management/
   [29]: https://github.com/NancyFx/DinnerParty/
   [30]: http://stackoverflow.com/questions/11532523/nancy-framework-sample-application
   [31]: http://stackoverflow.com/a/11253466/84539
  
