+++
title = "Introduction to AI"
tags = ["AI",".NET","csharp"]
+++

If you can't beat them, join them is probably the best quote to sum up my experience with AI.

We have known for a long time AI is changing the way we work however, we all know how unreliable it is and personally I have seen that for a long time when it "helpfully" suggests code suggestions as I type. I have also seen
how unreliable it is when using an AI Assistant to do something for me.

My conclusions have been "this thing is not going to take away people's jobs or take over the world, it's absolutely useless".

However, as time has gone on and models have got better and clearly AI is not going away, I decided I better try and learn some fundamentals of AI and try to find ways in which I can test it out.

Therefore, this post will be an introduction for those still in the "this is useless" mindset which might help explain some concepts and how to use it so it can be more effective for you.

<!--more-->

### Context is King

The one thing that AI needs to be helpful is context and this perhaps was one of my initial frustrations with it and to an extent still is. My first approach to AI many months ago was treating it as a silver bullet to all things.

I used the AI Assistant in my IDE to ask it to do something with no context. I believed that if this thing was so brilliant as I kept hearing, I should ask it to do something, and it should just work. The reality was it didn't just do what I wanted.
In fact, the results were terrible and I kept going around in circles thinking, I should try this AI thing -> This is rubbish -> I should try this AI thing -> This is rubbish.

As the results were rubbish, I learnt more that context is king and you had to tell the AI what you are trying to do, why you are doing this and from a perspective of why you are doing it. You had to explain a good chunk of information up front for
it to "know" what tasks you wanted it to do. My initial reaction to that was "I'm not going to spend time writing innate context when I could have written the code myself in the same time" and I think there is still some validity
in that thinking and therefore it all depends on what you are asking AI to do but also another factor is, who the user of AI is.

If you are a non-technical user of AI and/or a non-developer all you have is the ability to give it context, explain what you are trying to build and why you are building it and who the users of the thing you are building are to give as much context
as possible. If you have no control of the code, then you only have one entry point and so all you can do is give it prompts and instructions and context and keep repeating that until you get what you want. The only downside here is, how do you know as 
a non-developer if what it has produced is correct and bug free and security compliant? I think there's a whole other blog post about this subject and what this means for the future. At this point in time, this situation reminds me of the early 2000's
when your CEO would scoff at your estimates and proclaim they will ask their neighbour's 14 year old who knows computers and could make something in their bedroom and have it ready by tomorrow. We have to keep an eye on non-technical developers vibe coding
solutions proclaiming this will fix all of our problems when they have no idea what their AI buddy has produced.

As a developer you know how to write the code and so this context feels almost pointless if you feel you can write the code quicker. Therefore, you have to judge at what point should you spend time writing context vs just writing the code. I think if you 
find yourself repeating certain things a lot, you can spend time and write some context and then get the AI to do this for you. Alternatively, you can also use AI to not write the code but use it in a "plan" mode where it will describe what it would do
if you asked it to write the code. This can be useful if you want a "rubber duck" to help you confirm your ideas or get some feedback on them. This leaves you to quickly ascertain if your approach is good, adapt if need be but frees you to write the code.

This brings us to an interesting point in terms of when do we use AI for writing code. The key to a successful implementation that is written by AI is to have developers who know if the code it has generated is correct. Therefore, you still need to employ
developers with the skills they have tuned over the years to inspect and iterate on what the AI agents are writing. There is no getting away from employing highly skilled professionals, but what does it mean for these people. If they are to simply review 
code and learn how to prompt AI to generate the correct code they are losing an often underappreciated aspect to programming - art. It may not be obvious to the non-developer, but writing code can be a creative outlet for developers. They have a problem and
they want to find a solution. There may be many ways in which that solution can be written in code. Part of the art is writing the most efficient or most readable code to solve the problem. There is elegance in a solution and so if a developer's role becomes
baby-sitting AI you lose a lot of the passion developers have for their job. Does this mean that a lot of people will leave the industry if they can no longer write the code with the passion and elegance they strive for? Can we teach AI to write elegantly?
If we can teach AI to write elegantly, are we still losing the game because part of the joy and art in programming is the human aspect of thinking and pondering the best solution?

### Too much context is bad

Whilst we can't get away from the fact that we cannot trust what AI produces and we need highly skilled developers to check what it produces we also can't trust AI to execute tasks with freedom unless you have unlimited amount of money. The way AI generally works
is that you pay for a subscription to the various AI providers, for example, Anthropic(claude), Google(gemini), Microsoft(copilot) and with that subscription you get a certain amount of tokens each month. The more complicated tasks or more in-depth questions you 
ask AI the more tokens get used. Let me introduce you to MCP servers. MCP servers are essentially servers that provide AI tools for a certain context. For example, let’s say you want to ask your AI agent about movies. The LLM the AI agent is using may have some 
good knowledge about movies but what if you could provide it more information. If you had an MCP server that allowed you to list movies, search movies, find the cast, find the technical details of the movie, explore the reviews, explore the ratings etc you could plug
this into your AI agent and so when you asked it about movies you could tell it to look at the MCP server and it would use the tooling in the MCP to hopefully give a more accurate response. If you wanted to write a C# MCP server yourself, take a look at this [GitHub repo](https://github.com/modelcontextprotocol/csharp-sdk?tab=readme-ov-file#getting-started-server) to get started.

Let's assume you come across a [list of curated MCP servers](https://github.com/modelcontextprotocol/servers?tab=readme-ov-file#-third-party-servers) that gives you access to pretty much every technology out there and you configure your AI agent to include all MCP servers
because obviously the more servers it can question the more accurate response it will give then this would seem a sensible thing to do. However, by doing what seems potentially a rational thing to do means that by querying all the MCP servers you instantly burn through all 
your tokens. And so, unless you have unlimited money you are not going to want to follow this approach and so you need to know before you submit your questions or thoughts to AI what MCP servers the AI may want to use so there is more effort put back onto the user to already
know part of the answer before asking. This issue is so prevalent that Anthropic themselves have put out a [blog post](https://www.anthropic.com/engineering/advanced-tool-use) highlighting the issue and suggesting a "fix" to this approach. I will let you decide how reliable that fix is.

Another interesting issue I have heard about is when you give AI large amounts of instructions and context that it confuses itself, seems to lose context and produce bad results. For example, let’s assume you use AI in the "plan" mode and you have an idea to build something
and go back and forth on the idea and how the solution might look and how you would approach it in terms of architecture and how the code would follow certain patterns. Once you have all this context and instructions on what to do and what not to do, turning the AI into agent mode where you want it to execute the plan it simply fails. 

Granted this is anecdotal evidence but it is something to keep in mind around AI. Not enough context = bad, Too much context = bad.

### Skills

So, we've discussed MCP servers, now let's move onto how AI uses Skills. Skills are markdown files and other resources that allow AI to carry out very specialised tasks that you may want to repeat numerous times so by packaging up all the instructions and other material AI
needs to execute this task it allows us to componentise certain aspects of our AI workflow.

Agent Skills have become a standard (yes, another one) format originally developed by Anthropic that hopefully all AI providers adopt so no matter which AI you use you can create Skills and easily share your Skills within a team or amongst friends. You can 
read a [blog post by GitHub](https://github.blog/changelog/2025-12-18-github-copilot-now-supports-agent-skills/) that outlines how GitHub Copilot works with Skills. 

To create Skills, you can put them in your existing `.github/skills` directory or `.claude/skills` directory. 

For more information on how to create them take a look [here](https://agentskills.io/home) and [here](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)

What you may be wondering is whether or not you can replace MCP servers with Skills and I think that's a fair question and it certainly seems possible but at the moment they are separate in that MCP servers make tools available whilst Skills describe in a certain and specific
scenario how to do something that may make use of those of tools in the MCP server. Things move very quickly in the AI world so we may see both of these ideas converge at some point.

### Agents

When I first started learning about AI and all the things within this area Agents always seemed to be the one that sounded large and scary when in fact, they aren't really that different to Skills. Agents are simply broader than Skills. We know that Skills are used for very
specific tasks that can be described, packaged and shared with people whereas Agents are at a higher level. If you think of everything as a hierarchy you could have Agents that may use multiple Skills that may use multiple MCP servers. Agents are simply a way for you to give context
on something you want your AI to do. So, as an example, let's say you want an AI Agent to upgrade your `dotnet` version across your codebase. To do that you could give it the context telling it that "you are an expert in .NET and you love helping upgrading projects to the latest .NET release". 
You would want to tell it to scan all `*.csproj` files and `*.yml` files that may be used in CI/CD and to list the current versions used. You would want it to know what the current latest version is by looking at the .NET website. You would want it to do one project at a time and to start with the project with the least dependencies. You may want it to upgrade any dependencies that support the latest .NET version.

You can write a markdown file telling it all of the above things you want it to do and describe exactly what you want it to do and not do and use natural language to do write these descriptions. You could also tell it to use certain Skills if you wished as well.

Then using whichever AI tool you use you can then attach your new agent to your tool and tell it to upgrade your repository to the latest .NET version and based on the instructions in your markdown file it will know exactly how to do this.

Luckily if this exact scenario sounds interesting [there is an agent that you can use to do this](https://github.com/github/awesome-copilot/blob/main/agents/dotnet-upgrade.agent.md?plain=1).

In fact, there is a list of many agents that you could use for your various tasks found [here](https://github.com/github/awesome-copilot/tree/main/agents).

Whilst we're talking about Agents, there is also a way to give AI context once without having to give in depth information up front. Let's say you are a developer and you work in a repository that contains all your code, maybe some docs or diagrams (unlikely I know because who wants to write those) and you have structured your repository with discipline. To save some time, tokens and money, if you wanted to use AI to ask it how to do something or plan something regarding your codebase you could give it some context about the repository via an AGENTS.md file. Think of it as a README.md but for AI and the fun thing is you could use AI to write your AGENTS.md file! If you have a large repository, you can even create multiple AGENTS.md files per folder for example and all AI tools should know to look for these files to gain some understanding and context about your
repository. That's right it's another standard and lots more information can be found at the [website](https://agents.md/) to aid you and your AI tool of choice.

### Local LLM & Alternative Tools

I've been writing about how to use AI etc all based on the premise you will be using the AI tools supplied by Anthropic(claude), Google(gemini), Microsoft(copilot) and whilst in most cases this will probably be true there may be those people who want to interact with a LLM offline. So, let
me introduce you to [Ollama](ollama.com). This is an app that runs on your machine and allows you to configure which models you want to use to ask or plan things with. Everything is offline and so will not be using up tokens as part of a subscription that you may pay for with one of the other services mentioned above. Obviously running this all locally means you will need a reasonably beefy machine to do this although you could use a smaller LLM to do so. There are also other things to consider in that whilst tokens are not used up each LLM will have a maximum token input, so for example you couldn't copy and paste War and Peace into it and then ask it to give you a summary of it.

One thing that might be of use is refining a LLM for your purpose. Again, this can be done with ChatGPT online as part of a subscription but if you wanted to do this locally you have that option. You could take a base LLM and then add instructions like we saw above when creating agents and give it information like "you are a .NET upgrade expert" and then build and run that LLM on your machine. Alternatively, you could take a base LLM, have a RAG service (Retrieval Augmented Generation) that is fed your internal documentation for example, which is then chunked and put into a vector database and then when you ask Ollama, "what were our sales figures for October and what was our profit and loss figures for the same period" it will take your query, parse it throught the LLM and use your RAG service to retrieve the correct information and this can all be done on your machine without worrying about uploading all your company information into the cloud (although many of the services above do have privacy clauses in the contract that state they won't train their models on your data).

If you prefer to use open-source tooling and like to support open-source projects, then [OpenCode](https://opencode.ai/) may be for you. This is a terminal, IDE and desktop app that is a coding agent. It offers free models as well as integration with Anthropic(claude), Google(gemini), Microsoft(copilot) if you have accounts with them or you can use models it has tested and benchmarked for coding and pay them directly to support the project. The tooling also supports things like AGENTS.md, MCP, Skills and Agents and other tools like LSP. More info can be found [here](https://opencode.ai/docs).

### Conclusion

I've tried to outline some of the terms and tools that you may hear of when dipping your toe into the AI world and some tips on how to get the best out of AI and there are many other blog posts that can take you further down that road. In fact, something came up on this subject on [Hacker News](https://opencode.ai/docs) recently which you may find useful to get the best out of your tools. 

However, there are some things I'd like to cover in conclusion of this post and that is the impact of AI going forward. 

If you don't already know the environmental impact of using AI is huge, in fact [one article](https://www.businesstoday.in/technology/news/story/ai-now-consumes-more-water-than-the-global-bottled-water-industry-new-study-reveals-507978-2025-12-24) states that AI uses more water than the global bottled water industry. This is because the data centres that house the AI servers need a lot of cooling and the cooling systems draw water from local reservoirs or aquifers. In fact, it is estimated one chat session with AI can cost 500ml of water. Obviously in a world of climate change do we want to contribute to making things worse by using up water asking menial questions to ChatGPT like "List 10 movies where the lead actor was born in the 1970s".

Like I alluded to above where do we see AI in our workflows going forward if all we want to do is speed up tasks but risk the emergence of AI tooling talking to AI tooling. This will mean people will learn to game the AI system and actually in some cases cost us humans more time trying to find the right candidate for the job or teaching our children how to best plagiarise and submit essays or write social media/news bots to spread incorrect and potentially harmful data. If we also allow AI to write code and then have AI review the code can we trust these tools are going to keep our companies running? We need developers to review the code these tools make but why would a developer want to baby-sit AI tooling when most of their job has been removed of understanding problems, finding solutions and elegantly writing the code for those solutions? If we are to remove the art in programming, then what's the point of developers staying in the industry?

There is no doubt that for non-developers firing up an AI tool and asking it to build an app or website seems like magic but if you are a one-man team or a very small team do you trust what it develops for you? What if you get stuck and AI can't fix things for you? As a consumer should we have the right to know if the software we use was generated by AI? How do we know uploading our confidential data is secure and not open to hackers to abuse? Like I said above we still need developers to verify this code and therefore at this point in time I feel that whilst you can get it to generate tools for you, these tools are for fun or prototypes not something you bet your whole company on.

There is no doubt AI models are getting better and better but keeping up to date with which model is best for X is almost an impossible task and new ways of doing things to improve AI results seem to change month to month, but it is clear it is getting better and less up-front context is needed. In fact, I recently created a new theme for this blog purely generated by AI. It needed a few pointers but on the whole it did most of it by itself and a few times I asked it to generate PRs to add X or fix Y by the power of GitHub running on my iPhone and I was not needed to write any code. It is very impressive, that can't be taken away but it is an interesting time in which we live and I wait to see where AI takes us and the human and environment impact it will have.