+++

title = "Evaluating KnockoutJS and AngularJS – Part 2"
aliases = ["/2013/02/05/evaluating-knockoutjs-and-angularjs-part-2/"]
tags = ["angularjs","handlebars","javascript","knockoutjs","learning","oss","sammyjs"]
+++

In [Part 1][1], I described how I was using the demo tutorial from [SammyJS][2] to get a better understanding of [AngularJS][3] and [KnockoutJS][4].

In this blog post I will focus on what I found when using KnockoutJS.

Again if you just want to get to the code then feel free to take a look here for [Angular][5] and here for [Knockout][6].

## Knockout

Firstly Knockout should be commended on their documentation and online tutorials. Their website tutorials follows a step by step approach and once you have completed each step you can click through to the next section. You can also leave the tutorial and come back to it and it will remember where you left. There is great support in the KnockoutJS room in Jabbr and I’d like to thank [David Spörri][7] for answering my newbie JS and Knockout questions.

<!--more-->

Knockout also uses HTML elements and attributes like Angular to determine behaviour but Knockout’s approach is more HTML5 in that the most common usage is using the data-bind attribute. For example, the below will use the artist property on the viewmodel to render the div contents.

	<div data-bind="text: artist"></div>

As this was going to be a SPA (Single Page Application), the main screen would have an area that would display either a list of products or more information about a single product. The way Knockout handles this is via a ‘with’ keyword.

	<div id="main">
	  <!-- Main Page -->
	  <div data-bind="with: items"></div>
	  <!-- Detail Page -->
	  <div data-bind="with: chosenProduct"><div>
	</div>

So when the viewmodel’s ‘items’ property is populated it would show the first div and when the ‘chosenProduct’ property was populated it would show the second div. Nice and simple. You can then populate your markup with properties from the items and chosenProduct within those div’s.

As we have 2 pages/sections in our app we need to handle routing so that when we’re going to the root it populates our view model with all our products and when the user clicks a specific product it finds that product and populates our view model. KnockoutJS does not have this built into it like Angular does and uses SammyJS to handle this.

	var app = Sammy(function () {
	    this.get('#/:id', function (context) {
	        self.items(null);
	        var product = data.filter(function (x) {
	            return x.id === parseInt(context.params.id, 10);
	        })[0];
	        product.quantity = 1;
	        self.chosenProduct(product);
	    });
	
	    this.get('/', function () {
	        self.items(data);
	        self.chosenProduct(null);
	    });
	});
	
	jQuery(function () {
	    console.log('rn');
	    app.run();
	});

Compared to Angular’s separation approach, here we have most things all in one class/viewmodel i.e/ the routing to assign the items property for all products and single item for the selected product as well as other viewmodel properties. We also have functions to add items and determine quantity as well as saving the information to [localStorage][9]. I guess it keeps it altogether in one place but this may get tricky once the app becomes quite large however, I’ve been told things can get separated by using [RequireJS][10] although I think in this demo that would require a large refactor.

Again in this demo outside of the main area that gets changed with markup we have a shopping cart that needs to update when we add something. I already had a function that calculated my quantities but it did not update the div with the new value. Even though the viewmodel property was a computed function it was not re-run every time something was added to the basket, for that to happen the computed function needs to have an observable property within it.

	self.basketItemCount = ko.computed(function () {
	       var count = 0;
	       var items = self.basketItems();
	       for (var i = 0; i < items.length; i%2B%2B) {
	           count %2B= items[i].quantity(); //Given that the quantity is an observable property
	       }
	       return count;
	   });

We also wanted to do some animation when the item was added to the basket and because SammyJS has a dependency on jQuery it was very easy to add this to the viewmodel’s addItem function however like Angular this is not recommended as it ties the view to the viewmodel. What Knockout recommend is custom bindings.

	ko.bindingHandlers.animateCart = {
	    update: function (element, valueAccessor, allBindingsAccessor) {
	        $(element)
	            .animate({ paddingTop: '30px' })
	            .animate({ paddingTop: '10px' });
	    }
	};

	//Usage
	<div class="cart-info" data-bind="animateCart: basketAsJson()"></div>

Now this is where the data binding gets confusing/interesting. My HTML could not use the basketItems viewmodel property as this is an observable array and so would only react when the array changed NOT when properties of objects within the array changed. I was a bit disappointed with that so I had to create a new function that obviously used an observeable within it ie/the basketItems but that was not enough to handle the properties changing within that array. So the recommendation from [Robert Westerlund][11] (a Javascript, Knockout and Regex wizard) was to use ko.toJSON(basketItems()). (The reason we use ko.toJSON and not JSON.stringify is because that would not pick up the observeable property values) This would mean that it would have to traverse all the objects to find the values and because they are observeable this function would fire every time, genius! This also meant when it changed I could also store the changes in localStorage for when the user came back to the website!

## Conclusion

I found Knockout easier to comprehend and get going with compared to Angular which is always a winner when starting something new but Knockout is pretty much just about binding so for things like routing and separation of concerns you need to use other libraries whereas Angular has all that built in. I think for smaller projects without too much logic required Knockout is ideal and I really like the simplicity of SammyJS however, for larger applications that requires dependency injection, a clear separation of concerns and the easy ability to unit test logic Angular is a winner. In this case the term “pick the right tool for the job” certainly applies.

I guess I should go ahead and investigate Backbone now just to fully educate myself and I’ve been recommend this link – [“Step by step from jQuery to Backbone”][12] so here goes…

   [1]: http://blog.jonathanchannon.com/2013/02/05/evaluating-knockoutjs-and-angularjs-part-1/ (Evaluating KnockoutJS and AngularJS – Part 1)
   [2]: http://sammyjs.org/
   [3]: http://angularjs.org/
   [4]: http://knockoutjs.com/
   [5]: https://github.com/jchannon/AngularShopping
   [6]: https://github.com/jchannon/KnockoutShopping
   [7]: https://twitter.com/davepermen
   [8]: http://december.com/html/4/element/div.html
   [9]: https://developer.mozilla.org/en-US/docs/DOM/Storage
   [10]: http://requirejs.org/
   [11]: https://twitter.com/robwesterlund
   [12]: https://github.com/kjbekkelund/writings/blob/master/published/understanding-backbone.md
  
