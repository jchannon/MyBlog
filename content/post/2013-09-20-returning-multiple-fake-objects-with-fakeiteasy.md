+++

title = "Returning multiple fake objects with FakeItEasy"
tags = ["fake it easy","oss","unit testing","integration testing","c#",".net"]
+++
I was recently writing some unit tests where I needed to test that multiple calls to an interface returned different objects.  

With [FakeItEasy][2] this is easy:

    A.CallTo(() => myInterface.GetSomething(1)).Returns(new Something())

All very nice, but now if I have multiple calls to `myInterface` I have to execute the above statement 'x' amount of times:

    [Fact]
    public void Should_Do_Something()
    {
      var myInterface = A.Fake<IApplication>();
      A.CallTo(() => myInterface.GetSomething(1)).Returns(new Something());
      A.CallTo(() => myInterface.GetSomething(2)).Returns(new Something());
      A.CallTo(() => myInterface.GetSomething(3)).Returns(new Something());
      
      var result = sut.DoSomething(myInterface);
      
      Assert.Equal("Super Duper", result);
    }
<!--more-->

There is a tidier way to do the above where you can return specific objects and its called `ReturnsLazily`.  Lets take a look at this:


    public class Employee
    {
        public string Name { get; set; }
    }

    public interface IEmployeeRepository
    {
        Employee GetEmployeeById(int id);
    }

    public class App
    {
        private readonly IEmployeeRepository employeeRepository;

        public App(IEmployeeRepository employeeRepository)
        {
            this.employeeRepository = employeeRepository;
        }

        public string GetNamesAsCsv(int[] ids)
        {
            var employees = ids.Select(id => employeeRepository.GetEmployeeById(id).Name);
            return string.Join(",", employees);
        }
    }

    public class AppTests
    {
        [Fact]
        public void AppReturnsNamesAsCsv()
        {
            //Given
            var employees = new Dictionary<int, Employee>
            {
                { 1, new Employee { Name = "Moss"} },
                { 2, new Employee { Name = "Roy"} },
            };

            var fakeRepository = A.Fake<IEmployeeRepository>();
            A.CallTo(() => fakeRepository.GetEmployeeById(A<int>.Ignored))
                .ReturnsLazily<Employee, int>(id => employees[id]);

            var app = new App(fakeRepository);

            //When
            var result = app.GetNamesAsCsv(employees.Keys.ToArray());

            //Then
            Assert.Equal("Moss,Roy", result);
        }
    }

We have an `Employee` object, a `IEmployeeRepository` which returns an `Employee` object and an App that returns a CSV.  We then want to test this and make sure we get back a CSV from multiple objects.

So we set our fake setup and say that when `GetEmployeeById` is called we want to return a specific object.  Our App class will call `GetEmployeeById` twice with the id of 1 and 2.  This is done by passing in `employees.Keys.ToArray()` to our GetNamesAsCsv method under test. 

When this is called with the id we want to return specific objects `.ReturnsLazily<Employee, int>(id => employees[id]);`

This says we want to return an Employee and the argument in the repository call is an int.  We can then use that to return a specific object based on that id which is where the `Dictionary<int, Employee>` comes in handy.  Based on the key it will return either an Employee called Moss or Roy.  Our `GetNamesAsCsv` will then join Moss & Roy together as a CSV and we can assert that our method works.

Hope that helps someone!

[1]: http://blog.jonathanchannon.com/2013/09/11/comparing-object-instances-with-fakeiteasy/
[2]: https://github.com/FakeItEasy/FakeItEasy
