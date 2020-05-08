+++

title = "The many approaches to Entity Framework"
aliases = ["/2013/03/04/the-many-approaches-to-entity-framework/"]
tags = [".net","asp.net mvc","csharp","entity framework","github","SRP"]
+++

I recently had a need to look into using [Entity Framework (EF)][1] for a [ASP.NET MVC][2] project. In the past I have always used [PetaPoco][3] as my ORM of choice and with hearing nothing but bad things about EF I was a little sceptical. There are various ways to use EF, Code First being one of them and the easiest from what I can gather and luckily the approach I needed to get up to speed on. This means you can define your model in code and EF will turn that into tables in your database.

The way I was going to see how EF could be architected in an application was to create a MVC application that provided CRUD capabilities for Customers, Orders and Products. Nothing complicated but something enough to see how EF could be fitted in with a MVC application. I would also like to use a unit of work pattern such as instantiate a model class, set some properties and call a save method. I would also like to keep the architecture well enough abstracted so that another ORM could take its place easily enough if needs be.

I will list the various approaches I took investigating the how EF could be integrated. They are not in any chronological order.

<!--more-->

## Approach One

My first approach was to create a generic repository, IRepository, to handle the the various crud methods needed and also a Save method. The implementation, Repository would take a IUnitOfWork constructor dependency which would expose the model type ie.Customer,Order, Product and allow EF to perform the CRUD actions.

	public class Repository : IRepository where T : class
	{
	    private readonly IUnitOfWork unitOfWork;
	    private readonly DbSet entitySet;
	
	    public Repository(IUnitOfWork unitOfWork)
	    {
	        this.unitOfWork = unitOfWork;
	        entitySet = unitOfWork.GetEntitySet();
	    }
	
	    public void Add(T entity)
	    {
	        entitySet.Add(entity);        
	    }
	}
	
	public interface IUnitOfWork
	{
	    void SaveChanges();
	    DbSet GetEntitySet() where TEntity : class;
	}
	
	public OrderController(IRepository orderRepository, IRepository customerRepository )
	{
	    this.orderRepository = orderRepository;
	    this.customerRepository = customerRepository;
	}

There are two issues with this approach. Firstly, the IUnitOfWork exposes EF specific members which I don’t really want and secondly when a repository calls Save it will in turn call the SaveChanges method on EF which will save any changes across all repositories. This is because we have one EF database context per request as handled by our IOC container. To get around the saving issue we could have a new context per instance of the repository but I don’t think that is a good approach.

The full code can be seen on the master branch at Github – [https://github.com/jchannon/EntityFrameworkMVC/tree/master/EntityFrameworkMVC
](https://github.com/jchannon/EntityFrameworkMVC/tree/master/EntityFrameworkMVC)

## Approach Two

Another approach we could use is to remove IUnitOfWork altogether, keep the Save method on the repository but inject the context into the repository and still inject the repositories into the controllers.

	public class Repository : IRepository where T : class
	{
	    private readonly EntityFrameworkMvcDbContext context;
	    private readonly DbSet entitySet;
	
	    public Repository(EntityFrameworkMvcDbContext context)
	    {
	        this.context = context;
	        entitySet = context.Set();
	    }
	
	    public void Add(T entity)
	    {
	        entitySet.Add(entity);
	    }
	}

This approach is pretty close to what I think we would want and reasonably straight forward but I still don’t like the fact that the SaveChanges would effect every modified/added model across all repositories. If you’re happy to live with that then I think you’re good to go.

The full code can be seen on the LessAbstraction branch at Github – [https://github.com/jchannon/EntityFrameworkMVC/tree/LessAbstraction/EntityFrameworkMVC
](https://github.com/jchannon/EntityFrameworkMVC/tree/LessAbstraction/EntityFrameworkMVC)

## Approach Three

Another approach for using EF and building on from approach one was to remove the GetEntitySet from the IUnitOfWork interface but keep the Save method, inject the context into the repositories to allow them to add/update and inject the IUnitOfWork and repositories into the controllers so the repositories could use Add and then IUnitOfWork could be used to call SaveChanges.

	public interface IUnitOfWork
	{
	    void SaveChanges();
	}
	
	public class Repository : IRepository where T : class
	{
	    private readonly DbSet entitySet;
	
	    public Repository(EntityFrameworkMvcDbContext context)
	    {
	        entitySet = context.Set();
	    }
	
	    public void Add(T entity)
	    {
	        entitySet.Add(entity);  
	    }
	}
	
	public OrderController(IUnitOfWork unitOfWork, IRepository orderRepository, IRepository customerRepository)
	{
	    this.unitOfWork = unitOfWork;
	    this.orderRepository = orderRepository;
	    this.customerRepository = customerRepository;
	}

I think that’s a decent approach however, I think it could be tidied up so that the controllers don’t get cluttered with too many constructor dependencies.

The full code can be seen on the GenericContextPerRequest branch at Github – [https://github.com/jchannon/EntityFrameworkMVC/tree/GenericContextPerRequest/EntityFrameworkMVC
](https://github.com/jchannon/EntityFrameworkMVC/tree/GenericContextPerRequest/EntityFrameworkMVC)

## Approach Four

This below was another approach and the approach I decided I would use. It uses all the understandings gained from the above samples and hopes to provide a decent way of using EF.

The repositories are now exposed on the IUnitOfWork interface, the implementation takes the DBContext as a constructor dependency, the repository implementation also takes the DBContext to provide the CRUD features with EF and the controllers only have the IUnitOfWork injected into them.

	public interface IUnitOfWork
	{
	    void SaveChanges();
	    IRepository CustomerRepository { get; }
	    IRepository ProductRepository { get; }
	    IRepository OrderRepository { get; }
	}
	
	public OrderController(IUnitOfWork unitOfWork )
	{
	    this.unitOfWork = unitOfWork;
	}

This means we can keep our one database context per request, the controllers are tidied up so we no longer have numerous constructor dependencies and the repositories can be used to do CRUD and then SaveChanges can be called by IUnitOfWork when we have finished with the repositories.

The only possible downside could be in time that we have numerous constructor dependencies on the IUnitOfWork implementation as well as numerous exposed repository properties on the IUnitOfWork interface. I don’t see this as a big issue as its only one class in your solution. If you didn’t want this to get too polluted you could create a repository factory and inject that into the controller and just have the SaveChanges on the IUnitOfWork interface. You wouldn’t want the IUnitOfWork to expose the repositories because as [@daanleduc][4] pointed out to me that would violate the SRP.

## Conclusion

I only touched the basics of implementing EF into a MVC app but these approaches did take quite a while to discover and after hearing all the negativity towards EF and drawing from my experience I think I could see why people have issues with it in a much larger application as I’m sure there are other caveats to using EF. The biggest issue I saw with it was not exposing a Save method for the model type you were using, instead you have to commit all changes across the database context. I feel this made it quite difficult to create a decent architecture. I can see in a large enterprise application why EF could be helpful in allowing it to query the database for you and create/modify the tables for you based on your model changes but I think for now in smaller applications I think I still prefer micro-ORMs like PetaPoco, Dapper or Simple.Data due to the control it gives you and also the ease in which you can abstract the database communication. As [@Cranialstrain][5] says “the database is an implementation detail”. I’d also like to thank all those on Jabbr that helped me with the above approaches and long discussions had about Entity Framework!

   [1]: http://www.asp.net/entity-framework
   [2]: http://www.asp.net/mvc
   [3]: http://www.toptensoftware.com/petapoco/
   [4]: https://twitter.com/daanleduc
   [5]: https://twitter.com/Cranialstrain
  
