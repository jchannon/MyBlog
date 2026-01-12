+++
title = "Agentic Semantic Data Modelling in C#"
tags = ["AI",".NET","csharp","MongoDB"]
description = "This blog posts describes how you can enable stakeholders to generate adhoc reports via the power of C# and AI. It will discuss the business cost and benefit of implementing this."
+++

Over the last few months I've been working on a feature that I think represents where software development is heading. It's a natural language query interface that allows non-technical users to ask questions about data in plain English and get back meaningful results. No SQL to write, no reports to configure, just ask a question and get an answer. The interesting bit though is how we've approached this problem and what it reveals about building trustworthy AI-powered systems.

<!--more-->

## The Problem Space

Imagine you're a sales manager at a company that manages electric vehicle charging infrastructure for housing associations. You've got contracts with multiple housing associations, each with their own sites, drivers who subscribe to chargers, orders for equipment, installation work orders, and billing records. It's a complex domain with lots of moving parts.

Now imagine it's Monday morning and your boss asks "which housing associations updated their prices on January 1st 2026?" You could fire up your database client, write some MongoDB aggregation pipeline, fiddle with the joins, and eventually get an answer. Or you could ask a sales analyst to run a report. Or you could spend 20 minutes clicking through pages of data.

What if you could just type that question into a text box and get the answer immediately?

That's what we built, and I want to show you how it works.

## The Architecture

The system is built around a pipeline of services that take a natural language question and convert it into an executable MongoDB aggregation, run that aggregation, and return both the raw results and a natural language summary. Here's the flow:

1. User enters a natural language query in the UI
2. System infers the schema from MongoDB collections
3. System loads domain relationship documentation
4. LLM generates a MongoDB aggregation pipeline
5. System validates the pipeline for safety
6. System executes the pipeline
7. System returns results + the actual aggregation (for debugging)

Let me walk through each step with code.

## Step 1: The Entry Point

The UI posts the query to our API endpoint. In our case we're using ASP.NET Core minimal APIs:

```csharp
public static void MapNaturalLanguageEndpoints(this WebApplication app)
{
    app.MapPost("natural-language/query", async (
        NaturalLanguageQueryRequest request,
        NaturalLanguageQueryOrchestrator orchestrator,
        HttpContext context,
        CancellationToken cancellationToken) =>
    {
        var userId = context.User.GetUserId();
        var response = await orchestrator.ProcessQueryAsync(
            request.Query,
            userId,
            cancellationToken);

        return Results.Ok(response);
    })
    .RequireAuthorization()
    .DisableAntiforgery();
}
```

The user's question gets passed to the `NaturalLanguageQueryOrchestrator` which coordinates all the moving parts. This is where the interesting stuff happens.

## Step 2: Schema Inference

Before we can generate a query, the LLM needs to know what data is available. We use a `SchemaInferenceService` that samples documents from each allowed collection and infers the field types:

```csharp
public async Task<MongoCollectionSchema> InferSchemaAsync(
    string collectionName,
    CancellationToken cancellationToken = default)
{
    var collection = database.GetCollection<BsonDocument>(collectionName);

    // Sample 100 documents to infer schema
    var samples = await collection
        .Find(FilterDefinition<BsonDocument>.Empty)
        .Limit(100)
        .ToListAsync(cancellationToken);

    // Get all field names across samples
    var allFields = samples
        .SelectMany(doc => doc.Names)
        .Distinct()
        .ToList();

    var fields = new Dictionary<string, string>();
    foreach (var fieldName in allFields)
    {
        var fieldValues = samples
            .Where(doc => doc.Contains(fieldName))
            .Select(doc => doc[fieldName])
            .ToList();

        fields[fieldName] = InferFieldType(fieldValues);
    }

    return new MongoCollectionSchema
    {
        CollectionName = collectionName,
        Fields = fields,
        Description = GetCollectionDescription(collectionName)
    };
}
```

The schema inference looks at actual data to determine types. A field that contains strings gets marked as "string", numbers as "number", and so on. We also include business descriptions for each collection:

```csharp
private static string GetCollectionDescription(string collectionName)
{
    return collectionName.ToLowerInvariant() switch
    {
        "partners" => "Organizations that own charging sites and manage subscriptions",
        "drivers" => "End users who have charger subscriptions and orders",
        "sites" => "Physical locations where chargers are installed",
        "chargers" => "Physical charging equipment and hardware",
        "contracts" => "Agreements between partners and the platform",
        _ => $"Data collection: {collectionName}"
    };
}
```

These descriptions give the LLM business context about what each collection represents in the domain.

## Step 3: Loading Domain Knowledge

Here's where it gets really interesting. Schema alone isn't enough. The LLM needs to understand the relationships between entities and the ubiquitous language of the domain. We maintain a markdown file that documents these relationships:

```markdown
### Contract

**Collection:** Contracts

**Relationships:**
- Belongs to Partner (via PartnerId)
- Belongs to Site (via SiteUid)
- References Installer (via InstallerUid)
- Defines pricing and products for a specific partner/site combination
- Users may refer to "admin" or "shared" products. Admin relates to
  the PrivateSubscription object and shared relates to the SharedSubscription object.
- When users ask for the admin price this relates to the
  PrivateSubscription.SubscriptionFee property.
```

This file contains all the domain-specific knowledge that you can't infer from raw schema. It tells the LLM that "admin price" means `PrivateSubscription.SubscriptionFee`, or that a "housing association" is actually stored as a "Partner" in the database. This is critical.

The system prompt builder loads this markdown file and combines it with the inferred schemas:

```csharp
private static string BuildSystemPrompt(string schemaContext)
{
    var relationshipData = File.ReadAllText("MongoDB_Entity_Relationships.md");

    return $@"You are a MongoDB query expert. Generate aggregation pipelines based on user questions.

Below is some database schema information:
{schemaContext}

Here is some database relationship information to help you link fields and collections together:
{relationshipData}

Instructions:
1. Analyze the user's question and determine which collection to query
2. Generate a valid MongoDB aggregation pipeline as a JSON array
3. Use appropriate operators: $match, $group, $project, $sort, $limit, $lookup, $unwind
4. Return your response in this exact format:


{{
  ""collection"": ""collection_name"",
  ""pipeline"": [
    {{ ""$match"": {{ ... }} }},
    {{ ""$group"": {{ ... }} }}
  ]
}}


Important:
- Do NOT use $out or $merge operators (read-only queries)
- Keep queries efficient and focused
- Use proper MongoDB syntax
- Always specify the collection name
- Use case-insensitive matching
- Return valid JSON only, no additional explanation";
}
```

## Step 4: LLM Generation

With the system prompt built, we call OpenAI to generate the aggregation pipeline:

```csharp
public async Task<(BsonDocument[] Pipeline, string CollectionName)> GeneratePipelineAsync(
    string naturalLanguageQuery,
    Dictionary<string, MongoCollectionSchema> availableSchemas,
    CancellationToken cancellationToken = default)
{
    var schemaContext = BuildSchemaContext(availableSchemas);
    var systemPrompt = BuildSystemPrompt(schemaContext);
    var userPrompt = $"Generate a MongoDB aggregation pipeline for this question: {naturalLanguageQuery}";

    var response = await CallOpenAiAsync(systemPrompt, userPrompt, cancellationToken);

    var (collectionName, pipeline) = ParseLlmResponse(response, availableSchemas.Keys.ToList());

    return (pipeline, collectionName);
}
```

The LLM returns JSON that contains both the collection to query and the pipeline to run. We parse this response and extract the structured data as `BsonDocument` arrays that the MongoDB driver can execute.

## Step 5: Validation

Now here's the critical bit. We can't just trust the LLM to generate safe queries. What if it generates a `$merge` operation that modifies data? What if it queries a collection we don't want users to access? What if it generates an unbounded query that could bring down the database?

We validate every generated pipeline:

```csharp
public (bool IsValid, string? ErrorMessage) ValidatePipeline(BsonDocument[] pipeline, string collectionName)
{
    // Validate collection name
    if (!_options.AllowedCollections.Contains(collectionName))
    {
        return (false, $"Collection '{collectionName}' is not allowed");
    }

    // Validate each stage
    foreach (var stage in pipeline)
    {
        var stageOperator = stage.GetElement(0).Name;

        // Check for dangerous operators
        if (DangerousOperators.Contains(stageOperator))
        {
            return (false, $"Operator '{stageOperator}' is not allowed");
        }

        // Check for unknown operators
        if (!AllowedOperators.Contains(stageOperator))
        {
            return (false, $"Operator '{stageOperator}' is not recognized or allowed");
        }
    }

    return (true, null);
}
```

We maintain explicit allow-lists of operators and collections. The validation also checks that `$limit` values don't exceed configured maximums and that `$lookup` operations only reference allowed collections.

## Step 6: Execution

Once validated, we execute the pipeline with additional safety measures:

```csharp
public async Task<BsonDocument[]> ExecutePipelineAsync(
    string collectionName,
    BsonDocument[] pipeline,
    CancellationToken cancellationToken = default)
{
    var collection = database.GetCollection<BsonDocument>(collectionName);

    // Add timeout and limit if not present
    var pipelineWithLimits = EnsureSafeLimits(pipeline);

    var aggregateOptions = new AggregateOptions
    {
        MaxTime = TimeSpan.FromMilliseconds(_options.QueryTimeoutMs),
        AllowDiskUse = false // Prevent expensive disk-based operations
    };

    var results = await collection
        .Aggregate<BsonDocument>(pipelineWithLimits, aggregateOptions)
        .ToListAsync(cancellationToken);

    // Ensure we don't return too many documents
    if (results.Count > _options.MaxResultDocuments)
    {
        results = results.Take(_options.MaxResultDocuments).ToList();
    }

    return results.ToArray();
}
```

We enforce timeouts, disable disk usage for aggregations, and cap the number of returned documents. These safety measures ensure that even if the LLM generates an inefficient query, it won't bring down the system.

## Step 7: The Response

The orchestrator ties it all together and returns a response that includes three critical pieces:

```csharp
return new NaturalLanguageQueryResponse
{
    Success = true,
    NaturalLanguageSummary = summary,
    Results = results,
    GeneratedPipeline = pipeline.ToJson(new JsonWriterSettings { Indent = true })
};
```

- **Natural Language Summary**: The LLM generates a human-readable summary of the results
- **Results**: The raw data from MongoDB
- **Generated Pipeline**: The actual aggregation that was executed, formatted nicely

That last bit is crucial. By showing users the actual MongoDB pipeline that ran, we give them visibility into what the system did. This serves two purposes: debugging when things go wrong, and education. Users can see how their questions map to database queries.

## The Trust Problem

Now let's talk about the elephant in the room. How do you know if the data is correct?

The sales manager runs a query and gets back a list of housing associations that updated prices on January 1st. But how does she know this is the right data? Maybe the LLM misunderstood "updated prices" and checked the wrong field. Maybe it got the date comparison backwards. Maybe it queried the wrong collection entirely.

This is the fundamental challenge with AI-powered systems. They're powerful but fallible. Here's how we approach trust:

### 1. Transparency

By returning the generated pipeline, users can inspect what actually ran. If you know a bit about MongoDB, you can verify the query makes sense. If not, you can share it with someone who does.

### 2. Iteration on Domain Knowledge

That markdown file with relationship documentation? It needs constant refinement. Every time we discover that the LLM misinterprets a query, we update the documentation to be more explicit. Over time, this builds a comprehensive domain model that improves accuracy.

### 3. Validation and Safety

The validation layer prevents catastrophically wrong queries. It won't stop the LLM from selecting the wrong field, but it will stop it from doing anything dangerous.

### 4. Logging and Audit

We log every query, the results, and whether it succeeded:

```csharp
await LogQueryAsync(userId, naturalLanguageQuery, collectionName,
    pipeline.ToJson(), true, null, results.Length, stopwatch.ElapsedMilliseconds);
```

This creates an audit trail. If users report incorrect results, we can review the history, see what pipeline was generated, and improve the system prompt.

### 5. Human Verification

At the end of the day, users need to apply judgment. The system is a tool that makes data access faster and easier, but critical business decisions should still involve verification. Think of it like a junior analyst who's fast but needs supervision.

## The Ubiquitous Language Challenge

The biggest lever for improving accuracy is enriching the domain knowledge that goes into the system prompt. In a housing association management system, there's a whole vocabulary:

- "Housing association" = Partner in the database
- "Admin price" = PrivateSubscription.SubscriptionFee + InfrastructureFee
- "Shared price" = SharedSubscription.SubscriptionFee + InfrastructureFee
- "Driver" = end user with a subscription, not a device driver

If the system prompt doesn't include this mapping, the LLM will guess. Sometimes it will guess right, sometimes not. The more comprehensive your ubiquitous language documentation, the better the results.

This is actually a benefit in disguise. Building this system forces you to codify your domain knowledge. You end up with a document that's valuable beyond just powering the AI feature. It becomes onboarding material for new developers, a reference for the whole team, and a forcing function for domain-driven design.

## Practical Considerations

A few things I learned building this:

### Token Costs

Every query hits the LLM twice - once to generate the pipeline, once to generate the summary. With a comprehensive system prompt including all schemas and documentation, you're looking at potentially thousands of tokens per request. This adds up. We found it helpful to cache schemas (they don't change often) and to be judicious about what goes into the system prompt.

### Prompt Engineering

The quality of results is directly tied to prompt quality. We went through many iterations of the system prompt, adding constraints, examples, and clarifications. Getting the LLM to consistently return parseable JSON in the right format took work. The instruction "Return valid JSON only, no additional explanation" was added after the LLM kept adding helpful commentary outside the JSON block.

### Error Handling

LLMs fail in interesting ways. Sometimes they hallucinate collection names that don't exist. Sometimes they generate syntactically valid JSON that's semantically nonsense. Sometimes they just refuse to answer. Your validation and error handling needs to be robust.

### Performance

Schema inference on large collections can be slow. We cache schemas and only refresh them periodically. The LLM calls take 1-3 seconds typically. The MongoDB execution is usually fast if the pipeline is well-formed. Overall, queries complete in 3-5 seconds which feels acceptable for an ad-hoc analysis tool.

## Conclusion

Building an agentic semantic data interface is fascinating work. It sits at the intersection of domain-driven design, database optimization, prompt engineering, and user experience design. When it works well, it feels like magic. When it doesn't, you learn a lot about the gaps in your domain model.

The trust problem is real and shouldn't be dismissed. These systems are powerful but require careful design around transparency, validation, and human oversight. They're not going to replace database administrators or data analysts anytime soon, but they can democratize data access in meaningful ways.

If I were to summarize the key lessons:

- Invest heavily in your domain documentation - it's the foundation of accuracy
- Always show users what the system did, don't hide it
- Validate, validate, validate - never trust LLM output blindly
- Build audit trails so you can learn from failures
- Set clear expectations about verification and trust

The code examples above are simplified from our production system, but they capture the essential architecture. If you're building something similar, I hope this gives you a good starting point.

The full approach can be found in the Helix codebase, specifically:
- NaturalLanguageQueryOrchestrator.cs:1
- OpenAiQueryGenerationService.cs:1
- SchemaInferenceService.cs:1
- MongoQueryValidationService.cs:1
- MongoQueryExecutionService.cs:1

As AI capabilities continue to improve, I suspect we'll see more of these semantic interfaces in enterprise software. The challenge isn't just the technology, it's building systems that users can trust. That's the interesting problem to solve.
