+++

title = "The For Loop is the devil in disguise"
aliases = ["/2012/11/23/the-for-loop-is-the-devil-in-disguise/"]
tags = [".net","csharp","learning"]
+++

I recently spoke to someone about the ‘for’ loop who opened my eyes to how unstructured the ‘for’ loop is.

I have only ever used it in the traditional sense of:
```csharp
	for(int i = 0; i < 10; i++)
	{
	
	}
```
I looked into some more and thought I’d show anybody else who may not have known about this innocent little thing in the C# language. It may exist in other languages but I am explicitly talking about C#.
```csharp
	for (; ; )
	{
	  Console.WriteLine("Hi");
	}
```
For some reason this compiles and executes! Who knew? Smarter people than me obviously. What do you expect it to output?

The answer is it outputs “Hi” forever as there is nothing to determine when the loop should end however there is nothing to determine when it should start either.

<!--more-->

I continued to investigate what other weird syntax the for loop would take.
```csharp
	for (int i = 3; ; )
	{
	  Console.WriteLine("Number " + i);
	}
```
This will output “Number 3″ forever.
```csharp
	for (int i = 0; ; )
	{
	  Console.WriteLine("Hi");
	}
```
This will output “Hi” forever.
```csharp
	for (int i = 0; ; Console.WriteLine("Hi"))
	{
	
	}
```
This will output “Hi” forever.
```csharp
	for (; ; RunThis())
	{
	
	}

	private void RunThis()
	{
	  Console.WriteLine("Hi");
	}
```
This will output “Hi” forever.
```csharp
	for (int i = 0; ; Console.WriteLine("Hi"))
	{
	  Console.WriteLine(" there");
	}
```
This will output “Hi there” forever
```csharp
	for (string s = "Hi"; ; )
	{
	  Console.WriteLine(s);
	}
```
This will output “Hi” forever.

What do you think the below will do?
```csharp
	for (Initialize(); ; )
	{
	
	}

	private void Initialize()
	{
	  Console.WriteLine("Initialized");
	}
```
It actually outputs “Initliazed” and sits in an infinite loop.

The below probably does what you expect it to by looping 0-9 and exits yet still something I’d never considered doing in the past.
```csharp
	for (int i = InitializeInt(); i < 10; i++)
	{
	  Console.WriteLine(i);
	}

	private static int InitializeInt()
	{
	  return 0;
	}
```
This is a slight deviation on the above but essentially the same just with a Func
```csharp
	Func factory = () => 0;
	
	for (int i = factory(); i < 10; i++)
	{
	  Console.WriteLine(i);
	}
```
Again the below is possible and something I’d never do but still possible.
```csharp
	for (var val = Init(); val.MyInt < 10; val.MyInt++)
	{
	  Console.WriteLine(val.MyString);
	}
	
	public struct MyStruct
	{
	  public int MyInt { get; set; }
	  public string MyString { get; set; }
	}
	
	private MyStruct Init()
	{
	  return new MyStruct() { MyInt = 0, MyString = "Hi" };
	}
```
What do you think the below will do?
```csharp
	bool ok = true;
	for (; ok; )
	{
	  Console.WriteLine("Hi");
	  ok = false;
	}
```
It will enter the loop once and then exit. It acts as a normal loop just without the initialization of an int i and increasing the value of i on each iteration.

There may be some other syntaxes it will accept but I’ve not found them.

In essence the for loop has no expectations, it will execute with no arguments specified infinitely. In each 3 places of a for loop you can do pretty much what you want, I did find you couldn’t initialize an int and a string like so:
```csharp
	for (string s="Hi", int i = 0; i < 10;i++ )
	{
	
	}
```
Its only really the middle section that determines when the loop should end.

I’d never thought of using the for loop in these ways but it seems its possible for some reason. I’m starting to wonder if I’m not a good programmer for not knowing this or whether its just one of those things that’s odd but available in the language and if places like Google ask you in interview “What does this do? Does it compile?” to try and almost trick you for some reason. I’m sure there would be some problem solving argument for asking but I’m not sure what that proves as if you were a good developer you would never use it anyway.

My constant journey of learning continues.

  
