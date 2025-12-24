+++

title = "Unit Testing with SqlException"
aliases = ["/2014/01/02/unit-testing-with-sqlexception/"]
tags = ["csharp","unit testing",".net"]
+++

So after a nice Christmas break I get to some code that needs some unit testing around a try/catch. Something similar to this:
```csharp
    try
    {
        myService.DoSomethingThatMightTakeALongTime();
    }
    catch (EntityCommandExecutionException ex)
    {
        var exception = ex.InnerException as SqlException;
        if (exception != null)
        {
            if (exception.Number == -2)
            {
                //Do something special
            }
        }
    }
```
<!--more-->

Obviously `myService` has a interface that can be mocked and I can tell it to throw a `EntityCommandExecutionException` when `DoSomethingThatMightTakeALongTime` is called and the constructor for that takes a string and an Exception as an inner exception.  However, you can't create a new instance of SqlException because its a sealed class therefore doing the below is impossible:
```csharp
    var fakeService = A.Fake<IMyService>();
    A.CallTo(() => fakeService.DoSomethingThatMightTakeALongTime()).Throws(new EntityCommandExecutionException("What a mistaka da maka", new SqlException());
```
You can't create your own exception class and inherit off SqlException to get around it that way either.  You could use `System.Runtime.Serialization.FormatterServices.GetUninitializedObject` to give you a `SqlException` but that won't have the `Number` property assigned to -2.  You could also setup a method in your test class that tries to connect to a non existant db that times out after 1 second but again that won't give you the Number property you may want plus its a lot of ugly and unnecessary code in a unit test project.  

## How did you do it?

So after browsing all the stackoverflow answers and comments I came up with a solution that worked which I thought I'd share so here it is:
```csharp
    private SqlException GetSqlException()
    {
        SqlErrorCollection collection = Construct<SqlErrorCollection>();
        SqlError error = Construct<SqlError>(-2, (byte)2, (byte)3, "server name", "error message", "proc", 100, (uint)1);
    
        typeof(SqlErrorCollection)
            .GetMethod("Add", BindingFlags.NonPublic | BindingFlags.Instance)
            .Invoke(collection, new object[] { error });    
        
        var e = typeof(SqlException)
            .GetMethod("CreateException", BindingFlags.NonPublic | BindingFlags.Static, null, CallingConventions.ExplicitThis, new[] { typeof(SqlErrorCollection), typeof(string) }, new ParameterModifier[] { })
            .Invoke(null, new object[] { collection, "11.0.0" }) as SqlException;
    
        return e;
    }
    
    private T Construct<T>(params object[] p)
    {
        return (T)typeof(T).GetConstructors(BindingFlags.NonPublic | BindingFlags.Instance)[0].Invoke(p);
    }
 ```   
You can then amend the previous mocking code to look like this:
```csharp
    var fakeService = A.Fake<IMyService>();
    A.CallTo(() => fakeService.DoSomethingThatMightTakeALongTime()).Throws(new EntityCommandExecutionException("What a mistaka da maka", GetSqlException());
```
As you can see it uses reflection to create instances of all the sealed classes required and it also calls sealed methods to assign properties ie/adding the error instance to the collection instance.  You'll see that the -2 value is the first argument in the parameters used to construct the SqlError object so if you're interested in using the Number property on the exception thats where to change it.

## Conclusion

This approach works and allows me to test my code but all in all its not particualry elegant and the following gif can sum up what we've learnt from sealed methods and classes and thats they're *nasty*: 

![Nasty](https://i.imgur.com/pR3tklc.gif)
