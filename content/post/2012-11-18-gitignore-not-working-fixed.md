+++

title = ".gitignore not working – fixed!"
tags = ["community","git","github","oss","stackoverflow"]
+++

This happens to me too often and I always end up googling the answer so this post is probably more of a location I know I can come to find the answer, although by writing it down hopefully it may sink in that I should stop getting too excited on a new project.

### New project scenario

You’re all very excited about your new project and you think its about time you committed this to source control. Obviously you’re using [Git][1] so you initialise a new repository and commit your files. You then setup a remote repository at [Github][2] and it asks you whether you want it create a .gitignore file – you do. So now you have a repository remotely and locally. Easiest thing to do is pull from the remote, setup your remote and push to it. The other scenario might be you’ve committed locally and then realise you need to add a .gitignore file which you do and then commit.

<!--more-->

In both cases you will now see the files in your [standardised .gitignore file][3] are not being ignored. After a few head scratches you realise its because the .gitignore file should be added to your repo first before any commits.

## The solution!

Long story short you have to remove all tracked files and add them back in using the below commands

    git rm -r --cached .
    git add .
    git commit -m ".gitignore is now working"

The first line unstages and removes the paths to your files from the git index recursively.

The second line adds all your files back in but because the .gitignore is present it will not add files that should be ignored!

The final line commits all your files back to the index.

As much as I’d like to take credit for this knowledge I’m going to have to point you in the direction of the [stackoverflow post][4] that has helped me in the past.

   [1]: http://git-scm.com/
   [2]: http://github.com
   [3]: https://github.com/github/gitignore
   [4]: http://stackoverflow.com/questions/1139762/gitignore-file-not-ignoring

  
