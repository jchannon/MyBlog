+++

title = "Understanding F# map/bind"
tags = ["OSS","fsharp"]
+++
This blog post aims to explain map/bind in F# in a code only example. It took me a while so I'm writing it up here so I can come back to it and re-read it for the 100th time most likely!
<!--more-->
```fsharp
let add x y =
    x + y

let subtract x y =
    x - y

let multiply x y =
    x * y

let divide x y =
    try
        Ok(y / x) //This could blow up with DivideByZero exception
    with ex -> Error ex

let homeRolledMap fn result = 
    match result with
    | Ok s -> Ok(fn s)
    | Error f -> Error f

let homeRolledBind fn result =
    match result with
    | Ok s -> fn s
    | Error f -> Error f

[<EntryPoint>]
let main argv =
    //Understanding Result<int,exn>

    add 10 5 |> printfn "10+5 is %i"
    subtract 10 5 |> printfn "10-5 is %i"
    multiply 10 5 |> printfn "10*5 is %i"
    
    let divResult = divide 5 10
    //We have to pattern match the result because it won't be an int it will be Result<int,exn>
    match divResult with
    | Ok res -> printfn "10/5 is %i" res
    | Error err -> printfn "oops"

    //Let's chain some method calls together

    //add wants two integer inputs but because we called divide which returned Result<int,exn>
    //we need to call Result.map to match on the success value of a call to divide and then call add and then return a Result type
    //because once we have a Result type in the chain we have to continue with that
    let mapRes =
        multiply 10 10
        |> divide 2
        |> Result.map (add 50)
    match mapRes with
    | Ok res -> printfn "10*10/2+50 is %i" res
    | Error err -> printfn "oops"

    //An example of why that is beneficial is because if we call divide 0 this will also return a Result<int,exn> but this time it will have errored
    //map here will recognise that it doesnt have a success value but an exn/failure value and not call the success function and it will do this numerous times based on the
    //numerous functions we call
    let mapRes =
        multiply 10 10
        |> divide 0
        |> Result.map (add 50)
        |> Result.map (subtract 10)
        |> Result.map (add 5)
    match mapRes with
    | Ok res -> printfn "10*10/0+50-10+5 is %i" res
    | Error err -> printfn "oops %A" err

    //divide wants two integer inputs but because we called divide previously which returned Result<int,exn>
    //we need to call Result.bind to match on the success value of a call to divide and then call divide but then NOT to return a Result type as divide returns us a Result type already
    //if we called Result.map instead of bind we'd get back Result<Result<int,exn>,exn>
    let mapRes =
        multiply 10 10
        |> divide 2
        |> Result.bind (divide 5)
    match mapRes with
    | Ok res -> printfn "10*10/2/5 is %i" res
    | Error err -> printfn "oops %A" err


    //what would it look like if we didnt have map/bind types?

    //Once you hit divide you will have to pattern match the result and break up the flow of chained function calls
    let multiRes = multiply 10 10 |> divide 2
    match multiRes with
    | Ok res ->
        let newres = res |> add 50
        printfn "10*10/2+50 is %i" newres
    | Error err -> printfn "oops %A" err

    //But what if you want subsequent calls to divide, you'll have to split up the pattern matching which is ugly
    let multiRes = multiply 10 10 |> divide 2
    match multiRes with
    | Ok res ->
        let newres =
            res
            |> add 50
            |> divide 2
        match newres with
        | Ok subsequentres -> printfn "10*10/2+50/2 is %i" subsequentres
        | Error err -> printfn "oops %A" err
    | Error err -> printfn "oops %A" err


    //What if you wanted to call divide 5 times, nested hell!
    let firstRes = multiply 10 10 |> divide 2
    match firstRes with
    | Ok res ->
        let secondRes =
            res
            |> add 50
            |> divide 2
        match secondRes with
        | Ok res ->
            let thirdRes =
                res
                |> subtract 10
                |> divide 2
            match thirdRes with
            | Ok res ->
                let fourthRes =
                    res
                    |> add 80
                    |> divide 2
                match fourthRes with
                | Ok res ->
                    let fifthRes =
                        res
                        |> add 25
                        |> add 5
                        |> divide 2
                    match fifthRes with
                    | Ok res -> printfn "10*10/2+50/2+80/2+25+5/2 = %i" res
                    | Error err -> printfn "oops %A" err
                | Error err -> printfn "oops %A" err
            | Error err -> printfn "oops %A" err
        | Error err -> printfn "oops %A" err
    | Error err -> printfn "oops %A" err



    //To understand how map/bind works and allow us to write more terse code we could roll our own functions to cope with all the pattern matching
    //and see what a map/bind looks like
    let homeRolled =
        multiply 10 10
        |> divide 2
        |> homeRolledMap (add 50)
        |> homeRolledBind (divide 2)
        |> homeRolledMap (subtract 10)
        |> homeRolledBind (divide 2)
        |> homeRolledMap (add 80)
        |> homeRolledBind (divide 2)
        |> homeRolledMap (add 25)
        |> homeRolledMap (add 5)
        |> homeRolledBind (divide 2)

    //Luckily as we know there is map and bind on the Result module that we can use rather than rolling our own
    let res =
        multiply 10 10
        |> divide 2
        |> Result.map (add 50)
        |> Result.bind (divide 2)
        |> Result.map (subtract 10)
        |> Result.bind (divide 2)
        |> Result.map (add 80)
        |> Result.bind (divide 2)
        |> Result.map (add 25)
        |> Result.map (add 5)
        |> Result.bind (divide 2)

    match res with
    | Ok res -> printfn "10*10/2+50/2+80/2+25+5/2 = %i" res
    | Error err -> printfn "oops %A" err


    0 // return an integer exit code

```