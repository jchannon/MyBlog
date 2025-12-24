+++

title = "Modifying the bash prompt and adding Git completion to terminal"
aliases = ["/2014/06/06/modifying-bash-adding-git-auto-completion-to-terminal/"]
tags = ["osx","terminal","bash","git"]
+++
At work we use Git and I use [Console2][1] to control my terminal envrionments eg/Git Bash, Powershell, Dos and when using Git I can type part type a git command press tab and it will auto complete the command or offer suggestions to commands.  By default on OSX this behaviour is not present and it frustrated me enough to go and find out how to enable that behaviour.

Fire up your terminal and type in this command:
```bash
    curl https://raw.githubusercontent.com/git/git/master/contrib/completion/git-completion.bash -o ~/.git-completion.bash
``` 
This will download a git completion file into your home folder to a hidden file called git-completion.bash.

If the file ~/.bash_profile does not already exist create it with the following command.
```bash 
    touch ~/.bash_profile
```
Now open it and paste this in:
```bash
    if [ -f ~/.git-completion.bash ]; then . ~/.git-completion.bash; fi
```
Now if you type a git command and press tab, BOOM!, you have auto complete for Git!

<!--more-->

Also by default if you're in a directory that has a git repository inside it will not show you the branch you're on.  Again in Console2 in Windows it does however we can get the same functionality.

Open the .bash_profile and paste the below in, save and reopen your terminal and bingo:
```bash
    # Git branch in prompt.
    parse_git_branch() {
        git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/ (\1)/'
    }
    export PS1="\u@\h \W\[\033[32m\]\$(parse_git_branch)\[\033[00m\] $ "
```
A few days later whilst I was using Console2 I wanted to have the date/time in my prompt so I know when I last used the git command.  If you look at the code above you'll see the PS1 variable which controls what you prompt will look like.  The variables in there eg\ `\W` all mean different things. Here's a [link][2] to explain them.

So in Console to I executed `echo $PS1` which showed me my current settings. I used the above link to help me and I added the datetime with a color. 

Before :  `\[\033]0;$MSYSTEM:${PWD//[^[:ascii:]]/?}\007\]\n\[\033[32m\]\u@\h\[\033[33m\]\w$(__git_ps1)\[\033[0m\]\n\ \[\033[0m\]$ `

After :  `\[\033]0;$MSYSTEM:${PWD//[^[:ascii:]]/?}\007\]\n\[\033[32m\]\u@\h\[\033[33m\]\w$(__git_ps1)\[\033[0m\]\n\[\033[31m\]\t \[\033[0m\]$ `

Now if this is all a bit much for you I was told about [iTerm2][4], a OSX terminal replacement and [Oh My Zsh][3] a way to configure your terminal that provides lots of plugins and themes.

Hope this is helpful for someone.

[1]: http://sourceforge.net/projects/console/files/
[2]: http://www.cyberciti.biz/tips/howto-linux-unix-bash-shell-setup-prompt.html
[3]: https://github.com/robbyrussell/oh-my-zsh
[4]: http://www.iterm2.com/#/section/home
