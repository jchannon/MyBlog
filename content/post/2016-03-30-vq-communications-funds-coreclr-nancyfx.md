+++

title = "VQ Communications Funds NancyFX to run on CoreCLR"
aliases = ["/2016/03/30/vq-communications-funds-coreclr-nancyfx/"]
tags = ["community",".net","nancyfx","oss","coreclr"]
+++

Nearly 2 years ago I was employed by [VQ Communications][1] primarily because of my open source contributions to [NancyFX][2].  They had started work on a v2 of their flagship product and had begun work with Nancy and needed someone to help drive a HTTP API and architect a scaling solution as their v2 product was addressing a requirement they had for it cope with large volumes of traffic.  Also of interest to me was their aim to deliver all of this as a black box appliance to customers on a VM running a custom embedded version of Linux using Postgres as the database.  I would work four days a week remotely and go into the office one day a week.  They already had completely remote employees and since I have been there they have taken on more. There are lots more juicy technical examples in the stack I could go into however, this is not the point of this post.

<!--more-->

Two years on and our API has developed well, our v2 version goes from strength to strength thanks to a great team and we are still using Nancy however, we got to a point at the end of 2015 where we were seeing occasional seg faults when running under [Mono][3].  We spent a lot of time delving deep into the issues, finding different behaviour under different Linux kernel versions and even submitted a `keep-alive` HTTP PR to Mono to try and fix it.  

Around the same time I was involved with [OmniSharp][4] and trying to make developing .Net applications in Sublime Text a viable thing on OSX.  It worked well up to a point.  Whilst this was going on Microsoft announced that .Net was going open source and that they were working on CoreFX a set of base class libraries that would work cross platform.  This was very impressive.  Once could also interpret this as fate.  

A few weeks after the MS announcement, [@thecodejunkie][5] released a [blog post][6] asking the community to help fund the development of Nancy. Him, myself and the other folks that help maintain and drive Nancy forward had always done this in our own time but we were now asking for some donations to keep the project going.  It was felt that if companies are using and shipping applications built on top of Nancy it would be nice if they could contribute pull requests and/or donate some money to the project.  (We have over 200 contributors to Nancy and we get some great PRs from the community but I assume the majority are from people using Nancy not on company time.)  Whilst ASP.Net has the backing of a multi billion dollar company, Nancy doesn't so to keep it going, to give the maintainers a drive and in the big picture keep the project open source to aid .Net developers a choice when developing web based applications it would be great if users could see the benefits of donating a few dollars here and there.  Four months on from the blog post, Nancy has received $50.  When the blog post came out, I sent it to my boss as a fire and forget email, what happened next I hope will be an example for other businesses using open source software.

On my next trip into the office, myself and my boss were having a chat about a few things and the topic of donating some funds to Nancy came up.  We discussed a couple of options and over the next two weeks or so we had a couple more discussions but by the end of it we had decided that what a good thing to do would be to pay to get Nancy running on CoreCLR so we could use it on our Linux system.  One thing to note is that I knew [@thecodejunkie][5] was in a position where the company he worked for, [tretton37][7] would accept contract work for him to work on Nancy (see his blog post [here][8]).

VQ felt that by funding this, it would address issues we had on Mono and therefore give value to the company whilst also allowing them to give back to the community.

We at VQ have other code, not just the API so we embarked on making our other code CoreCLR compatible and over time record the advantages/disadvantages of it running on this platform.  This is still on-going but initial feedback showed all good things so there was no turning back.

We at Nancy, had a call to discuss how our plans could be met with this funding.  We already had a big list of things we wanted to get into a v2 of Nancy (current version 1.x) so what could we do about them if we were to accept funding to get Nancy on CoreCLR.  One thing we were adamant about was that even with funding, we were not prepared to introduce something that did not align with the vision of how we saw Nancy running.  Luckily this was never going to be a problem as VQ simply wanted it run as it did on Mono & .Net.  We decided we could trim our list of features for a v2 but we would still need to get some things done for v2 which would enable CorecLR development.  The CoreCLR work was not a VQ, me and [@thecodejunkie][5] thing only, nothing in Nancy's contribution workflow would change, it was simply that there was people working on Nancy full time.  

VQ agreed that it would fund the development of Nancy on CorecLR from February 1st 2016 initially until April 30th 2016 but if another month was required so be it.  We are now two months in, Nancy runs on CoreCLR on RC1 packages.  RC2 will introduce some major changes so the plan is we get onto that as soon as its released.  Nancy's unit tests and Fluent Validation library is still not compatible with CoreCLR as they are dependent on upstream sources that are still in the progress of transitioning their code to CoreCLR.  Nicely, some work has been done by Microsoft in this regard.  Nancy reached out to Microsoft informing them of VQ's plan to move their code and fund Nancy onto CoreCLR and they have helped with discussions surrounding [Castle.Core][9] and code contributions to repositories such as [FakeItEasy][10] so this has been welcomed greatly.

Whilst we wait for RC2, [@thecodejunkie][5] is working on performance improvements to Nancy and as a team Nancy is looking for feedback for a [v2-alpha release][11] that has been made possible thanks to VQ.

From an open source contributor's perspective it's great to see a company out there with the vision of funding a project to enable it to move forward and address needs they have as a company.  This benefits the open source project as well as the company.

From the perspective of an employee there was no day long meetings discussing implications due to licences, what it would mean regarding support issues, no legal department involvement.  It was simple, the company used an open source project, the company had a vision for their product that the open source project did not meet yet so rather than waiting or look to use another project why not fund that development to meet the requirements?

It can be that simple.  Does your company hit a bug with an open source project? Allow your developers to spend time and submit a PR to fix the issue.  Does your company have a vision that an open source project could help with? Fund that project to make it a reality.

Whilst each open source project is unique, how you enable full time work on it and how companies execute the funding for it will all be different, in essence what I believe VQ has managed to do is set a precedent to say it is possible for companies to fund open source projects.  This doesn't mean companies funding projects kill people's passion in contributing to open source projects, it means passionate developers can contribute as they do now but if there are companies out there able to contribute by funding or having developers contribute whilst in working hours this can only be a good thing for the project.  It's not just a discussion for a couple of developers in the company to have over the water cooler which never materialises into anything and it doesn't mean months on end checking on potential legal/licencing/support issues, its something any company can do if they really want to.  Just to be clear however, in case you're screaming "what a cavalier attitude", VQ were not cavalier in their approach to this, what we did was have a balanced discussion, things like licence issues pretty much went away at the start as Nancy is MIT so we were happy to donate any work paid for by us to the Nancy team, there were no legal issues and any other issues that were raised were either discussed and resolved or we checked with [@thecodejunkie][5] for clarification.  I'm just highlighting that each circumstance is different but luckily for VQ and Nancy it all came together nicely and I believe there can be many companies and open source projects that can have this relationship.

Checkout the [blog post][12] from VQ about how the process above came about and what it means to them and the [blog post][13] from tretton37 about the relationship has evolved between VQ and NancyFX.


If your company has a problem, if no one else can help, and if you can find them, maybe you can fund an open source project.


[1]: http://www.vqcomms.com
[2]: http://nancyfx.org
[3]: http://www.mono-project.com/
[4]: http://ominsharp.net
[5]: http://twitter.com/thecodejunkie
[6]: http://thecodejunkie.com/2015/11/27/support-the-development-of-nancy-financially/
[7]: http://tretton37.com
[8]: http://thecodejunkie.com/2015/08/28/i-am-now-taking-contract-work-for-nancy/
[9]: https://github.com/castleproject/Core/issues/90
[10]: https://github.com/FakeItEasy/FakeItEasy/pull/617
[11]: https://www.nuget.org/packages/Nancy/2.0.0-alpha
[12]: http://www.vqcomms.com/blog/2016-03-30/nancyfx-coreclr/
[13]: https://tretton37.com/blog/tretton37_open_source
