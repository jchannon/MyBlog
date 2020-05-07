+++

title = "Publishing to Windows Azure from Github"
tags = [".net","deployment","dinnerparty","git","github","windowsazure"]
+++

Back in [July 2012][1] Microsoft announced improvements to Azure Web Sites. One of those improvements was to Git publishing so when you pushed changes to your Github repository Azure would automatically pick that up and deploy the project. I even mentioned it in my [DinnerParty blog post][2] but have only just looked at implementing it.

## Preparation

As I said in my previous post Azure supported Git publishing but it was a two step process. You push to Github and then push to Azure and it gets deployed. If you already have Git setup on your Azure account there is nowhere in the dashboard that allows to you setup Github integration. I thought I was going to have reset my deployment credentials and set it all up again when I asked the question on [Jabbr][3]. Luckily [David Fowler][4] was online. Why is that lucky? He wrote the Github integration feature of Azure.

To setup your Azure account to enable Github integration you have to FTP into your Azure account and delete the deployment history by deleting all contents in the /site/deployments folder.

![Deployment History][5]

*Deployment History*

<!--more-->

### Setup

Once the history is deleted, if you go to the Deployments tab in the Azure account you will now see a link to “Deploy from my GitHub repository”.

![Setup][6]

*Setup*

By clicking the link it will inform you that you need to authorize Azure to have access to your Github repository and that if there is code already in your repository it will be deployed again.

![Authorize][7]

*Authorize*

Once you authorize Azure to read your Github account you need to tell it which repository it should watch.

![Repository][8]

*Repository*

As stated earlier, if there is code in the repo it will begin to deploy automatically and confirm deployment once this has been done.

![Deploying][9]

*Deploying*

![Deployed][10]

*Deployed*

From now on, once you push changes to your Github repository Azure will pick them up and deploy the project to your web site! Could it get any easier?

**UPDATE 7th Nov 2012:** After speaking to [David Fowler][4] again he remembered that you could take the Git webservice hook and enter that into the Github repository account settings.

Go to the Configure tab in Azure and copy the Git hoook URL.

![Azure Hook][11]

*Azure Hook*

Then go to your Github repo and into the Admin section and under Service Hooks enter the copied Azure URL

![Github Hook][12]

*Github Hook*

Away you go!

   [1]: http://weblogs.asp.net/scottgu/archive/2012/09/17/announcing-great-improvements-to-windows-azure-web-sites.aspx
   [2]: http://blog.jonathanchannon.com/2012/09/21/nancyfx-ravendb-nerddinner-and-me/ (NancyFX, RavenDB, NerdDinner and Me)
   [3]: http://jabbr.net
   [4]: http://twitter.com/davidfowl
   [5]: /images/blogpostimages/deploymenthistory-620x604.png (Deployment History)
   [6]: /images/blogpostimages/afterdeploymentdelete-620x527.png (Setup )
   [7]: /images/blogpostimages/setup-620x320.png (Authorize)
   [8]: /images/blogpostimages/authorize.png (Repository)
   [9]: /images/blogpostimages/deploying-initial-620x197.png (Deploying)
   [10]: /images/blogpostimages/deployed-620x202.png (Deployed)
   [11]: /images/blogpostimages/azurehook-620x135.png (Azure Hook)
   [12]: /images/blogpostimages/github-hook-620x260.png (Github Hook)
  
