+++
title = "Blogging with Markdown & Deploying via Git - Introducing Sandra.Snow"
tags = ["community","oss","snow","nancyfx","git","csharp",".net"]
+++

There are many markdown blogging engines out there such as [Calepin][1], [Scriptogram][2] and even [WordPress][3] allows you to write blog posts in Markdown but [Sandra.Snow][4] tries to add something different.  Firstly, it is written in .Net and [Nancy][5], secondly its a static blog generator and finally it supports Git deployment.

Even if you don't want to use Git deployment you can use FTP, its a great tool.  To write your blog post in Markdown you need a custom header in your file so it knows some information about your post.

    ---
    layout: post
    category: Azure
    title: Setting up a ServiceStack Service
    ---

It then parses this information along with your Markdown into its engine, uses a Markdown view engine to convert the file content into HTML, assign model properties based on the header and creates a HTML file using the model via a Razor viewengine.

The "layout" refers to the Razor file it uses to render the final HTML file.  This allows you to style your pages and blog posts whichever way you'd prefer.  These "layout" files should exist in the "_layouts" folder for your site template.  The site template is a set of files and folders that Sandra.Snow uses to produce the final static website.

The "category" or "categories" property, you can use both for singular or multiple comma-seperated values that refer to the category/categories of your blog post.

The "title" should hopefully be self explanatory!

You can optionally add an author and email properties to override the global config settings for example, if you wanted to allow guest author blog posts.  There is also an optional metadescription property you can use for SEO.
<!--more-->
### Global Config

In the root of the site template is a snow.config file which is what Sandra.Snow uses to determine url format, where to look for posts and layouts and other related information. It is JSON formatted and looks like this:

    {
      "blogTitle" : "Joe Bloggs Blog",
      "author" : "Mr.Guest",
      "email" : "guest@gmail.com",
      "siteUrl": "http://blog.joebloggs.com",
      "posts": "Snow/_posts",
      "layouts": "Snow/_layouts",
      "output": "../MYRelativeWebsiteFolder",
      "urlFormat": "yyyy/MM/dd/slug",
      "copyDirectories": [
        "Snow/images => images",
        "Snow/js => js",
        "Snow/css => css"
      ],
      "processFiles": [{
        "file": "Snow/index.cshtml",
        "loop": "Posts"
      },{
        "file": "Snow/category.cshtml",
        "loop": "Categories"
      },{
        "file": "Snow/categories.cshtml => categories"
      },{
        "file": "Snow/archive.cshtml => archive"
      },{
        "file": "Snow/about.cshtml => about"
      },{
        "file": "Snow/contact.cshtml => contact"
      },{
        "file": "feed.xml",
        "loop": "RSS"
      },{
        "file": "sitemap.xml",
        "loop": "sitemap"
      }]
    }

Here is an explanation:

- "blogTitle" : The title of the blog you want to appear on your RSS feed
- "author" : The author's name
- "email" : The author's email.(You can use an [HTMLHelper][10] in the view that gets the author's Gravatar from the global/post settings)
- "siteUrl": "This is used to enable Disqus support. Simply use an [HTMLHelper][9] to render Disqus comments"
- "posts" : The location of the markdown files
- "layouts" : The location of the layout files
- "output" : The location where Sandra.Snow will put the static HTML. This is relative
- "urlFormat" : The format of the URL to your blog post
- "copyDirectories" : The directories in your template that it will copy to the output
- "processFiles" : This takes an object of the filename and property information on how to render the file.  Each file/view will be called and rendered with model information availble.  The model information available to these views are shown below:

    
        public List<Post> PostsInCategory { get; set; }
        public Dictionary<int, Dictionary<int, List<Post>>> PostsGroupedByYearThenMonth { get; set; }
        public List<Post> Posts { get; set; }
        public List<Post> PostsPaged { get; set; }

        public bool HasPreviousPage { get; set; }
        public bool HasNextPage { get; set; }
        public int NextPage { get; set; }
        public int PreviousPage { get; set; }
        

In the standard website template there are category, categories, about and index *.cshtml pages which accept this model information and render the relevant information. Based on the file name you can guess what each file outputs.  The "loop" in the settings is used internally by Sandra.Snow to process the relevant data. For example "RSS" creates a RSS file based on the list of posts while Posts/Categories create sub-directories for the relevant model type eg/categories/posts.  "sitemap" will use the `List<Post>` to create a sitemap.xml in the root of your blog. 

As Sandra.Snow is a static HTML generator it will create folders with the relevant name for the post or file named in the config file eg/`http://mydomain.com/2013/08/18/this-is-a-great-article` or `http://mydomain.com/categories` and create a `index.html` file for each folder.  In the root of the website it will create a `index.html` with 10 blog posts inside it.  If you have 100 markdown posts it will it will page this for you and create links to `http://mydomain.com/page2` etc.  If you use `<!--excerpt-->` in your Markdown it will read up to that point so you can click a "read more" link otherwise it will use the whole Markdown content.    If you look at the model properties you'll see your index layout view can tell if there is a next/previous page and therefore create the relevant links in the HTML.

Once you run the Sandra.Snow exe it will output the HTML and you can then FTP your files to your website.

Check out the [wiki][12] for more details about other HTMLHelpers such as Google Analytics.

### Git Integration

FTP is so 2001 so Sandra.Snow has a website called Sandra.Snow.Barbato which allows you to access it (final URL to be confirmed) and log in with your Github credentials.  It will then give you a list of your repositories, the idea being one of them is your blog with the markdown posts and snow.config etc.  A [base template][11] is available in the Sandra repository for you to fork.  You can then choose whether you'd like to deploy to another Git repository that supports Git deployment eg/Azure, AppHarbor, Heroku or you can select FTP.  In either scenario, enter your details and off you go. The website will use Sandra.Snow to create the output and it will then wire it over to your chosen destination.  

Sandra.Snow.Barbato is also setup to handle Github hooks so in Github if you tell your repository to do a post commit hook to the website, after you write a new blog post and push to Github it will post to the website and know if you've previously logged in and if so generate the HTML and re-deploy your blog.  It will also push the generated content back to your Github repository on the master branch. Very nice!

### Setting up Sandra.Snow.Barbato

One you have forked the Barbato template you can begin to style your blog pages.  Obviously every time you want to make a style change you want to see the results.  There are 2 ways to do this.  i) Run Sandra.Snow locally, setup a webserver eg/IISExpress to point to the Snow output directory and open up your browser to see the changes. Keep making changes to the *.cshtml and *.css files until happy ii) Make the changes in your repo, sign up with Sandra.Snow.Barbato and go to your domain to check the changes that were deployed.

#### Azure
If deploying to Azure you must have a .deployment file in the root of your repository that contains:

    [config]
    project = Website
    
This is needed because when your template repository is pushed to Azure it needs to know what to deploy. This simply tells it to use the Website folder ie.the output folder from Sandra.Snow.

#### Github Pages
If deploying to Github you need a few things. Your repository needs to be called `username.github.io`. You then need to create a CNAME file in your repo that has the domain you will be using inside it. Finally you need to setup the DNS on your domain to point to `username.github.io` by creating a CNAME record in your DNS Manager. What you'll have to probably do is clone your `username.github.io` repo and run Snow and set the output setting in snow.config to the path of your `username.github.io` folder. You can then push the changes to Github. 

### Wordpress Migration

My blog was previously using Wordpress so I needed to get my data out.  The most common referred to tool was [wp2md][6] which uses Python to go through the exported Wordpress content and then convert to Markdown.  For some reason I didn't go with that choice and went with [http://heckyesmarkdown.com/][7].  Its a bit more work because you have to give it your previous URLs to your blog posts and it reads the source of the page and converts it to Markdown.  It worked brilliantly for me.  I had to make a few changes on the output it provided by generally it was very good.

As I didn't want to worry about HTTP 302, I made sure I saved my markdown files as the urls are on my live site so [http://blog.jonathanchannon.com/2012/12/19/why-use-nancyfx/][8] was saved in a file called `2012-12-19-why-use-nancyfx.md`. This file naming format is currently enforced so Snow can gather date and slug information(unsafe characters in the slug/title for URLs will be removed).

I then went through addind the meta headers to tell Sandra.Snow a bit more about the posts and also added in the `<!--excerpt-->` information so not to render the whole blog content on the home pages.

I then went through and styled the master page `default.cshtml` in the _layouts folder as well as the `post.cshtml` and the other files in the root of the site template folder.

Once done I ran the .exe file to generate my content.  One of the great things about Sandra.Snow is its speed. It takes less than a second to do 100 blog posts, luckily I only have 25 so its really fast.  I opened up a browser and checked my files and if some styling needed tweaking I could do so and re-run.  Once all ok I can deploy or push the template folder to Github, setup the post commit hook and then use Sandra.Snow.Barbato to handle deployment from now on.

### Conclusion

If you're a Git and Markdown user and want to create a blog with complete simplicity this is a great tool.  No more messy Wordpress, no more running exe's on your machine (unless you want to), its completely automated apart from writing the blog posts!  In fact I'm so happy with this project, this blog is using it!  Give it a try and if you like the look of it get involved with its development.  [Sandra.Snow][4] the new modern, simplistic and effective tool for blogging.



[1]: http://calepin.co/
[2]: http://scriptogr.am/
[3]: http://wordpress.org/
[4]: https://github.com/Sandra/Sandra.Snow
[5]: http://nancyfx.org
[6]: https://github.com/dreikanter/wp2md
[7]: http://heckyesmarkdown.com/
[8]: http://blog.jonathanchannon.com/2012/12/19/why-use-nancyfx/
[9]: https://github.com/Sandra/Sandra.Snow/wiki/Disqus-Support
[10]: https://github.com/Sandra/Sandra.Snow/wiki/Gravatar-Support
[11]: https://github.com/Sandra/Sandra.Snow.BarbatoTemplate
[12]: https://github.com/Sandra/Sandra.Snow/wiki
