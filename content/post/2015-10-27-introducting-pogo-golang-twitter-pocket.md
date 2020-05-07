+++

title = "Introducing PoGo  - a GoLang, Twitter favourites to Pocket importer"
tags = ["golang","oss"]
+++
I've always kept myself up to date with the latest languages arriving on the scene and I've spent time in the past learning Node and last year I learnt Python by doing the Omnisharp plugin for Sublime.  I have recently been looking for a static language that I can transfer my C# skills too and I had narrowed it down to 3; Swift, Kotlin and GoLang.  I started out with Kotlin and setting up a dev environment with IntelliJ and running the koans that Jetbrains advise you step through to pick up the language.  Whilst it seemed relatively straightforward I got "noob confused" when I saw examples of Java calling into Kotlin with get/set prefixes somehow magically added to Kotlin properties. It turns out the Kotlin compiler does this for Java libraries so it can communicate with it, to me it seemed strange that I code a library in one language and the compiler then exposes these methods and properties slightly differently. Superficial as this sounds I also didn't really like the mammoth that appears to be IntelliJ.  Coming from a predominantly Visual Studio background but working with Omnisharp I wanted a lightweight editor with some refactoring, intellisense and error highlighting.

<!--more-->

I had come across [The Little Go Book][1] a while ago and even went to the extent of getting it printed as a book via [ePubli](https://www.epubli.co.uk) as I'm old school and would like to read something that lengthy on paper not a screen.  Some months passed with it gathering dust but I had made the decision that I wanted to branch out into another language and community so I ditched Kotlin and started reading this book.  Its only 50 pages long but due to work and family life this took a week to complete but it also got me questioning my understanding of C#.  

After listening to [Michael Van Sickle][2] on a recent podcast I setup my Atom editor with the [Golang plugin][3] and also used the Go website (which has an [online editor][4] which you can use to execute Go code) to test my understanding of how to use Go.

After a week of reading the book and executing the code I thought it was time to try and write a real world application.  

For a while I had been wanting to use [Pocket][5] a tool which helps you save links you want to go back and read at a later date. Currently I use Twitter favourites as a way to save interesting links that I will go back and read but I wondered if a tool like Pocket might be a better.  

I had scowered the internet looking for a tool that would go through your favourites and import them into Pocket.  I found one website that aimed to do that but basically didn't work.  I found [IFTTT](https://ifttt.com/) which would automatically move favourites to Pocket but only starting as of now.

### Lets do this

So I was going to write a tool that would import all your favourites into Pocket.  First thing I would need to do is connect to Twitter to get my favourites from my Go app so I fired up Google to see what was out there.  I came across the [Anaconda][6] library which is a Go wrapper for the Twitter API.  This would get my list of favourites but it wasn't going to do the authentication for me.  Google to the rescue again, I came across this [OAuth][7] library which would allow me to authenticate against Twitter with a consumer key and secret and then prompt the user to allow the app to have access to tweets.  By doing this, Twitter would give the user a code that they could then paste into the app and in return it would make a request to Twitter to get a access token. Easy peasy!

Now I needed to communicate with Pocket so more Googling resulted in this [library][8].  Whilst this had the basics to connect to Pocket I had to add extra steps to get authentication working properly.  I also had to read their [documentation][9] about 20 times to understand their workflow.  I think their authentication workflow is aimed at mobile clients and websites authenticating against them rather than console applications.  Two of their steps require passing in redirect urls which is no good if you're a terminal app.  Also their documentation states that if the user authorises the app to access the user's Pocket account it will redirect back to a url, it will also redirect to the same url if the user doesn't allow access. Yeah that makes sense!?!  Rather than having it redirect it would have been helpful if it did what Twitter did and provide a code the user can paste into the terminal but alas that's not an option so I had to fire up a webserver in my app that Pocket would redirect to.  Surprisingly that only took two lines of code!


    http.Handle("/", http.FileServer(http.Dir("./static")))
    http.ListenAndServe(":3000", nil)

Once I had authenticated I had to do a bit more reading regarding the Twitter API, I had to have logic to keep calling the Twitter API to get favourites until I had got them all.  By default you can only return 200 favourites in one go and I had over that stored on Twitter.

I then had to ensure that my array of tweets were oldest first because when I looped over them adding them to Pocket I wanted the most recent favourites first.  Reversing an array is not as easy as it sounds unfortunately and especially when in C# I'm used to `Array.Reverse(array);`  You could write a `for` loop starting from the length of the array rather than zero and populate a new array with the last item first but I didn't want to do that really although it might have been simpler in the long run. Instead of doing that I could have looped over my array in a for loop but I wanted to use a `foreach` loop or in Go thats called `range`.  What I had to do is similar to what you do in C# when doing custom comparisons and that is I had to implement an interface that would implement `Len,Less,Swap` methods.  It was the `Less` method which was what did the magic for us, ie/order the tweets by date.


	func (slice Tweets) Less(i, j int) bool {
		firstTime, err := slice[i].CreatedAtTime()  
		if err != nil {
			fmt.Println("oops")
		}
		secondTime, err2 := slice[j].CreatedAtTime()
		if err2 != nil {
			fmt.Println("oops again!")
		}

		return firstTime.Before(secondTime)
	}

Here we take in a slice (a wrapped array) of tweets, we get our first and second tweet and call a method on it that parses a datetime in string format and return a `time` object specific to Go.  We then return a boolean to say whether the first tweet's date is before the second tweet's date. Then to reverse our array now we have that interface implemented we can call `sort.Sort(myFavourites)`. As I say when used to a one line statement reversing an array or using LINQ to do custom ordering of an array doing all this code seems a bit over the top but I think this is just because Go is reasonably young and the authors are trying to keep it fairly simple.  Whether or not they will add LINQ type abstractions to the language in time, who knows but I think they are looking at languages like C# where things have been added and added over time and not wanting to populate Go too much. That's what I've heard anyway but what do I know I've only been using it for 7 days.

Some other things I noticed was that when you import a package it is case sensitive otherwise Go doesn't really like it. Also naming your variables matters. I have a package called `twitter`, I created a type called `Twitter` inside that package so to instantiate that I did `twitter := twitter.Twitter{}`. So that's `package.type`.  I could then call methods by doing `twitter.` however once I added another type in the `twitter` package when I did  `otherVariable := twitter.MyNewType{}` it complained that `twitter` didn't have anything called `MyNewType` inside it.  What it was saying was that my variable called `twitter` didn't have it not that my package didn't have it so we have to be careful on naming things which is where developers fail!

What I will say is that when I was scratching my head on a Go issue I found a lot of blog posts and resources for Go which is a nice surprise due to its age however, its not actually that young. It was announced in 2009 and seeing its now 2015, 6 years in the tech world is a long time so its good to see all the resources out there for it.

Anyway, back to the code, once I had my array of favourites I could loop over them and do some logic on the tweets.  Usually when I favourite something it would have a link to an article so I had to decide how I was going to handle this.  I decided upon if the url had a host of github.com or if the extension was empty or it ended in either html, pdf, aspx or md then we would post that link to Pocket otherwise we wouldn't add it.  If the tweet didn't contain a link we would post the url of the tweet to Pocket.  What this exposed me to was the libraries in Go that dealt with urls and files.

So now I had my app working I needed a decent name and some decent styling on the web page that Pocket redirected to after the user had been authorised.  I put out a Tweet asking for help and had a couple of suggestions for a name but I decided upon PoGo which came from [Khalid Abuhakmeh][10] and I had a great pull request from [Kevin Hougasian][11] which had a great design for the authorised page.

### Introducing PoGo

![PoGo App][12]

![PoGo Authorised Page][13]

[Github link](http://github.com/jchannon/pogo)

### Conclusion

I haven't touched on a lot of things in Go that I've learnt for example, `goroutines` but I hope I've introduced some simple examples to demonstrate how Go can be used quite easily.  I would say that Go is quite similar to Python but obviously has its own unique features.  It is a statically typed language so has features like intellisense and error information when it compiles.  Nicely the Atom plugin gives the intellisense in the editor and also error messages when you save the documents you are working on.  I've dabbled quite a bit with Node in the past but never fully immersed myself in the community because I always had the day job of C# needing my attention and that still applies today.  However, the company I work for deploys their product on Linux using Mono and so I am getting more involved in Linux and I think its pretty clear that Linux has won the deployment story so much so Microsoft are making ASPNet5 run on Linux and the number of tools on Linux vs Windows is considerably highly so with that I think its important to learn a language that is a first class citizen on that platform.  Starting afresh in a new community is daunting as you are starting from scratch but I'm at a point where I'd like to get involved with new people and learn a new language that is a first class citizen on Linux.  The problem I have is making the time to make this happen!

[1]: http://openmymind.net/The-Little-Go-Book/
[2]: https://twitter.com/vansimke
[3]: https://atom.io/packages/go-plus
[4]: https://tour.golang.org/welcome/1
[5]: https://getpocket.com/
[6]: https://github.com/ChimeraCoder/anaconda
[7]: https://github.com/mrjones/oauth
[8]: https://github.com/quekshuy/pocket-golang-sdk
[9]: https://getpocket.com/developer/docs/authentication
[10]: https://twitter.com/AquaBirdConsult
[11]: https://twitter.com/hougasian
[12]: /images/blogpostimages/pogo.png (PoGo App)
[13]: /images/blogpostimages/pogoauthorised.png (PoGo Authorised Page)
