+++

title = "Keeping SQL Data Organised in Integration Tests"
aliases = ["/2013/09/12/keeping-sql-data-organised-in-integration-tests/"]
tags = ["integration testing","oss","community",".net","xunit"]
+++
In my latest project I had kept my solution tidy with my main app project, my unit test project and integration test project. I tend to stick with a naming convention such as MainApp, MainApp.Tests.Unit & MainApp.Tests.Integration.

I had begun writing my integration tests for a repository that hits the database and returns data. Currently it was one method being called in the repository.  [xUnit][1] allows you to setup any test dependencies in the constructor of your test class.  It also allows you to do any tidying up in a Dispose method if you implement IDisposable although this is [frowned upon][2].  However I felt for my needs I would implement this.

I  was creating data in the database in the constructor which will get called before the test runs, retrieving data in the test, asserting and then deleting all data and resetting the auto-incrementing from the tables in the Dispose method.

This was working perfectly until I wanted to test another method on my repository.

I now needed to add data for my new method but realised if I added different data to the database in the constructor, I would be creating unnecessary data unrelated to the test.

My options were to move the constructor logic into separate methods and then call the methods in the test or have separate test classes per method in the repo.  Both were a not an ideal solution and quite frankly verbose, ugly and not best practice.
<!--more-->
## The Solution

I started playing with the attributes on my tests to see if xUnit offered me something and was chuffed to find the `BeforeAfterTestAttribute`.  This does exactly what it says on the tin.  Its an abstract class that you inherit from for your own implementation and overide the `Before` and `After` methods;

    public class RepoMethod1BeforeAfter : BeforeAfterTestAttribute
    {
        public override void After(MethodInfo methodUnderTest)
        {
          //Insert data into tables
        }
        
        public override void Before(MethodInfo methodUnderTest)
        {
          //Drop data from tables
        }
    }
    
    [Fact]
    [RepoMethod1BeforeAfter]
    public void RepoMethod1_Should_be_Awesome()
    {
      //Check it's awesome
    }
    
You can then put an attribute on the relevant tests that need to have specific data inserted/deleted and it keeps the design of your test class follow best practices as well as not implementing IDisposable.

The only thing I can spot as a slight issue is remembering to put the attribute on your tests but I think that'll be quite obvious when your tests start failing!

[1]: http://xunit.codeplex.com/
[2]: http://xunit.codeplex.com/wikipage?title=Comparisons&referringTitle=Home#note2
