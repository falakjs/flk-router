# Falak JS Router

This package provides two things to **Falak JS** framework:

- [Routing life cycle of the framework](https://github.com/falakjs/Falak/wiki/Routing)
- Helpers for using the navigation system.

Regarding the routing structure you can check its full documentation from this [link](https://github.com/falakjs/Falak/wiki/Routing).


# Installation

This package is automatically installed on each new application so you don't have to install it.

# Package info

**Class name:** `Router`
**Alias:** `router`

#methods
- [Falak JS Router](#falak-js-router)
- [Installation](#installation)
- [Package info](#package-info)
  - [route](#route)
    - [Example](#example)
  - [navigateTo](#navigateto)
    - [Example](#example-1)
- [navigateBack](#navigateback)
    - [Example](#example-2)
  - [prev](#prev)
  - [url](#url)
  - [hash](#hash)
  - [refresh](#refresh)
  - [redirectBack](#redirectback)
  - [queryString](#querystring)


## route
Get the current route of the application
`route(withQueryString: boolean = Router.WITHOUT_QUERY_STRING): string`

This method is used to get the current route.

By default this method returns only the current route without the query string **If there is any**.

### Example
`users-page.component.js`

```js
Class UsersPage {
    constructor(router) {
        this.router = router;
    }

    init() {
        console.log(this.router.route()); // /users
    }
} 
```

If there is any query string i.e `/users?auth=true` in the url, it won't be returned.

To get the route with the query string 

```js
class UsersPage {
    constructor(router) {
        this.router = router;
    }

    init() {
        console.log(this.router.route(Route.WITH_QUERY_STRING)); // /users?auth=true    
    }
} 
```

When the `Route.WITH_QUERY_STRING` flag is passed to the method, it will return the query string as well if exists. 

## navigateTo
Navigate to the given `route`.

`navigateTo(route: string): void`

This method probably the most used method you may use in this package.

It allows you to manually navigate to a certain route

> Always pass the route start with the `/` i.e `/users`

### Example
In the `guardian` middleware, you'll see the following code:

```js
class Guardian {
    /**
     * {@inheritDoc}
     */
    constructor(user, router) {
        this.user = user;
        this.router = router;
    }

    /**
     * {@inheritDoc}
     */
    name() {
        return 'guardian';
    }

    /**
     * {@inheritDoc}
     */
    handle() {
        if (! this.user.isLoggedIn()) {
            this.router.navigateTo('/login');
            return;
        }

        return Middleware.NEXT;
    }
}
```

As we can see, we `injected` the router package to the middleware in the `constructor`

In the `handle` method, if the user is not logged in, then we need to navigate him to the `/login` route. 

# navigateBack
Navigate back to the previous route.
`navigateBack(): void`

> If there is no previous routes, then the router will navigate to `/` path

This method is usually used with the `login page` to navigate the user back to the previous page.

### Example
`login-page.component.js`

```js
class LoginPage {
    /**
     * Constructor
     * Put your required dependencies in the constructor parameters list  
     */
    constructor(authService, user, router) {
        this.name = 'login';
        this.title = trans('login');
        this.user = user;
        this.router = router;
        this.authService = authService;
    }

    login(form) {
        this.authService.login(form).then(response => {
            // Save user data and access token  
            this.user.login(response.user);
            // then navigate back to the previous route
            this.router.navigateBack();
        }).catch(response => {
            // some error comming from the backend
        });
    }
```

## prev
Get the previous route.
`prev(): string`

> If no previous route found `/` is returned back instead.


## url
Get the full url of the current page.
`url(): string`

## hash
Get the hash string from the current page location.
`hash(): string|null`

For example if the route is
`/users#go-to-subscriptions`

`users-page.component.js`
```js
    init() {
        let hash = this.router.hash(); // go-to-subscriptions
    }
```

## refresh
Navigate again to same current page.
`refresh(): void` 

## redirectBack
Make a **hard** Redirect back to previous page.
`redirectBack(): void`

## queryString

Sometimes you need to get the value from the query string of the url.

For example visitor navigates to route `/users` with query string like `/users?page=1&limit=30` so we need to get the value of `page` and `limit` as well.

To do so we use the `queryString` property to collect these info.

`users-page.component.js`
```js

class UsersPage {
    constructor(router) {
        this.router = router;
    }

    init() {
        let queryString = this.router.queryString;
        // to get the value of the `page` param
        let page = queryString.get('page');
        // set a default if the page key is not set
        page = queryString.get('page', 1);  
    }
} 
```

To get all parameters in object
```js

class UsersPage {
    constructor(router) {
        this.router = router;
    }

    init() {
        let queryString = this.router.queryString;
        // to get all params
        let parameters = queryString.all();
        console.log(parameters); // {page: 1, limit: 30}
    }
} 
```
