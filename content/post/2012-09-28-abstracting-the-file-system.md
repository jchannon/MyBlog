+++

title = "Abstracting the File System"
tags = ["file system","SRP","oss","System.IO.Abstractions"]
+++

Following on from my post about [OSS][1] I thought I would illustrate how cool OSS can be.

The day before that post was published I was working on a program that required the file system. All you good developers are going to know that the file system is a dependency and dependencies are bad and this post will probably be a bit like preaching to the choir however I thought it was worth posting.

So you have a a method similar to this:

	public void DoSomethingCool()
	{
	  //do some stuff now write to file
	
	  FileInfo f = new FileInfo("C:\Mytext.txt")
	  using(StreamWriter w = f.CreateText())
	  {
	    w.WriteLine("This blog post is cool");
	    w.Close();
	  }
	}

You are writing to a file to record something and need to test your method. Remember, unit tests are supposed to be fast. Typically anything that writes to a database or a file system will be slow however, we also have the problem that our method is now dependent on the file system and dependencies are bad. Wouldn’t it be handy if we could make FileInfo a representation of an interface.

<!--more-->

Simplest way is to hit F12 in Visual Studio and see what interface FileInfo implements.

We get this:

	public sealed class FileInfo : FileSystemInfo

Hmmm, OK lets hit F12 on FileSystemInfo and we get

	public abstract class FileSystemInfo : MarshalByRefObject, ISerializable

So it looks like the FileInfo class does not implement any interface so now we’re stuck, we have a hard coded dependency and our unit tests are going to be slow.

The answer is we’ll have to create an interface for all the methods and properties that we are going to use that are in FileInfo. Not too bad I suppose, we’re only using CreateText in the example above so we create:

	public interface IFileInfo
	{
	  StreamWriter CreateText();
	}

We can now pass in IFileInfo to our class’ constructor and hopefully use it like so:

	public class MyClass
	{
	  private readonly IFileInfo fileInfo;
	
	  public MyClass(IFileInfo fileInfo)
	  {
	    this.fileInfo = fileInfo;
	  }
	
	  public void DoSomethingCool()
	  {
	    //do some stuff now write to file
	
	    using(StreamWriter w = fileInfo.CreateText())
	    {
	      w.WriteLine("This blog post is cool");
	      w.Close();
	    }
	  }
	}

We could then use [Moq][3] in our unit test to successfully mock the filesystem and ensure our method writes to the file:

	[TestFixture]
	public class MyTestClass
	{
	  [Test]
	  public void DoSomethingCool_WhenCalled_WritesToFile()
	  {
	    //Arrange
	    var fileMock = new Moq.Mock<IFileInfo>();
	    var myClass = new MyClass(fileMock.Object);
	       
	    //Act
	    myClass.DoSomethingCool();
	
	    //Assert
	    fileMock.Verify(x =&gt; x.CreateText());
	  }
	}

As you’ve probably spotted there are three issues here. Firstly FileInfo expects a path in its constructor which we haven’t supplied, secondly all we’ve actually verified in our test is that CreateText is called and finally DoSomethingCool still has a dependency on StreamWriter which uses the underlying file system. The solution is to abstract the StreamWriter yourself so the unit test is testing that data is written to the file and do something about the FileInfo dependency.

It could be done, not a problem, but wouldn’t it be nice if someone has already done that for you? Luckily they have and its called [System.IO.Abstractions][4].

A quote from the website "_At the core of the library is IFileSystem and FileSystem. Instead of calling methods like File.ReadAllText directly, use IFileSystem.File.ReadAllText. We have exactly the same API, except that ours is injectable and testable._"

What this means is that you can now do:

	public class MyClass
	{
	    private readonly IFileSystem fileSystem;
	
	    public MyClass(IFileSystem  fileSystem)
	    {
	      this.fileSystem = fileSystem;
	    }
	
	    public void DoSomethingCool()
	    {
	      //do some stuff now write to file
	
	      var file = fileSystem.FileInfo.FromFileName("C:\Mytext.txt");
	      using(IStreamWriter writer = file.CreateText())
	      {
	        writer.WriteLine("This blog post is cool");
	        writer.Close();
	      }
	    }
	}
	
	[TestFixture]
	public class MyTestClass
	{
	    [Test]
	    public void DoSomethingCool_WhenCalled_WritesToFile()
	    {
	      //Arrange
	      var filesystemMock = new Moq.Mock<IFileSystem>();
      	  var fileinfoFactory = new Moq.Mock<IFileInfoFactory>();
      	  var fileinfoMock = new Moq.Mock<FileInfoBase>();
      	  var streamWriterMock = new Moq.Mock<IStreamWriter>();
	
	      var myClass = new MyClass(filesystemMock.Object);
	
	      fileinfoMock.Setup(x => x.CreateText()).Returns(streamWriterMock.Object);
	      fileinfoFactory.Setup(x => x.FromFileName("C:\Mytext.txt")).Returns(fileinfoMock.Object);
	      filesystemMock.Setup(x => x.FileInfo).Returns(fileinfoFactory.Object);
	
	      //Act
	      myClass.DoSomethingCool();
	
	      //Assert
	      streamWriterMock.Verify(x => x.WriteLine("This blog post is cool"));
	    }
	}

You can now still verify your calls to file are getting called but on top of that you can verify the content written to file all without the need for a file system.

Now some of you may not like all the mocks arranged in the unit test so luckily for you System.IO.Abstractions has a set of its own mocks that you can use. This means we have to modify our class slightly to make the filesystem public so we can read what is written to file:

	public class MyClass
	{
	    public readonly IFileSystem filesystem;
	
	    public MyClass(IFileSystem filesystem)
	    {
	      this.filesystem = filesystem;
	    }
	
	    public void DoSomethingCool()
	    {
	      //do some stuff now write to file
	
	      using(var w = filesystem.FileInfo.FromFileName("C:\\Mytext.txt").CreateText())
	      {
	        w.WriteLine("This blog post is cool");
	        w.Close();
	      }
	    }
	}
	
	[TestFixture]
	public class MyTestClass
	{
	    [Test]
	    public void DoSomethingCool_WhenCalled_WritesToFile()
	    {
	      //Arrange
	      var fileData = new MockFileData("");
	      var fileSystem = new MockFileSystem(new Dictionary<string, MockFileData>
	      {
	          { "C:\\Mytext.txt", fileData }
	      });
	
	      var myClass = new MyClass(fileSystem);
	        
	      //Act
	      myClass.DoSomethingCool();
	
	      //Assert
	      MockFileInfoFactory factory = (MockFileInfoFactory)myClass.filesystem.FileInfo;
	      var result = factory.FileInfo.OpenText().ReadToEnd();
	      Assert.AreEqual("This blog post is cool", result);
	    }
	}


Its a matter of preference which you prefer but either way hopefully this illustrates how and why you should abstract the file system

One thing to point out is that these file system calls should be in their own class and that DoSomethingCool should be calling something like IFileSystemLogger.Log() which is where the file system calls should be. This illustrates the [Single Responsibility Principle][5]

**Some of the functionality outlined above is not available yet in the master branch of System.IO.Abstractions but it has been submitted as a pull request from me so hopefully it will be merged soon. I’ve already had one PR merged and it was quick, built and released on NuGet within the hour. I encourage you to take a look at this project and try and contribute. There are a few quirks, for example, I wanted to use Moq v4 syntax in my tests but couldn’t work it out, not sure if that’s me or System.IO.Abstractions. Anyhow the more people that get involved the better it will become.**

   [1]: http://blog.jonathanchannon.com/2012/09/25/is-oss-good-for-your-career/
   [3]: https://code.google.com/p/moq/
   [4]: https://github.com/tathamoddie/System.IO.Abstractions
   [5]: http://en.wikipedia.org/wiki/Single_responsibility_principle
  
