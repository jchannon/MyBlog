+++

title = "Using NodeJS and FTP with Promises"
tags = ["javascript","nodejs","promises"]
+++
I've played with node in the [past][1] but as of the new year I decided to try and make a more concerted effort to get stuck into node properly.  I decided to go back to the beginning to try and get a better appreciation for the language so read "JavaScript: The Good Parts by Douglas Crockford".  I found that exercise fulfilling and resulted in a few light bulb moments that made some dots join up so I'd recommend reading it if you haven't already.

###Real World App

As I stated earlier I have already played with node in the past using [Express][2] and have read quite a bit on node and read many examples but I wanted to write a non-web app as I felt this would give me a better opportunity to get to grips with the language and Node. Using Express allows you to get up and running very quickly without to much head scratching so I felt a standalone script would give me more exposure to things.

<!--more-->

During the previous couple of weeks at work I wrote a console app that downloaded zip file from a FTP server, extract the contents, read data in a XML file that was in the zip, do some string matching and upload the zip to another FTP server.  I figured this would be a good app to replicate in node so off I went.

After a bit of [npm][3] research I found the modules I needed and managed to get to the point of downloading files pretty easily with the below code:

    var path = require('path');
    var fs = require('fs');
    var Promise = require('bluebird');
    var Client = require('ftp');
    
    var c = new Client();
    
    var connectionProperties = {
        host: "myhost",
        user: "myuser",
        password: "mypwd"
    };
    
    c.on('ready', function () {
        console.log('ready');
        c.list(function (err, list) {
            if (err) throw err;
            list.forEach(function (element, index, array) {
                //Ignore directories
                if (element.type === 'd') {
                    console.log('ignoring directory ' + element.name);
                    return;
                }
                //Ignore non zips
                if (path.extname(element.name) !== '.zip') {
                    console.log('ignoring file ' + element.name);
                    return;
                }
                //Download files
                c.get(element.name, function (err, stream) {
                    if (err) throw err;
                    stream.once('close', function () {
                        c.end();
                    });
                    stream.pipe(fs.createWriteStream(element.name));
                });
            });
        });
    });

    c.connect(connectionProperties);

However, I originally had that code in a function and wanted to call it and then call another function to read the files that I had downloaded but what I found was callback hell.

###Enter Promises

I needed to know that all the files had downloaded and then I could read the files in a directory ready for zip extraction but I couldn't work out how.  I discovered promises and probably didn't read enough about all the ins and outs of them but I remember [Glenn Block][8] giving a talk about [async programming in node][4] so I pestered him on Twitter and he kindly helped and me out and also pointed me towards his code and slides where I decided to use [Bluebird][5], the promise library.  Unfortunately I just couldn't get the files downloaded. It would download one file but not the other and closed the streams.

Here is a snippet of what I had (brace yourself)

    var processListing = function (directoryItems) {
        var itemsToDownload = [];
        directoryItems.forEach(function (element, index, array) {
            //Ignore directories
            if (element.type === 'd') {
                console.log('directory ' + element.name);
                return;
            }
            //Ignore non zips
            if (path.extname(element.name) !== '.zip') {
                console.log('ignoring ' + element.name);
                return;
            }
            //Download zip
            itemsToDownload.push({
                source: element.name,
                destination: element.name
            });
        });
        return itemsToDownload;
    };
    
    var processItem = function (object) {
        return aFtpClient.getAsync(object.source);
    };
    
    var downloadFiles = function () {
        console.log('downloading files');
        aFtpClient.
        listAsync().
        then(processListing).
        map(function (object) {
            return processItem(object).then(function (processResult) {
                return {
                    input: object,
                    result: processResult
                };
            });
        }).
        map(function (downloadItem) {
            downloadItem.result.pipe(fs.createWriteStream(process.cwd() + "/zips/" + downloadItem.input.destination));
            return new Promise(function (resolve, reject) {
                downloadItem.result.once("close", function () {
                    console.log('closed');
                    resolve();
                });
            });
        }).done()
    };

Not only is that a tad complicated but I could not for the life of me understand what the hell was happening and why it wasn't downloading all the files.  I reached out to [@PrabirShrestha][7] who agreed it was a tad over complicated and tried to help but recommended I take a look at Reactive Extensions, maybe I will in the future but at this point my frustration had kicked in and I wanted to give up.  I went through a mixture of emotions from frustration, which led to anger, fuming anger, denial, then apathy.  Although these emotions went by and after a couple of questions on stackoverflow that helped but didn't give the solution I explained the issue to a colleague and we both took a look.  I went through a few iterations with no luck and after a bit more reading I think we were closing in on it individually but I was beaten to it. All hail [@iamnerdfury][6] who produced this:

    var connect = function() {
        c.connect(connectionProperties);
        return c.onAsync('ready');
    };
    
    var getList = function() {
        return c.listAsync();
    };
    
    var zipFiles = function(element) {
        return element.type !== 'd' && path.extname(element.name) === '.zip';
    };
    
    var current = Promise.resolve();
    
    var downloadFiles = function(file) {
        current = current.then(function() {
            return c.getAsync(file.name)
        }).then(function(stream) {
            stream.pipe(fs.createWriteStream(file.name));
            console.log(file.name + ' downloaded..');
        });
        return current;
    };
    
    connect().then(getList).filter(zipFiles).map(downloadFiles).done();
    
I think the previous issues I had was I was returning `resolve()` after the first file downloaded which is not what you want to do when multiple calls to it are executed as a promise can only resolve once.  I needed to find some way of concatenating a promise somehow for each file that is downloaded. I looked at the `all()` command but I couldn't get it to fit but @iamnerdfury found that you could do this via creating an instance of a promise by calling resolve and then assign to it on each file that needed to be downloaded.

Now I know the files are downloaded I can chain more functions to read the file system, extract the zip for each one, read the XML and upload to a new server.

I hope this helps someone else because it wound me up something chronic and whilst I get pissed off with JavaScript when things like this happen I will keep at it because I think node is now becoming a serious contender and us developers need to keep a finger in many pies.

*(If you think there is a way to improve the solution above I'd love to hear it)*


  [1]: http://blog.jonathanchannon.com/2012/10/08/node-js-express-hello-world-formula-1-style/
  [2]: http://expressjs.com/
  [3]: http://npmjs.org
  [4]: https://github.com/glennblock/codemash-async
  [5]: https://github.com/petkaantonov/bluebird/
  [6]: http://twitter.com/iamnerdfury
  [7]: https://twitter.com/PrabirShrestha
  [8]: http://twitter.com/gblock
