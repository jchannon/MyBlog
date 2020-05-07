+++

title = "Testing your application’s email logic"
tags = [".net","oss","c#","email","node.js","papercut"]
+++

If you’ve ever written an application that sends out email you may have written the code and executed it numerous times to check that the logic works and that the email appears as you hope. This obviously means you have to hit your SMTP server each time, open your email client and check your emails each time.

### Papercut

Reading through my Twitter timeline I saw [@TheCodeJunkie][1] asking about the app that you can use to test sending emails from your application.

![TheCodeJunkie Tweet][2]

Intrigued, I kept an eye on my timeline and found that the application in question was [Papercut][3]

<!--more-->

In simple terms you put Papercut on a machine (most likely your development machine) and in your code set the SMTP host to be the IP Address of where Papercut is running and fire up your application and watch Papercut notify you from the system tray that it’s recevied a message.

![Papertray System Tray Icon][4]

*Papertray System Tray Icon*

Lets open it up and see what it says!

![Raw View][5]

*Raw View*

![Body View][6]

*Body View*

I’ve tested this with a C# application and a Node.js application. If you don’t believe me, here’s the code:

**C#**

	static void Main(string[] args)
	{
		MailMessage message = new MailMessage("Jonathan Channon ", "tim.cook@apple.com")
		{
		    Subject = "iPhone",
		    Body = "I would like a free iPhone for work. My boss won't let me have one. How about it?",
		    BodyEncoding = Encoding.UTF8
		};
		
		message.Bcc.Add("boss@company.com");
		SmtpClient client = new SmtpClient("127.0.0.1");
		NetworkCredential info = new NetworkCredential("mail@jonathanchannon.com", "reallysecurepassword");
		client.DeliveryMethod = SmtpDeliveryMethod.Network;
		client.UseDefaultCredentials = false;
		client.Credentials = info;
		try
		{
		    client.Send(message);
		}
		catch(Exception ex)
		{
		    Console.WriteLine(ex.Message);
		}
	}

**Node.js**

	var nodemailer = require("nodemailer");
	
	var smtpTransport = nodemailer.createTransport("SMTP");
	
	var mailOptions = {
	    from: "Jonathan Channon ",
	    to: "tim.cook@apple.com",
	    cc: "boss@company.com",
	    subject: "iPhone",
	    text: "I would like a free iPhone for work. My boss won't let me have one. How about it?",
	    html: "I would like a free iPhone for work. My boss won't let me have one. How about it?"
	};
	
	smtpTransport.sendMail(mailOptions, function(error, response){
	    if(error)
	    {
	        console.log(error);
	    }else
	    {
	        console.log("Message sent: " %2B response.message);
	    }
	
	    smtpTransport.close();
	});

I think this is a great little app and a real time saver. I highly recommend that you check it out!

They also offer a web based version called [DummySMTP][8] which allows you to test an almost live copy of your application but DummySMTP captures the emails sent out to customers, for example.

   [1]: http://twitter.com/TheCodeJunkie
   [2]: /images/blogpostimages/tweet.png
   [3]: http://papercut.codeplex.com/
   [4]: /images/blogpostimages/Untitled.png (Papertray System Tray Icon)
   [5]: /images/blogpostimages/raw-620x330.png (Raw View)
   [6]: /images/blogpostimages/body-620x330.png (Body View)
   [8]: http://dummysmtp.com/

  
