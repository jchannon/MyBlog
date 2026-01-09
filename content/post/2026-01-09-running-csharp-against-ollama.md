+++
title = "Running C# against Ollama"
tags = ["AI",".NET","csharp"]
description = "In this blog post we discuss how to use C# in an app that runs against an LLM running locally rather than in the cloud via Ollama and OllamaSharp"
+++

In my previous posts I introduced [AI concepts](https://blog.jonathanchannon.com/2025-12-23-introduction-to-ai/) and then showed how to [use AI in a C# app](https://blog.jonathanchannon.com/2026-01-06-using-ai-csharp/) using the cloud providers. In this post I want to expand on Ollama and show you how to build a chat agent in C# that runs entirely on your local machine.

<!--more-->

### Why Ollama?

I briefly mentioned Ollama in my introduction to AI post but let me go a bit further on why you might want to use it. The cloud providers like Anthropic, OpenAI and Google are great but they come with some considerations that might not suit everyone.

Firstly, there's the cost. Every time you send a prompt to the cloud you're using tokens and those tokens cost money. If you're just experimenting or learning about AI, burning through your subscription just to ask simple questions feels a bit wasteful. With Ollama everything runs locally so there's no token usage and no surprise bills at the end of the month.

Secondly, there's privacy. When you send data to the cloud you're trusting that provider with your information. Yes, many have privacy clauses stating they won't train on your data but if you're working with sensitive company information or just prefer to keep things on your own machine whilst wearing a tin foil hat, Ollama gives you that option. Everything stays local.

Thirdly, there's the offline capability. Sometimes you just want to work without an internet connection. Maybe you're on a plane, or your office internet is having one of those days, or you just prefer not to rely on external services. Ollama doesn't care about your internet connection because it doesn't need one.

The downside? You need a reasonably capable machine with a powerful GPU(s) to run these models locally. The larger the model, the more resources you'll need. The larger the model, the larger the wallet for one or many GPUs. However, for smaller models you'd be surprised how well they perform on modern hardware.

### Getting Started with Ollama

Head over to [ollama.com](https://ollama.com) and download the app for your platform. Installation is straightforward and once it's running you'll have access to a whole library of models.

You can open up a terminal and run `ollama` to see the options available, you should see something like the below:

```text
Usage:
  ollama [flags]
  ollama [command]

Available Commands:
  serve       Start ollama
  create      Create a model
  show        Show information for a model
  run         Run a model
  stop        Stop a running model
  pull        Pull a model from a registry
  push        Push a model to a registry
  signin      Sign in to ollama.com
  signout     Sign out from ollama.com
  list        List models
  ps          List running models
  cp          Copy a model
  rm          Remove a model
  help        Help about any command

Flags:
  -h, --help      help for ollama
  -v, --version   Show version information

Use "ollama [command] --help" for more information about a command.
```

You can browse the [available models](https://ollama.com/search) to see what's on offer. There's quite the selection these days - from small efficient models to larger more capable ones, coding-specific models, vision models, and reasoning models. The choice is overwhelming but the good news is you can start small.

### Choosing a Model

For getting started quickly I'd recommend Meta's Llama 3.2. It's a small but capable model that comes in 1B(illion) and 3B(illion) parameter sizes. The 3B version is the default and weighs in at around 2.0GB which means it downloads quickly and runs on most machines without breaking a sweat. You can find more details at [ollama.com/library/llama3.2](https://ollama.com/library/llama3.2).

To download and run it, open your terminal and simply run:

```bash
ollama run llama3.2
```

Ollama will download the model and drop you into an interactive chat. Have a play around with it to get a feel for what it can do.

### Building a Chat Agent in C#

So now we have Ollama running locally with a model downloaded, let's write some C# to talk to it. For this example I'll use the `OllamaSharp` NuGet package which makes the whole thing remarkably simple.

First, create a new console app and add the package:

```bash
dotnet new console -n OllamaChat
cd OllamaChat
dotnet add package OllamaSharp
```

Now here's the code to create a simple interactive chat agent:

```csharp
using OllamaSharp;

var uri = new Uri("http://localhost:11434");
var ollama = new OllamaApiClient(uri);
ollama.SelectedModel = "llama3.2";

var chat = new Chat(ollama);

Console.WriteLine("Chat with llama3.2 (type 'exit' to quit)");
Console.WriteLine();

while (true)
{
    Console.Write("You: ");
    var message = Console.ReadLine();

    if (string.IsNullOrEmpty(message) || message.ToLower() == "exit")
        break;

    Console.Write("AI: ");
    await foreach (var answerToken in chat.SendAsync(message))
        Console.Write(answerToken);

    Console.WriteLine();
    Console.WriteLine();
}
```

Let's break down what's happening here. We create an `OllamaApiClient` pointing at `localhost:11434` which is where Ollama runs by default. We then tell it which model we want to use - in this case `llama3.2`. The `Chat` class handles the conversation state for us so it remembers the context of previous messages.

The interesting bit is the `await foreach` loop. Rather than waiting for the entire response to come back before displaying it, we're streaming the tokens as they're generated. This gives that nice effect where you see the AI "typing" its response in real-time rather than staring at a blank screen waiting.

Run the app and start chatting! The code is available in [this GitHub repo](https://github.com/jchannon/OllamaSharpClient)

### Experimenting with Different Models

The beauty of Ollama is you can easily swap models. Want to try a reasoning model like DeepSeek-R1? Just change the selected model:

```csharp
ollama.SelectedModel = "deepseek-r1:8b";
```

Of course you'll need to download it first:

```bash
ollama pull deepseek-r1:8b
```

The code remains the same - only the model name changes. This makes it trivial to experiment and compare different models for your use case.

### Conclusion

And there you have it. A fully local AI chat agent running on your machine with no cloud dependencies, no token costs and no data leaving your network. The code is minimal and the setup is straightforward.

Obviously this is just scratching the surface. You could extend this to build more sophisticated applications - perhaps a coding assistant that understands your codebase, a document analyser that processes sensitive files locally, or even integrate it into your existing applications where privacy is paramount.

The AI landscape continues to evolve rapidly and having the option to run your own models locally for development and then deployed on GPU heavy VMs with network policies applicable for your app might be appealing for some with strict privacy requirements and big budgets. You could also run an AI cluster of Mac Studios on prem and use [exo](https://github.com/exo-explore/exo) something like [Tailscale](https://tailscale.com/) to open a VPN for your app and developers. There's some "interesting" ways to run your own LLMs if you wish out there.

Running your own LLM means you are reliant on open source projects and then training it for your own needs which is some upfront costs for you to maintain and there is always going to be the chance that online models like Claude/Gemini/ChatGPT will always be one step ahead in their capabilities. However, the key to all of this is options, you have the option to do whatever you want and deal with the trade-offs for either approach.
