+++

title = "Enabling CORS in IISExpress"
aliases = ["/2013/09/16/enabling-cors-in-iisexpress/"]
tags = ["integration testing",".net","iis express"]
+++
I was playing around with [swagger-ui][1] and was trying to point it to a local endpoint that I started with IIS Express.  I was getting an error saying that it needed the endpoint to accept Access-Control-Allow-Origin requests.

I went Googling and it couldn't find anything specific to IIS Express but managed to use some guidance for full blown IIS.

The solution is to go to `C:\Program Files (x86)\IIS Express\AppServer` and open the `applicationhost.config` file.

Search for `httpProtocol` and you should see this:
```xml
    <httpProtocol>
        <customHeaders>
            <clear />
            <add name="X-Powered-By" value="ASP.NET" />
        </customHeaders>
        <redirectHeaders>
            <clear />
        </redirectHeaders>
    </httpProtocol>
```
Now add this to the `customHeaders` node:
```xml
    <add name="Access-Control-Allow-Origin" value="*" />
    <add name="Access-Control-Allow-Headers" value="Content-Type" />
```   
Just bear in mind this opens up your webserver so you may need to find something alternative for a live production environment.

Anyway you should now be able to start accepting requests via CORS when you fire up IISExpress

[1]: https://github.com/wordnik/swagger-ui
