+++

title = "Modifying files within Git history"
tags = ["git","github","sublime text 2","st2"]
+++

If you have been doing code changes and committing as you go and then look back at the changes you may see something you don’t like the look of. Assuming no-one has a copy of your code changes you can go back and modify the files at a certain point in time within your commit history.

I use Git Bash by default but the editor sucks compared to Sublime Text so first things first lets setup the Git editor.

For Sublime Text run this in the command line:
	
	git config --global core.editor "'C:/Program Files/Sublime Text 2/sublime_text.exe'"

Next up is finding the commit id you want to go back to, to edit:

	git log

Make a note of the parent commit id of the commit you want to edit.

<!--more-->

Run this:

	git rebase --interactive 1185cb0de5d5e5b4c79f83a0c51ed06a5d22d7c4^

This will open Sublime Text and you’ll see lines similar to:

	pick d3adb33 My Commit message
	pick d5bdb67 Other Commit message

Change “pick” to “edit” on the commit you want to modify, save and exit

You can then make the changes to your files and when ready run:

	git commit --all --amend

Sublime Text will open again so you can edit the commit message, just save, exit and run:

	git rebase --continue

We’re done!

Your previous commit has been amended and you’re back to where you were with the latest commits ready to be pushed.  
