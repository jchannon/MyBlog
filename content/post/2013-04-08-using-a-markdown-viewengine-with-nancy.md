+++

title = "Using a Markdown ViewEngine with Nancy"
aliases = ["/2013/04/08/using-a-markdown-viewengine-with-nancy/"]
tags = [".net","community","markdown","nancyfx","oss"]
+++

Whilst using [stackoverflow.com][1] and [Github gists][2] I’ve become a frequent user of [Markdown][3].

For those of you that don’t know what Markdown is, its essentially a shorter/cleaner syntax that can be parsed to produce HTML. Below are a few examples:

    #Hello World!
    ## You're awesome!
    The quick brown fox jumped over the lazy coder
    What the **hell** is this?
    This is an [example link](http://example.com/)

    <h1>Hello World!</h1>
    <h2>You're awesome!</h2>
    <p>The quick brown fox jumped over the lazy coder</p>
    What the <strong>hell</strong> is this?
    This is an <a href="http://example.com/"> example link</a>

You can see more examples in the earlier link.

When you’re writing a blog post or a lengthy page in your web app with lots of HTML it maybe easier to use Markdown as your preferred syntax. I currently use WordPress for my blog, it’s ok but its quite bloated for probably what I need. I looked into [Calepin][9] and [Scriptogr.am][10] as alternative blogging platforms but I felt it didn’t quite offer what I wanted but the approach was a good idea. It meant you could write a blog post and simply put the file in dropbox and it would appear on your blog.

<!--more-->

As you may be aware, I’m a great fan of [Nancy][11] and the team/contributors were discussing having something similar to Calepin for Nancy so users could upload a Markdown file as a pull request or community article or have something that uses Markdown that can be plugged into Jekyll.

I initially looked into how hard it would be to convert Markdown into HTML with Nancy and as ever, very easy! I found some libraries that already provided the conversion process and decided upon [MarkdownSharp][12].

I then thought we could use Markdown as a proper view engine like Razor. I was unsure of how to provide the ability of model binding, master pages etc but after speaking to [@grumpydev][13] he suggested using the built in view engine with Nancy to provide that functionality.

What this means is that you can have a Nancy route such as:

	public class SampleModule : NancyModule
	{
	    public SampleModule()
	    {
	        Get["/"] = _ =>
	        {
	          var model = new UserModel{FirstName = "John", LastName = "Smith"};
	          return View["Home", model];
	        }
	    }
	}

This will find a Markdown file called Home.md or Home.markdown, translate the model and convert the markdown into a HTML view. You could define you markdown view like so:

    #Hi there!

    My first name is @Model.FirstName and my last name is @Model.LastName

This would then translate to:

    <h1>Hi there!</h1>
    <p>My first name is John and my last name is Smith</p>


This is a simple demonstration but what it means is that you can now use the Markdown view engine instead of Razor if you so wished. Things like model binding, master pages, partials, model iteration etc etc can all be handled by the view engine and your views can be written in Markdown. To use features like partials and master pages you use the Super Simple View Engine syntax that as it sounds is super simple.

When I wrote the Markdown view engine I also wrote a demo with the easy approach of Calepin in mind.

I wrote a HTML view to act as my master page and then a route in Nancy that would take anything after the URL and find the view for it:

	Get["/{viewname}"] = parameters =>
	{
	    var popularposts = GetModel();
	
	    dynamic postModel = new ExpandoObject();
	    postModel.PopularPosts = popularposts;
	    postModel.MetaData = popularposts.FirstOrDefault(x => x.Slug == parameters.viewname);
	
	    return View["Posts/" + parameters.viewname, postModel];
	};

In the Markdown file I would reference the master page, some partials, the model and a custom section for meta data about the blog post:

	@Master['master']
	
	@Tags
	Date: 15/03/2013
	title = "Readme"
	Tags: Nancy,Runtime
	@EndTags
	
	@Section['Content']
	
	@Partial['blogheader', Model.MetaData];
	
	# Readme!
	
	## Markdown Viewengine
	
	This Markdown Viewengine allows views to be written in Markdown.
	
	* Full Model support
	* Master page support
	* Supports HTML within any MD content
	* Simple call `return View["Home"]` for Nancy to render your MD file
	
	## Markdown Blog Demo

This would then render a good looking website with all the features expected in a view engine. It would use the meta data provided to write out things like page titles and tags for a blog post. It would also mean you could use the approach to write your own blog using Nancy and Markdown.

The GetModel() method used above checks a “Posts” directory for Markdown files and reads the metadata for them. What this means is that you can easily write a blog post using Nancy, Markdown and SuperSimpleViewEngine by just uploading the markdown file to a specific directory.

Ideally I would like to get rid of the master page and partial references so you could just have Markdown content in your file but I haven’t figured that out yet. Hopefully someone else can use the Markdown view engine or take the demo app and find an alternative way to provide the simplicity that Calepin offers.

Overall it’s another nice feature that Nancy can offer its users and I have enjoyed contributing to the OSS project and tinkering with code!

The Markdown View Engine and Demo will be released in 0.17 of Nancy due very soon!

   [1]: http://stackoverflow.com
   [2]: https://gist.github.com/
   [3]: http://daringfireball.net/projects/markdown/
   [4]: http://december.com/html/4/element/h1.html
   [5]: http://december.com/html/4/element/h2.html
   [6]: http://december.com/html/4/element/p.html
   [7]: http://december.com/html/4/element/strong.html
   [8]: http://december.com/html/4/element/a.html
   [9]: http://calepin.co/
   [10]: http://scriptogr.am/
   [11]: http://nancyfx.org/
   [12]: http://nuget.org/packages/MarkdownSharp/
   [13]: http://twitter.com/grumpydev

  
