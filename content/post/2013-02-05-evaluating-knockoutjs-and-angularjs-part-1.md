+++

title = "Evaluating KnockoutJS and AngularJS – Part 1"
aliases = ["/2013/02/05/evaluating-knockoutjs-and-angularjs-part-1/"]
tags = ["angularjs","handlebars","javascript","knockoutjs","learning","oss","sammyjs"]
+++

As I stated in my earlier post [“JavaScript is the future…maybe”][1] so with that in mind I had to brush up my JS skills and get more involved with the language’s core concepts so after watching some videos and reading some articles I was ready to look at [KnockoutJS][2] and [AngularJS][3].

Before I actually looked at these two I spent some time with [SammyJS][4] but realised afterwards it was mainly MVC based and not around 2-way binding that Knockout and Angular offer. However, I really liked it and it seemed very familiar and easy to use, the reason being it was inspired by [Sinatra][5] which we all know [Nancy][6] was also inspired by and we also know how much [I like Nancy][7]!

Getting to grips with any language or frameworks is tricky and the best way to do it is to write an application using it. The next difficult thing to overcome is an idea for writing an application. ToDo list’s are very common with JavaScript frameworks and there is a whole website for you to peruse but after looking at SammyJS and their docs they walk through writing a simple shopping basket so I thought I’d use that.

<!--more-->

If you just want to get to the code then feel free to take a look here for [Angular][8] and here for [Knockout][9].

This blog post will concentrate on AngularJS.

## Angular

After looking at the demos on the the home page and reading the docs I was ready to start. (I also got recommended [egghead.io][10] for lots of free AngularJS videos)

I liked the look of Angular’s data bindings, it was very similar to [HandlebarsJS][11] which is a templating engine for JS and their specific attributes for doing certain things in the DOM seemed clean.
```html
    <input type="text" ng-model="yourName" placeholder="Enter a name here">
    <hr>
    <h1>Hello {{yourName}}!</h1>
```
Angular uses “Controllers” and coming from experience with MVC it turned out they’re not really controllers but more ViewModels. Each Controller handles its own specific task for example, in CRUD you’d probably have a controller for each create, read, update and delete. I believe its possible to make it have one controller but that’s a bit more advanced!

The data in the SammyJS demo comes via a data.json file so I duly created my file and followed the examples of wiring up a backend. This is when things start getting a bit more in depth with Angular opposed to a simple Hello World app. Angular provides its own internal IOC container which is recommended you use to keep things nicely separated and of course it then injects your controller’s dependencies for you. See [here][15] for more about the subject. There is a bit of configuration needed in various places and one missing item or spelling mistake and you’ll be stuck due to the nature of dynamic nature of JavaScript.

I finally managed to get my wirings all sorted and my products displayed on screen but when I wanted to retrieve a single item this is when I started scratching my head. The recommended way of doing it was to use an abstracted class called $resource which allows you to query REST based services and obviously with just having one file this wasn’t going to work. $resource sits on top of $http but after playing with that I discarded my file and stuck it in memory for ease. If you’d like to see a $http demo with Nancy as a REST service see [this blog post][16] from [Christiaan Baes][17]

So now with a bit of filtering I could find my product and display it on screen. I had a controller for listing my products and another controller for displaying one item and a dependency injected into both to allow me to retrieve the data I wanted to display and I also had my routing setup.
```javascript
	//Routing
	var app = angular.module('myCart', []).
	        config(function ($routeProvider) {
	            $routeProvider.
	                when('/', {
	                    controller: 'IndexController',
	                    templateUrl: '/templates/list.html'
	                }).
	                when('/:id', {
	                    controller: 'DetailController',
	                    templateUrl: '/templates/detail.html'
	                }).
	                otherwise({ redirectTo: '/' });
	        });
	
	//Repository
	app.factory('shoppingItemsService', function () {
	        var data = [
	            //My data is here!
	        ];
	
	        return {
	            getItems: function () { return data; },
	            getItem: function (itemId) {
	                return data.filter(function (x) { return x.id === parseInt(itemId, 10); })[0];
	            }
	        };
	    });
	
	//List Controller
	app.controller(
	        'IndexController',
	        function ($scope, shoppingItemsService) {
	            $scope.items = shoppingItemsService.getItems();
	        }
	    );
	
	//Detail Controller
	app.controller(
	        'DetailController',
	        function ($scope, $routeParams, basketService, shoppingItemsService) {
	
	            $scope.item = shoppingItemsService.getItem($routeParams.id);
	            $scope.item.quantity = 1;
	
	            $scope.item.basketCount = basketService.getCount();
	
	            $scope.addItem = function () {
	                basketService.addItem($scope.item);
	            };
	        }
	    );
```
As the app is based around a single page application (SPA) the main area on the screen would show the products or product selected however I had an area, the cart info, that showed the quantity of items in my basket outside this main area. After a lot of head scratching I realised I could create a new controller that was responsible for setting a viewmodel property of the quantity and only update that specific area on screen. This meant when I was viewing a product and added a certain quantity to the basket this area would update automatically. Finally in the demo for a bit of added pizazz the cart info area animates.

This is the one bit that took me a long time to get my head around. Angular recommends that no DOM manipulation occurs in controllers but in separate classes/functions called Directives. I understand why, to keep your viewmodel not dependent on your view but man it was hard work! Directives allow you to determine your own HTML elements that Angular understands, again you can pass in dependencies and they will get resolved for you. Put whatever logic you want in your directive and then manipulate the DOM.
```javascript
	app.directive('quantity', function () {
	        var linker = function (scope, element, attrs, basketService) {
	           
	            scope.$watch(attrs.quantity, function (value, oldValue) {
	                if (value > oldValue) {
	                    element
	                    .animate({ paddingTop: '30px' })
	                    .animate({ paddingTop: '10px' });
	                }
	            }, true);
	        };
	
	        return {
	            restrict: 'A',
	            link: linker
	        };
	    });
	
	//Usage
	<div class="cart-info" ng-controller="CartController" quantity="basketCount()"></div>
```
One of the biggest things I found with Angular was that it was quite fiddly to setup however the documentation was very good and I had help from [Phil Jones][18]. Once I had solved whatever issue I was having at the time it was glaringly obvious what was needed and I why I was having problems but that’s all part of the learning curve I guess but mighty frustrating. Angular is certainly all encompassing by handling routing, model binding, separation of concerns and much more and so for a large app I can certainly see its potential but for small apps it may be a bit over the top but overall I did like it. There are also library extensions such as [AngularUI][19] which provide custom directives for DOM manipulation, ranked [popular modules][20] and specific [Angular debuggers][21] so this framework certainly has a lot behind it and I definitely think it will be sticking around for a while.

   [1]: http://blog.jonathanchannon.com/2013/01/09/javascript-is-the-future-maybe/ (JavaScript is the future…maybe!)
   [2]: http://knockoutjs.com
   [3]: http://angularjs.org/
   [4]: http://sammyjs.org/
   [5]: http://www.sinatrarb.com/
   [6]: http://nancyfx.org/
   [7]: http://nancyfx.org/mvm.html
   [8]: https://github.com/jchannon/AngularShopping
   [9]: https://github.com/jchannon/KnockoutShopping
   [10]: http://egghead.io/
   [11]: http://handlebarsjs.com/
   [12]: http://december.com/html/4/element/input.html
   [13]: http://december.com/html/4/element/hr.html
   [14]: http://december.com/html/4/element/h1.html
   [15]: http://docs.angularjs.org/guide/di
   [16]: http://blogs.lessthandot.com/index.php/WebDev/UIDevelopment/Javascript/angularjs
   [17]: http://blogs.lessthandot.com/index.php/All/?disp=authdir&amp;author=7
   [18]: http://twitter.com/philjones88
   [19]: http://angular-ui.github.com/
   [20]: http://ngmodules.org/
   [21]: https://github.com/angular/angularjs-batarang
  
