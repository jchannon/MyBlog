+++
title = "Using AI in a C# app"
tags = ["AI",".NET","csharp"]
+++

Following on my from my previous [introduction to AI](https://blog.jonathanchannon.com/2025-12-23-introduction-to-ai/) post I thought I would now introduce how to use the AI providers in a C# application.

We may want to build some AI features inside a new or existing app and so where do we start as a C# developer?

This blog post will go through a fairly simple example just to illustrate the "how" and then you can adapt it for your needs and maybe I'll add some more thought out examples in other posts.

<!--more-->

So first things first, you're going to need to get your credit card out and pay for a OpenAI/Anthropic subscription. You'll then need to log into your account and create an API key. You'll also want to take note of the available models to use and the endpoint we can call from our app.

The basics of our communication with the relevant LLM will be via HTTP, it is as simple as that. We send a message to the LLM and we get a response back!

So once we have the vital information to make the request we can build that into our app and bind that data into a C# class:

```csharp
public class AiOptions
{
    public string Provider { get; set; } = "Anthropic";

    public string ApiKey { get; set; } = string.Empty;

    public string ApiEndpoint { get; set; } = "https://api.anthropic.com/v1/messages";

    public string Model { get; set; } = "claude-sonnet-4-5-20250929";

    public int MaxTokens { get; set; } = 2000;
}
```

As this is a sample app I will use a console app to illustrate the point and so from our entrypoint we want to make a HTTP call and write out the response from the LLM. Being good developers we will also put the relevant HTTP call into a class that is responsible for that.

```csharp

public class AnthropicAiService(AiOptions options) : IAiService
{
    public async Task<string> AskAi(string userPrompt)
    {
        var client = new HttpClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", options.ApiKey);

        client.DefaultRequestHeaders.Add("x-api-key", options.ApiKey);
        client.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");

        var requestBody = new
        {
            model = options.Model,
            max_tokens = options.MaxTokens,
            messages = new[]
            {
                new { role = "user", content = userPrompt }
            }
        };

        var content = new StringContent(
            JsonSerializer.Serialize(requestBody),
            Encoding.UTF8,
            "application/json");

        var response = await client.PostAsync(options.ApiEndpoint, content, CancellationToken.None);

        var responseBody = await response.Content.ReadAsStringAsync();
        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(responseBody);
        }

        var result = JsonSerializer.Deserialize<AnthropicResponse>(responseBody);

        if (result?.Content == null || result.Content.Length == 0)
        {
            throw new InvalidOperationException("Empty response from LLM");
        }

        return result.Content[0].Text;
    }

    private record AnthropicResponse(
        [property: JsonPropertyName("content")]
        ContentBlock[] Content
    );

    private record ContentBlock(
        [property: JsonPropertyName("text")] string Text
    );
}
```
So here, we create a HTTP client (yes, we should use `IHttpClientFactory` but this is a demo) and set the authorization header with our API key. We also set some headers and the start to build up a body to POST to Anthropic.

In the body we set the model, the number of tokens to use and a user prompt. The user prompt is the thing we want to ask the LLM. The body is then serialized and sent to Anthropic. 

We then check the response and deserialize it to a known format and then return the response from our method. We can then write this out to `Console.WriteLine`.

Done!

To not be bias I have a similar class for talking to OpenAI:

```csharp
public class OpenAiService(AiOptions options) : IAiService
{
    public async Task<string> AskAi(string userPrompt)
    {
        var client = new HttpClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", options.ApiKey);

        var requestBody = new
        {
            model = options.Model,
            input = new[]
            {
                new { role = "user", content = userPrompt }
            }
        };

        var content = new StringContent(
            JsonSerializer.Serialize(requestBody),
            Encoding.UTF8,
            "application/json");

        var response = await client.PostAsync(options.ApiEndpoint, content, CancellationToken.None);
        var responseBody = await response.Content.ReadAsStringAsync();
        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(responseBody);
        }


        var result = JsonSerializer.Deserialize<OpenAiResponse>(responseBody);

        if (result?.Outputs == null || result.Outputs.Length == 0)
        {
            throw new InvalidOperationException("Empty response from LLM");
        }

        if (result.Outputs.Length == 1)
        {
            return result.Outputs[0].Contents![0].Text;
        }

        return result.Outputs[1].Contents![0].Text;
    }

    private record OpenAiResponse([property: JsonPropertyName("output")] Output[] Outputs);

    private record Output(
        [property: JsonPropertyName("content")]
        Content[]? Contents);

    private record Content([property: JsonPropertyName("text")] string Text);
}
```

OpenAI was the first one I played around with and found that in the body you could specify system prompts and user prompts. The system prompt acting like an agent you could send in eg/ "Imagine you are a dotnet upgrade wizard and know all about how to update C# applications to the latest version of dotnet" and then the user prompt may be something like "I want to upgrade this current C# app, what would I need to do?" You can also use the `store` property and `metadata` property in the request body which indicates you want to store logs of requests made to the LLM. The metadata is simply a `Dictionary<string,string>` so you can pass anything you want in. You will most likely want HTTP Open Telemetry instrumentation as well but if you wanted to use OpenAI dashboards for your request you can. I'm sure you can also do similar things with Anthropic.

So now you have 2 ways to call an LLM let's discuss if there is another way to do this.

Microsoft in their usual design approach have created their own nuget package which creates an interface called `IChatClient` which is intended as an abstraction that library authors can implement and then this interface can be passed across the app no matter the implementation and also interact with other AI abstractions they have created. Hmmm, `ILogger` anyone!?

So if you install `Microsoft.Extensions.AI.OpenAI` and `OpenAI` packages and then in your app add this code:

```csharp
new OpenAIClient(aiOptions.ApiKey).GetChatClient(aiOptions.Model).AsIChatClient();
```

You now have a client, from OpenAI, that has conformed to Microsoft's interface that you can use to pass in a user prompt as well as a system prompt and lots of other options.

That code looks like:

```csharp
await chatClient.GetResponseAsync(userPrompt);
```

So assuming you prefer to use Anthropic what would that code look like? Firstly, you'd need to add the `Anthropic` package to your app and then use the below code:

```csharp
new AnthropicClient(new ClientOptions { APIKey = aiOptions.ApiKey }).AsIChatClient(aiOptions.Model);
```

And there you have it. Now because both clients are `IChatClient` the calling code to get the response is the same as above:

```csharp
await chatClient.GetResponseAsync(userPrompt);
```

It seems the two big players have agreed to implement Microsoft's interface and so it would seem to make sense to follow this pattern... until it doesn't make sense and you have to use each LLM's own instance across your app.

I have bundled all the approaches above into a console app that, asks the user what approach they want to use to talk to an LLM and then based on that wire up the correct client whether that's raw HTTP or via the SDKs.

It then passes in a user prompt `Who was the predominant founder of Microsoft?` to the client and executes this in an async `Task` whilst writing out full stops to the console indicating it's waiting for the response. Once it has it, it writes it back to the console. Here's the code:

```csharp
Console.WriteLine("Hello, World! Let's ask AI some questions!");

var configuration = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .Build();

var appOptions = new AppOptions();
configuration.Bind(appOptions);

IAiService aiService = null!;
IChatClient chatClient = null!;
AiOptions aiOptions;

var message = "Would you like to use (A)nthropic HTTP or (O)penAI HTTP or (M)icrosoft OpenAI SDK or Anthropi(c) SDK?";
Console.WriteLine(message);

var userInput = Console.ReadLine()?.ToUpper();
while (userInput != null && userInput != "A" && userInput != "O" && userInput != "M" && userInput != "C")
{
    Console.WriteLine(message);
    userInput = Console.ReadLine()?.ToUpper();
}

switch (userInput)
{
    case "A":
        aiOptions = appOptions.AiOptions.Single(x => x.Provider == "Anthropic");
        aiService = new AnthropicAiService(aiOptions);

        break;
    case "O":
        aiOptions = appOptions.AiOptions.Single(x => x.Provider == "OpenAI");
        aiService = new OpenAiService(aiOptions);
        break;

    case "M":
        aiOptions = appOptions.AiOptions.Single(x => x.Provider == "OpenAI");
        chatClient = new OpenAIClient(aiOptions.ApiKey).GetChatClient(aiOptions.Model).AsIChatClient();
        break;

    case "C":
        aiOptions = appOptions.AiOptions.Single(x => x.Provider == "Anthropic");
        chatClient =
            new AnthropicClient(new ClientOptions { APIKey = aiOptions.ApiKey }).AsIChatClient(aiOptions.Model);
        break;
}


var cts = new CancellationTokenSource();

var thinkingTask = Task.Run(async () =>
{
    while (!cts.Token.IsCancellationRequested)
    {
        Console.Write(".");
        await Task.Delay(500);
    }
});

var userPrompt = "Who was the predominant founder of Microsoft?";

string response;
if (userInput == "M" || userInput == "C")
{
    var chatResponse = await chatClient.GetResponseAsync(userPrompt);
    response = chatResponse.Text;
}
else
{
    response = await aiService.AskAi(userPrompt);
}

cts.Cancel();
await thinkingTask;
Console.WriteLine();

Console.WriteLine(response);
```

Obviously there is a lot more we can do with AI in our apps but I hope this illustrates the relative simplicity in getting started of building AI into your app.

All the source code can be found in [this GitHub repo](https://github.com/jchannon/ChatClient).

P.S If you were wondering what each model returned for the question we passed it:

**Anthropic claude-sonnet-4-5-20250929**
```text
Bill Gates was the predominant founder of Microsoft. He co-founded the company with Paul Allen in 1975, but Gates served as the face of the company, was its largest individual shareholder, and led it as CEO for 25 years (until 2000). He was the primary driving force behind Microsoft's strategy and growth into one of the world's most valuable technology companies.
```

**OpenAI gpt-5.2-chat-latest**

```text
The predominant founder of Microsoft was **Bill Gates**.

Microsoft was co-founded in 1975 by **Bill Gates and Paul Allen**, but Gates is generally regarded as the primary or most prominent founder due to his long-term leadership as CEO and his central role in shaping the company’s strategy and growth.
```