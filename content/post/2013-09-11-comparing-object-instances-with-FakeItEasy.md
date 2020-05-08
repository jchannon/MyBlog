+++

title = "Comparing object instances with FakeItEasy"
tags = ["unit testing","oss","community",".net","fake it easy"]
+++
I had the task of writing a new application recently and of course I chose [Nancy][1].  One of the many great reasons is the testing capabilites it offers (For more on that see [this][2] great series of articles).

The basics of a test with Nancy looks like this:

    [Fact]
    public void Should_return_status_ok_when_route_exists()
    {
        // Given
        var bootstrapper = new DefaultNancyBootstrapper();
        var browser = new Browser(bootstrapper);
         
        // When
        var result = browser.Get("/", with => {
            with.HttpRequest();
        });
            
        // Then
        Assert.Equal(HttpStatusCode.OK, result.StatusCode);
    }

You set up a bootstrapper, this can be your live one or an inherited version of your live one with dependencies changed to mocks for example or use the `ConfigurableBootstrapper`.

<!--more-->

In my scenario I was testing that when a route got called something on an interface was called with an instance of an object.

I had the object available in the test, I passed it to my fake interface and asserted that the call happened.

Here's an example of what the route and test might look like:

    public class ApiModule : NancyModule
    {
        public ApiModule(IScheduleRepository scheduleRepository)
            : base("/api/schedules")
        {
            Post["/"] = parameters =>
            {
                var result = this.BindAndValidate<Schedule>();
               
                if (!ModelValidationResult.IsValid)
                {
                    return HttpStatusCode.UnprocessableEntity;
                }

                var conflict = scheduleRepository.CheckForConflict(result);

                return HttpStatusCode.Created;
            };
        }
    }

    [Fact]
    public void Creating_Schedule_Entry_Should_Check_For_Conflicts()
    {
        //Given
        var fakeScheduleRepository = A.Fake<IScheduleRepository>();
        var model = GetModel();
    
        var browser = new Browser(GetBootstrapper(scheduleRepository:fakeScheduleRepository));
    
        //When
        var result = browser.Post("/api/schedules", with =>
        {
            with.HttpRequest();
            with.JsonBody(model);
        });
    
        //Then
        A.CallTo(() => fakeScheduleRepository.CheckForConflict(model)).MustHaveHappened();
    }
    
The test is using [xUnit][3] and [FakeItEasy][4] for creating fakes/mocks or whatever you choose to call them and the test will pass if the call to `fakeScheduleRepository.CheckForConflict` was called with the model object.

## The test fails!

The reason for the test failing is because...? That's right, the object that is passed into the call on IScheduleRepository in the route is different to the one in the test.

We could override Equals on our model object but that's not a great approach, we could hope that if we create an `IEqualityComparer<Schedule>` we could pass that in somewhere but from what I've seen that's not possible so how do we get our test to pass?

FakeItEasy has a nice fluent API that allows you to do the following:

    [Fact]
    public void Creating_Schedule_Entry_Should_Check_For_Conflicts()
    {
        //Given
        var fakeScheduleRepository = A.Fake<IScheduleRepository>();
        var model = GetModel();
    
        var browser = new Browser(GetBootstrapper(scheduleRepository:fakeScheduleRepository));
    
        //When
        var result = browser.Post("/api/schedules", with =>
        {
            with.HttpRequest();
            with.JsonBody(model);
        });
    
        //Then
        A.CallTo(() => fakeScheduleRepository.CheckForConflict(A<Schedule>.That.Matches(x => BodyModel(x)))).MustHaveHappened();
    }
    
    private bool BodyModel(CreateKeywordSchedule match)
    {
        return match.DateFrom == new DateTime(2013, 01, 01, 12, 00, 00) &&
               match.DateTo == new DateTime(2013, 01, 02, 12, 00, 00);
    }

Spot the difference? So instead of passing our original model object in we told FakeItEasy to expect a type of Schedule that matches an an object that is of type Schedule.  We wrote a `Func<Schedule,bool>` to determine what a match is when comparing objects.

So when the test runs and `fakeScheduleRepository.CheckForConflict(model)` is executed FakeItEasy will assert that the argument passed into `fakeScheduleRepository.CheckForConflict()` matches the property values we decided to match on in our BodyModel method.  

This way if the model we send into the route has the property values that match those we have defined in BodyModel we can pass our test.

Its a much neater way without having to write `IEqualityComparer` or anything over the top and hope you found this useful.

[1]: http://nancyfx.org
[2]: http://www.marcusoft.net/2013/01/NancyTesting1.html
[3]: http://xunit.codeplex.com/
[4]: https://github.com/FakeItEasy/FakeItEasy
