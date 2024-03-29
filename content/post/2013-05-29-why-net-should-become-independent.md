+++

title = "Why .Net should become independent!"
aliases = ["/2013/05/29/why-net-should-become-independent/"]
tags = [".net","csharp","career","community","oss"]
+++

I recently changed jobs and as usual was at the mercy of recruitment agents. The advert for my job contained things like ASP.Net MVC, Entity Framework &amp; TFS (luckily there were other cool pieces of technology on that list and what the role entailed interested me and once I had joined the company I saw they were open to other tech/approaches that made people’s workflow and output more beneficial to developers as well as the company. In fact I implemented an API written in [Nancy][1] on my first day and paved the way for Git in the first week).

My point being that whenever I hear from recruiters or look for jobs all the adverts basically list the full Microsoft stack. I recently heard from a friend who runs his own company that he gave his CV to a recruitment agent and was basically rejected because his .Net experience was not MS based enough. I know his .Net skills are very good but because those .Net skills were put to good use using OSS projects he is unlikely to get a job in the mainstream .Net market.

These adverts usually contain a list of tech/experience similar to: MVC, Webforms, Visual Studio, SQL Server, Entity Framework, WCF, LINQ.

**Q:** What’s the common denominator here?  
**A:** They are all owned by Microsoft.

**Q:** What operating system do these all run on?  
**A:** Microsoft Windows

**Q:** What framework and programming language do they run on?  
**A:** Microsoft .Net and C#

Spot a pattern?

So lets point out the obvious, the operating system, the frameworks, the language, the tooling and the data storage are all owned and implemented by one company (and they say Apple tries to lock its users in).

<!--more-->

There is a vicious circle here, MS provide the full stack and companies feel comfortable with this as MS are a large company and therefore must be reliable. They also believe they have someone to shout at or sue if things go wrong and someone to call for support if they get stuck. Remind me what is the direct phone number to speak to someone about the issue I’m having with my LINQ statement or asynchronous method? You don’t have one you use Stackoverflow? Intersting. The circles continues as developers learn this stack to get jobs and recruiters are instructed to find people that list the MS items on their CV.

This circle only happens in .Net. Lets look at other frameworks and tools for another language that implement similar things in the tech list that companies are looking for.

* **Operating System** : Linux
* **Framework**: node.js
* **Web Framework** : express.js
* **Language** : JavaScript
* **Tooling** : Sublime Text or WebStorm or Notepad++or [insert many others]
* **Data Storage** : PostgreSQL
* **ORM**: node-postgres
* **LINQ** : linq.js
* **Web Services** : restify

Spot a pattern?

They are all completely independent from each other and there are more than one option for each that are more than acceptable. Acceptable being the keyword. If I write the same list for alternative frameworks/libraries/tooling for .Net this is what you end up with but the question is are they acceptable to the majority of companies?

* **Operating System** : Linux
* **Web Framework** : Nancy
* **Tooling**: Xamarin
* **Data Storage**: PostgreSQL
* **ORM**: Simple.Data
* **Web Services**: Service Stack

I’m not saying companies have to chuck out Windows and Visual Studio (from my own experience Visual Studio is better than Xamarin) but at least be aware of them, the same goes for developers. These alternative frameworks and libraries may offer something a lot better than what MS give you but if you don’t look you won’t know.

One of the issues is getting companies/developers to look. People have said to me in the past that why should I bother learning ‘X’ if I can’t get a job in it or whatever the majority of developers use I will stick with that. I can understand where they are coming from because if companies only want to employ people that use libraries that are MS owned there is no incentive for them even if they offer better performance or solutions. These kind of attitudes of are in turn effecting community events in that the talks are often MS based and those in the community that put forward talks on alternative approaches are not getting enough votes to make the cut because people want to learn the MS stuff as they feel it will keep them secure in their jobs.

The only solution of breaking the vicious circle is for companies to change their attitudes in terms of tooling, frameworks and libraries that they use. Microsoft recently made a change to their [OSS page][2] which now lists alternative web frameworks on the .Net framework which is great and thanks to Scott Hanselman for doing this. This helps educate those developers/companies that are MS facing because now they have a bit more exposure to alternative/better libraries. In turn this may hopefully help companies realise that there are alternative libraries that are not one man bands and likely to disappear overnight and do offer better ways of providing solutions to their problems.

This is the answer to why .Net should become independent. You are not tied to one company for all your resources. You can adopt many other libraries and tools better than MS provided ones and allow the frameworks, tooling, libraries and community to become more feature rich with alternatives. The more ideas/projects out there which are used will inspire more projects which may provide better solutions. I can already here people saying “that’s crazy, at least if we follow MS we only have one thing to learn”. My response “Are you sheep, can you not make your own mind up?”. Take a look at some of the alternatives and see if you like it and see if it solves a problem, if it doesn’t fair enough but at least you looked and tried. I believe its a developer’s responsibility to push for “change”, to open eyes and widen opinions on the non-MS stuff although there is a balancing act to use all the new shiny stuff as you don’t want to get burnt but need to use new libraries otherwise you will never know. This is part of continual learning and progress and writing spikes to see if things fit. I’m not saying that if you go off and write your own library it will automatically get main stream adoption because there can only be a handful of great libraries trying to solve the same problem but if they exist and there is no restriction for you as a developer/company you may actually gain by looking elsewhere.

As a open minded developer and not a MS facing developer I have found myself having to learn the technologies on the list of what recruiters want as well as learn other libraries that interest me and provide better solutions. This is the way of the alternative .Net developer but its a pain the ass. If recruiters started advertising experience for Nancy, Simple.Data and ServiceStack it would make our lives easier! Will the attitude change I speak of happen overnight? Probably not, its been going on for years. Should I wait for the culture change or move languages? You would think that I should change language if I’m not happy with the culture of the MS stack but I enjoy C# and .Net and I enjoy using the OSS projects out there, its just when looking for jobs I need to find a company that is willing to look at new libraries and not just Microsoft’s approach. This is very hard to do unless you are in London. Companies there have changed their attitudes and are more open to using alternative libraries and do advertise for people with experience in the alternative libraries but for the rest of the UK they mostly remain MS orientated.

Here comes the spanner in the works, the available jobs for Python, JVM languages or node.js are virtually non-existent so whilst as much as I bitch and moan that companies should look at MS alternatives I pretty much have to deal with it because the majority of jobs are for .Net with a MS stack. I could go the way of my friend mentioned earlier and work for myself writing software in using the tech/tooling I want but what if I run out of contracts and need to get back into the job market? I will face the same issue as he did.

There is no perfect job out there regardless of tech/tools used (if you say you have it then you are either a liar or very very lucky) which is something I have recently accepted but if the majority of jobs are on the MS stack and there are great alternative .Net projects waiting to be discovered can we please ask our companies to open their eyes and take a look at what else might be out there.

   [1]: http://nancyfx.org/
   [2]: http://www.asp.net/mvc/open-source
  
