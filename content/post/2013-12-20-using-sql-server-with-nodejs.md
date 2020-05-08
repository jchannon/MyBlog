+++

title = "Using SQL Server with node.js"
tags = ["javascript","node.js","sql","OSS","community"]
+++

I like to keep eyes and ears open for new technologies and methodologies in order to become a better developer and I'd heard about [edge.js][1] many months ago but made a mental note of it and waved it goodbye.  edge.js lets you have two-way communication between node and C# libraries.  When I first looked at it I thought that sounded a bit hacky, I've spent my time communicating with COM libraries in Delphi and OCX libraries with C# and didn't like it so I felt this was pretty much the same thing.  A long time passed and I was writing a console based Windows app as a service and had wondererd whether I could quickly port it to node.  

I was discussing with a colleague about using node at work and that we needed something seperate and small just to try it out and see how the whole developement process with it worked.  As the database that this app needed to communicate with was MSSQL I looked into a library on NPM that would communicate with MSSQL and maybe act as an ORM.  There was a Microsoft lib that seemed untouched and reading the comments on the issues list on Github it didnt favour too well.  There were libraries that would communicate with MySQL & PostgresSQL but not MSSQL.  In my search I came across edge.js again.  It had 2 samples, one that used edge-sql and one that used ScriptCS so in laymans terms, one that used a precompiled dll and one that used a C# script that was executed at runtime.

<!--more-->

Looking at the samples the Github repo gave you could do the following:

	var edge = require('edge');

	var getTop10Products = edge.func('sql', function () {/*
	    select top 10 * from Products
	*/});

	getTop10Products(null, function (error, result) {
	    if (error) throw error;
	    console.log(result);
	});

Thats it, you could call `node myscript` and it would log out the values of the result variable.  

What this did was in fact send the SQL string to a compiled dll which had a class and async method in it that was setup to respond to calls from node js.  This method essentially returned a C# `List<object>` that was serialized to JSON so the node.js function could interact with it.  The one issue I saw with it was the actual format of the JSON.  It was a 2 dimentional array, with the first array in the parent array containing the column names and the subsequent arrays containing values from the rows in the SQL result.  

## Time to roll up your sleeves

Whilst I liked the fact that I could now return data from MSSQL with node its format wasnt quite right.  I forked the project on Github and then looked at the way it was executing the SQL and storing it in a `List<object>`.  Whilst I kept the `List<object>` return type the information inside it differed.  I was now using `var dataObject = new ExpandoObject() as IDictionary<string, Object>;` and for each field in the resulting SQL dataset I populated it like so `dataObject.Add(record.GetName(i), resultRecord[i]);` ie/ the column name and corresponding value.  So this looped over the sql storing objects in a list and then returning it as JSON as it did before.  What this meant was that the API had now changed so I could refer to the column names as object properties on the node object.

	getTop10Products(null, function (error, result) {
	    if (error) throw error;
	    console.log(result[0].ProductName);
	    console.log(result[1].UnitPrice);
	});

Bingo!

So now just out of curisotiy I wanted to right a sample ExpressJS app to see how I could use this to have a JS file that acted as a C# repository to do all the data access.  I'll let you look into setting express up yourself but what I managed to do was this:

#### server.js

	var express = require('express');
	var edge = require('edge');
	var index = require('./index.js');
	var db = require('./db.js');

	var app = express();

	app.get('/', index.home(db));

	app.listen(999);
	console.log('Listening on port 999')


#### db.js

	var edge = require('edge');

	exports.getProducts = edge.func('sql', function() {/*
					    select top 10 * from Products 
					 */});

#### index.js

	exports.home = function(db) {
	    return function(req, res) {
	        db.getProducts(null, function(error, result) {
	            if (error) throw error;
	            var data = {};
	            data.all = result;
	            data.Item1Name = result[0].ProductName;
	            data.Item2ReorderLevel = result[1].ReorderLevel;
	            res.send(data);
	        });
	    }
	}

I fired up a browser and pointed it at http://localhost:999 and it returned showed me my 10 products, then my first item's product name and second item's re-order level. Consider me pleased!

## Conclusion

I know some people will think using MSSQL for a node app seems odd but if you want to spike something up and/or only have access to a MSSQL db for whatever reason you can now do it very easily and actually quite elegantly.  You execute your SQL and you get back a JSON object that represents your data, same as any other SQL/NOSQL database.  Give it a whirl and see how you get on!


[1]: http://tjanczuk.github.io/edge/#/


