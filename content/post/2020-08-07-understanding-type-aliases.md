+++
title = "Understanding type aliases"
tags = ["OSS","fsharp","csharp"]
+++
I recently wrote a single case discriminated union which is what I wanted but was also confused why it didn't behave like a type alias and then learnt that these two are different things.

`type CustomerId = int`

`type CustomerId = CustomerId of int`

I was aware of both syntaxes and from a quick scan they look the same however they behave differently and rightly so.  As I travel the F# road there is more emphasis on creating types for your functions. I have used this approach in C# to enforce type discrimination but it seems less prevalent in the mainstream from my experience. For example think of this:

<!--more-->

```csharp
public string DoSomething(string name, int age, string address)
{
  ...
}
```

This would become:

```csharp
public string DoSomething(Name name, Age age, Address address)
{
  ...
}
```

This goes someway for example to disallow passing any random string or int value to methods throughout your domain. If everything is a int or string or any other primitive type there's nothing stopping you calling the above method like so:

`DoSomething("10 Downing St", 21, "Jon for PM").`

This would compile fine and only at runtime are you likely to spot the issue.

So with this design in mind I wanted to create a type and away I went and created `type CustomerId = CustomerId of int`. This type was passed into a function and I needed to get the underlying value to convert to SQL.  For some reason I had `type CustomerId = int` in my mind so I called `ToString()` on my type assuming that would get the underlying value. In fact what it returned was `"CustomerId 2"` ie/ a string-ified .NET object.  This didn't raise it's head until runtime however as my SQL statement failed.  Now if I had created my type as an alias and not a type eg. `type CustomerId = int` it would have worked fine. However, a type alias is just that, an alias and does not give you the design I described above. For example, 

```fsharp
type Name = string
type Age = int
type Address = string


let doSomething (name:Name) (age:Age) (address:Address) =
    age.ToString()
```

I can call the function like so `doSomething "Jon for PM" 21 "10 Downing St"` and also `doSomething "10 Downing St" 21 "Jon for PM"` and both are valid at compile time but you haven't achieved what you set out to achieve. What you actually want is:

```fsharp
type Name = Name of string
type Age = Age of int
type Address = Address of string

let doSomething (name:Name) (age:Age) (address:Address) =
    age.ToString()
```

To call this function you have to be much more explicit:

```fsharp
let res = doSomething (Name("Jon for PM")) (Age(21)) (Address("10 Downing St"))
printfn "%s" res
```

There's no way to mix up the arguments however we are still at the original issue I faced, the return value will be a string-ified .NET object. In F# to get the inner value out you have to create a module to take your type and extract the value:

```fsharp
module Age =
       let value (Age input) = input
```

We can then amend our function to call it like so:

```fsharp
let doSomething (name:Name) (age:Age) (address:Address) =
    (Age.value age).ToString()
```

Now this might seem a bit of a pain but that is because we have type safety and have to be very explicit if we want to expose that value which is no bad thing really.

