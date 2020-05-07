+++

title = "Using DateTime in C# and SQL"
tags = [".net","c#","sql","datetime"]
+++

I’m sure there are millions of blog posts out there that already discuss this but I think its worth noting down even if its just something for me to remember.

Store your datetimes in UTC format into the database. Unfortunately this mean executing something like:
`myObject.ExpiryDate = TimeZoneInfo.ConvertTimeToUtc(dateTime, TimeZoneInfo.FindSystemTimeZoneById(“timezoneid of users”)`

In every central place where you update/insert DateTime values on your objects you will need the above.

When you display any DateTime information it must display as a local datetime value. You can do this by using     `myObject.ExpiryDate.ToLocalTime()`

<!--more-->

An example of this is if you stored a DateTime that was converted to UTC and it stored April 8th 14:30 2013, when a user in USA was given the date in their web application they would see it as April 8th 10:30 but UK users would read it as April 8th 15:30

If you have an existing application you need to make sure the server side logic regarding date storage converts to UTC and that your view layer converts to local time.

Its risky but if your users are all on the same time zone and the database server and all operating systems are the same you don’t need to worry about this and can use DateTime.Now for everything.  
