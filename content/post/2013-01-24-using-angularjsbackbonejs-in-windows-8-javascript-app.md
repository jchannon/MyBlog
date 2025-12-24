+++

title = "Using AngularJS/BackboneJS in Windows 8 JavaScript app"
aliases = ["/2013/01/24/using-angularjsbackbonejs-in-windows-8-javascript-app/"]
tags = ["angularjs","backbonejs","github","javascript","knockoutjs","oss","windows 8","winjs"]
+++

To help me expand my JavaScript knowledge as I said I would in my [previous post][1] I thought I’d write a Windows 8 application using JavaScript.

After following a few “Hello World” tutorials from Microsoft I thought I’d take a look at the ToDo list demos shown at [TodoMVC.com][2].

This website/Github repository takes the ToDo demo and implements it in all the various JS frameworks and libraries out there. As I said previously its a minefield.

Anyhow, I thought I’d start with Backbone, copy the files, add the references to WinJS and hit F5 and bingo. However, I got the below error:

![Unhandled Exception][3]

<!--more-->

A bit confused, I googled the issue and found that Microsoft have implemented security principles in WinJS applications to prevent un-sanitized markup to your page. So any time you might dynamically add some HTML to your page your application will throw an exception.

To get around this issue you can wrap your dynamic content calls with _execUnsafeLocalFunction_

You can read more about that from Microsoft’s documentation [here][4]

Here is how you would execute the function around dynamically adding HTML:
```javascript
	MSApp.execUnsafeLocalFunction(function() {
	  var body = document.getElementsByTagName('body')[0];
	  body.innerHTML = 'example';
	});
```
I moved onto Angular to see if that would help but again I hit the same bug. I did find in the Angular code that if you have a reference to jQuery in your page it would use that, so I downloaded the latest version, referenced it and still the same issue.

What I didn’t realise is that Backbone and Angular both ship jQuery or a subset of it within them and I didn’t fancy modifying those libraries.

I found [jquery-win8][5] from appendTo which I thought was the answer so referenced that and still the same issue.

I then gave KnockoutJS a go and it worked perfectly, the reason being no dependency on jQuery.

I put a question on StackOverflow and after a couple of days [Elijah Manor][6] of AppendTo answered me.

> appendTo’s version removes errors that occur when running jQuery at load time. You still may have code that violates the security model Microsoft put in place. Microsoft is trying to make you aware that there is a risk adding un-sanitized markup to your page.
>
> If you are confident that is not the case you can try setting jQuery.isUnsafe to true after the appendTo library is included. That should wrap all possible unsafe calls with MSApp.execUnsafeLocalFunction so that Microsoft doesn’t complain.
>
> Note: This flag is turned off by default

So I setup the Angular version of the TodoMVC demo in my Win8 application, referenced the WinJS libs, jquery-win8 and set `jQuery.isUnsafe` to true and the app started perfectly and all functionality was present. Yay!

```bash  
	<script src="//Microsoft.WinJS.1.0/js/base.js"></script>
	<script src="/js/default.js"></script>
	<script src="js/jquery-1.8.2-win8-1.0.min.js"></script>
	<script type="text/javascript">
	    jQuery.isUnsafe = true;
	</script>
```
One thing to note is that jquery-win8 runs off of jQuery 1.8.2 but appendTo are working on a 1.9 version.

   [1]: http://blog.jonathanchannon.com/2013/01/09/javascript-is-the-future-maybe/ (JavaScript is the future…maybe!)
   [2]: http://TodoMVC.com
   [3]: https://i.stack.imgur.com/DOQl1.png (Unhandled Exception)
   [4]: http://msdn.microsoft.com/en-gb/library/windows/apps/hh767331.aspx
   [5]: https://github.com/appendto/jquery-win8
   [6]: https://twitter.com/elijahmanor
  
