+++

title = "Understanding F# applicatives and custom operators"
tags = ["OSS","fsharp"]
+++
After discussing something with Ian Russell he suggested I take some time to read through another fine [blog post](https://www.softwarepark.cc/blog/2019/12/8/functional-validation-in-f-using-applicatives) he has written and understand F# applicatives and custom operators.  I found myself in familiar territory when reading F# blog posts and it's something similar to the five stages of grief. Nod, Nod, I understand what's going on, Umm, WTF is going on.  As Ian did in his [Intro to F#](https://www.softwarepark.cc/blog/2019/9/12/introduction-to-functional-programming-in-f) series he sets out a simple domain problem and goes about how to address it.  We want to return a `ValidatedUser` from a function but if the user fails validation we return a list of validation errors.

The code in the blog post was pretty self explanatory until, it wasn't, which I have pasted below:

<!--more-->

```fsharp
type UnvalidatedUser = {
    Name : string
    Email : string
    DateOfBirth : string
}

type ValidatedUser = {   
    Name : string
    Email : string
    DateOfBirth : DateTime
}

type ValidationFailure =
    | NameIsInvalidFailure
    | EmailIsInvalidFailure
    | DateOfBirthIsInvalidFailure

let (|ParseRegex|_|) regex str =
   let m = Regex(regex).Match(str)
   if m.Success then Some (List.tail [ for x in m.Groups -> x.Value ])
   else None

let (|IsValidName|_|) input =
    if input <> String.Empty then Some () else None

let (|IsValidEmail|_|) input =
    match input with
    | ParseRegex ".*?@(.*)" [ _ ] -> Some input
    | _ -> None

let (|IsValidDate|_|) (input:string) =
    let (success, value) = DateTime.TryParse(input)
    if success then Some value else None

let validateName input = // string -> Result<string, ValidationFailure list>
    match input with
    | IsValidName -> Ok input
    | _ -> Error [ NameIsInvalidFailure ]

let validateEmail input = // string -> Result<string, ValidationFailure list>
    match input with
    | IsValidEmail email -> Ok email
    | _ -> Error [ EmailIsInvalidFailure ]

let validateDateOfBirth input = // string -> Result<DateTime, ValidationFailure list>
    match input with
    | IsValidDate dob -> Ok dob //Add logic for DOB
    | _ -> Error [ DateOfBirthIsInvalidFailure ]

let apply fResult xResult = // Result<('a -> 'b), 'c list> -> Result<'a,'c list> -> Result<'b,'c list>
    match fResult,xResult with
    | Ok f, Ok x -> Ok (f x)
    | Error ex, Ok _ -> Error ex
    | Ok _, Error ex -> Error ex
    | Error ex1, Error ex2 -> Error (List.concat [ex1; ex2])

let (<!>) = Result.map
let (<*>) = apply

let create name email dateOfBirth =
    { Name = name; Email = email; DateOfBirth = dateOfBirth }

let validate (input:UnvalidatedUser) : Result<ValidatedUser,ValidationFailure list> =
    let validatedName = input.Name |> validateName
    let validatedEmail = input.Email |> validateEmail
    let validatedDateOfBirth = input.DateOfBirth |> validateDateOfBirth
    // create validatedName validatedEmail validatedDateOfBirth
```

As you can see, there is commented out code on the last line because he has lined up the 3 arguments that are required to call the `create` function but calling it as-is won't work because the function takes in `string,string,DateTime` and we have `Result<string, ValidationFailure list>, Result<string, ValidationFailure list>,Result<DateTime, ValidationFailure list>`.  As we know from my [previous blog post](https://blog.jonathanchannon.com/2020-06-28-understanding-fsharp-map-and-bind/) we can use the `Result.map` function to do this sort of thing.  

I will skip to the solution to this and work backwards because this is where I started to scratch my head a lot! Luckily the F# Software Foundation slack channel helped a lot in particular [Paul Blasucci](https://twitter.com/pblasucci)

```fsharp	
create
    |> Result.map <| validatedName
    |> apply <| validatedEmail
    |> apply <| validatedDateOfBirth
```

From the [last blog post](https://blog.jonathanchannon.com/2020-06-28-understanding-fsharp-map-and-bind/) I showed how to call functions in a chain of functions where `Result` types needed to be unwrapped and their values passed to the next function.  So my first thought looking at this was `validatedName` is a value not a function so how is `Result.map` working? I also didn't quite understand the precedence of `|>` and `|<` how that worked.  As part of my investigation, or some may say my learning and understanding, I was told Don Syme regretted making the back pipe and that using forward and back pipes together can make code unreadable.  The take away there is to be careful about it's usage.  The good thing here is that we only have one usage of it but it still didn't make sense to me.  So I tried to split it up:


```fsharp
let foo = create |> Result.map <| validatedName
```

I still didn't quite get it, `foo` is a type of `Result<(string -> DateTime -> ValidatedUser), ValidationFailure list>` which means it's taken the name argument and now wants the email and date of birth passed to it.  I understood partial application but still it didn't click.  I went back to the [previous blog post](https://blog.jonathanchannon.com/2020-06-28-understanding-fsharp-map-and-bind) and looked at what the function signature of `Result.map` is.  It takes in a function and a `Result<'a,'b>`.  If the `Result` is `OK` it calls the passed in function with the unwrapped `Result` of `'a` and returns a `Result` type of `Ok(fn a)` otherwise it returns `Error e` Here's the code for it: 

```fsharp
let map mapping result = match result with Error e -> Error e | Ok x -> Ok (mapping x)
``` 

I then went back to the line of code after being informed that `|<` will always get called after `|>`.  So what we have is `create` is passed in as the function to call in `Result.map` and the `Result` type is the `validatedName` variable. PARTIAL APPLICATION!!! Ok I get it now!

So once I could see what was happening it was time to understand what the `apply` function was doing.  The first argument is a `Result` type whose generic args were a function and a list of validation failures, the second argument was a `Result` type whose generic args were a value and a list of validation failures. What `apply` does is match the two Result types together to check for `(Ok, Ok)` or `(Ok, Error)` etc and on success call the unwrapped function of the first arg with the unwrapped value of the second arg.

What confused me here was F# compiler magic.  Now I knew about partial application but what I didn't understand was that when you assign a variable by calling a function using partial application the resulting type is not the result of the function being called. It's just a type of the function with one less argument to call, the compiler knows when to call the actual function once all arguments have been passed to it.  What the function is doing is chaining argument calls to a partial application function.  So we can see:

```fsharp
let foo = create |> Result.map <| validatedName // Result.map create validatedName
let bar = foo |> apply <| validatedEmail // apply foo validatedEmail
let baz = bar |> apply <| validatedDateOfBirth // apply bar validatedDateOfBirth
```

`baz` now is the final result of a call to execute the `create` function.

We can then remove the `let`s above and get to the final solution I mentioned previously:

```fsharp
create
    |> Result.map <| validatedName
    |> apply <| validatedEmail
    |> apply <| validatedDateOfBirth
```

As mentioned above it's advised not to use back pipes and so what we could end up with is :

```fsharp
create <!> validatedName <*> validatedEmail <*> validatedDateOfBirth
```

If like me you were totally confused by this then please see Ian's [blog post](https://www.softwarepark.cc/blog/2019/12/8/functional-validation-in-f-using-applicatives) for a full explanation but here's my take away.  

As we saw above the apply function takes an ["elevated"](https://fsharpforfunandprofit.com/posts/elevated-world) function and ["elevated"](https://fsharpforfunandprofit.com/posts/elevated-world) value and then calls the function with the value and returns an elevated result. So we know in long hand version we have:

```fsharp
apply (apply (Result.map create validatedName) validatedEmail) validatedDateOfBirth
```

We can also use operators to replace function names to tidy things up so we end up with:

```fsharp
let (<!>) = Result.map
let (<*>) = apply
```

And we can make the above look like:

```fsharp
(<*>) ((<*>) ((<!>) create validatedName) validatedEmail) validatedDateOfBirth
```

This hopefully all makes sense, but now a slight lesson in math notation which blew my mind.  We know the signature `1 + 1 = 2`. However, `+` is actually a function that takes two numbers, so in that regard what you have known since you were aged three should look like `+ 1 1` if we were to apply common programming signatures.  Interestingly, you could also call the `+` function like `1 1 +`.  Where the `+` sits in the signature is called notation.  Typically programming languages will use "prefix notation" `function arg1 arg2` and some may use "postfix notation" `arg1 arg2 function` and arithmetic generally uses "infix notation" `arg1 function arg2`.  However, in F# you can use "infix notation" which looks like the typical `1 + 1` signature which is `let add x y = x + y`. If we replace `x + y` knowing that the `+` is the function we can go from "prefix notation" `(<!>) create validatedName` to "infix notation" `create <!> validatedName` and apply it to our functions above.  As we apply the calls to our infixed functions what we end up with is:

```fsharp
create <!> validatedName <*> validatedEmail <*> validatedDateOfBirth
```

This looks much neater than ``apply (apply (Result.map create validatedName) validatedEmail) validatedDateOfBirth`` but it does take a bit of learning and re-thinking to work out how the final solution `create <!> validatedName <*> validatedEmail <*> validatedDateOfBirth` actually works.  I know this has been quite a learning curve for me but thankfully there are resources, people in the F# community and colleagues (thanks Ian!) that are keen to help and I thank them very much for this!

