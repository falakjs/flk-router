class Router {
    /**
    * Constructor
    *
    */
    constructor(events, Layout) {
        this.events = events;
        this.Layout = Layout;
        this.previousRoute = '/';
        this.currentRoute = '/';

        this._buildCurrentRoute();

        this.stack = [];

        this.index = 0;

        this._handleHistoryLinks();

        this._handleLinks();

        // this event is triggered when user clicks on an anchor tag
        // or the url is changed manually by the developer using the navigateTo method 
        this.events.on('router.navigating', route => {
            // this.previousRoute = this.route();
        });
    }

    /**
     * Get current hash
     * 
     * @returns string
     */
    hash() {
        // get the hash value without the # symbol
        return window.location.hash.substring(1);
    }

    /**
    * Get current route
    *
    * @param bool withQueryString
    * @return string
    */
    route(withQueryString = Router.WITHOUT_QUERY_STRING) {
        return withQueryString == Router.WITH_QUERY_STRING ?
            this.currentRoute :
            this.currentRoute.split('?')[0];
    }

    /**
     * Navigate to the given route in url
     * 
     * @param string route
     * @return void
     */
    navigateTo(route) {
        this.previousRoute = this.currentRoute;
        return this.navigateToUrl(url(route));
    }

    /**
     * Navigate to the given url
     * 
     * @param string fullUrl
     */
    navigateToUrl(fullUrl) {
        this._setUrl(fullUrl);

        this.scan();
    }

    /**
     * Get previous route
     * 
     * @returns string
     */
    getPreviousRoute() {
        return this.previousRoute == this.currentRoute ? '/' : this.previousRoute;
    }

    /**
     * Get previous route
     */
    prev() {
        return this.getPreviousRoute();
    }

    /**
     * Make full page reload to previous page
     */
    redirectBack() {
        window.location.href = url(this.getPreviousRoute());
    }

    /**
    * Get current url
    *
    * @param   bool withQueryString
    * @returns string
    */
    url(withQueryString = Router.WITHOUT_QUERY_STRING) {
        let currentUrl = window.location.href;

        return withQueryString ? currentUrl : currentUrl.split('?')[0];
    }

    /**
    * Reload current page
    *
    */
    refresh() {
        this.navigateTo(this.route(Router.WITH_QUERY_STRING));
    }


    /**
     * Reload the previous page
     */
    goBack() {
        this._setUrl(url(this.prev()));

        window.location.reload();
    }

    /**
     * Navigate back
     * 
     * @returns void
     */
    navigateBack() {
        let route = this.getPreviousRoute();

        this.navigateTo(route);
    }

    /**
     * Get query string object
     * 
     * @returns QueryString
     */
    get queryString() {
        return new QueryString;
    }

    /**
     * Start scanning the routes list for to match the current route
    *
    */
    scan() {
        let currentRoute = this.route();

        this.events.trigger('router.navigating', currentRoute, this);

        for (let routePath in Router.list) {
            let route = Router.list[routePath],
                matches = currentRoute.match(route.pattern);

            if (!matches) continue;

            delete matches[0];

            let params = Array.reset(matches);

            let paramValues = {};
            if (!Is.empty(route.paramsList)) {
                for (let i = 0; i < params.length; i++) {
                    paramValues[route.paramsList[i]] = params[i];
                }
            } else {
                paramValues = matches;
            }

            route.params = paramValues;

            route.route = currentRoute;

            // store all parameters in the params property
            this.params = route.params;

            this.current = route;

            this.Layout.newPage(route);

            if (this.events.trigger('router.navigation', currentRoute, this) === false) return;

            this.Layout.render();

            let hash = this.hash();

            // if the url contains hash, scroll to it
            if (hash) {
                setTimeout(() => {
                    let element = document.getElementById(hash);
                    if (element) {
                        element.scrollIntoView(true);
                    }
                }, 0);
            }
            break;
        }
    }

    /**
     * Build current route and cache it in a property
     */
    _buildCurrentRoute() {
        let currentUrl = this.url().rtrim('/') + '/';

        let route = '/' + currentUrl.ltrim(SCRIPT_URL).trim('/') + '/';

        // remove the locale from the url
        let regex = new RegExp(`^\/${Config.get('app.localeCode')}`);
        route = route.replace(regex, '/').replace(/\/+/, '/');

        // decode the url if it has any uft8 encoding
        route = decodeURIComponent(route);

        if (route != '/') {
            route = route.rtrim('/');
        }

        // remove the hash from the route
        this.currentRoute = route.split('#')[0];
    }

    /**
    * Handle all links
    *
    */
    _handleLinks() {
        let $this = this;

        $(document).on('click', 'a', function (e) {
            let btn = $(this),
                hrefOnly = btn.attr('href'),
                href = this.href;

            if (!href || btn.hasClass('navigatable')) return;

            // If the href starts with / then generate full path  
            if (hrefOnly && !Is.url(hrefOnly)) {
                this.href = href = url(hrefOnly);
            }

            // if user clicks ctrl with the mouse click
            // then we will allow him to open the url in new window
            if (e.ctrlKey || btn.attr('target') == '_blank') return;

            if (hrefOnly.startsWith('#')) {
                this.href = $this.url().split('#')[0] + hrefOnly;
                return;
            }

            if (href.startsWith(BASE_URL)) {
                e.preventDefault();
                $this.navigateToUrl(href);
            } else {
                window.open(href, '_blank');
                return false;
            }
        }).on('contextmenu mousedown', 'a', function (e) {
            // generate full absolute link to the relative links
            // as the user may open it in new tab or copy the url location
            // mousedown event for the middle mouse button click

            if (e.type == 'mousedown' && e.which != 2) return true;

            let btn = $(this),
                href = String(btn.attr('href'));

            if (!href) return false;

            if (href.startsWith('/')) {
                btn.attr('href', url(href));

                // reset it back again to original uri
                setTimeout(() => {
                    btn.attr('href', href);
                }, 10);
            }
        });
    }

    /**
    * Start handling history links
    *
    */
    _handleHistoryLinks() {
        window.onpopstate = e => {
            this.events.trigger('router.leaving', this.route(), this);

            // remove the current added url
            this.stack.pop();
            // get the previous url
            let url = Array.end(this.stack);

            history.replaceState(e.state, null, url);

            this._buildCurrentRoute();

            // navigate to the current route

            this.scan();
        };
    }

    /**
    * Display the given url as the Current url
    * Without scanning the routes again
    *
    * @param string url
    */
    _setUrl(url) {
        this.events.trigger('router.leaving', this.route(), this);

        this.stack.push(url);

        history.pushState(this.index++, null, url);

        this._buildCurrentRoute();
    }

    /**
     * Update current window location without triggering any scan
     * 
     * @param  string newRoute
     */
    updateRoute(newRoute) {
        this.currentRoute = newRoute;

        this._setUrl(url(this.currentRoute));
    }

    /**
     * Update only query string of current url without triggering any scan
     * 
     * @param  string|object queryString
     */
    updateQueryString(queryString) {
        if (Is.object(queryString)) {
            queryString = this.queryString.build(queryString);
        }

        return this.updateRoute(this.route() + '?' + queryString);
    }

    /**
     * Create new router collection
     * 
     * @param object groupOptions 
     * @param callback callback 
     * @returns RoutesCollection
     */
    static group(groupOptions, callback) {
        return new RoutesCollection(groupOptions, callback);
    }

    /**
     * Add global middleware to all routes
     * 
     * @param  array middleware 
     * @returns void
     */
    static middleware(middleware) {
        Router.middlewareList = Router.middlewareList.concat(middleware);
    }

    /**
     * Add new route
     * 
     * @param string|regex route 
     * @param Layout.Page page 
     * @param object options 
     */
    static add(route, page, options = { middleware: [] }) {
        if (Is.array(route)) {
            for (let singleRoute of route) {
                Router.add(singleRoute, page, options);
            }
            return;
        }

        route = '/' + route.trim('/');

        let [pattern, paramsList] = Router.generatePattern(route);

        options.middleware = Router.middlewareList.concat(options.middleware);

        Router.list[route] = Object.merge({
            route, page, pattern, paramsList,
        }, options);
    }

    /**
    * Generate pattern for given route
    *
    * @param string route
    * @returns array of regular expression, params names
    */
    static generatePattern(route) {
        let regex = new RegExp('{\:?([^/]+)}|(\\*)', 'g');

        let paramsList = [];

        let pattern = route.replace(regex, function (actualSegment, paramName) {
            if (actualSegment === '*') {
                paramsList.push('rest');
                return '(.+)';
            } else if (actualSegment.match(/\*(.+)/)) {
                let dynamicName = dynamicName.removeFirst('*');
                paramsList.push(dynamicName);
                return '(.+)';
            } else {
                paramsList.push(paramName);
                return actualSegment.includes(':') ? '(\\d+)' : '([^\/]+)';
            }
        });

        pattern = '^' + pattern + '$';

        return [pattern, paramsList];
    }
}

Router.list = {};
Router.middlewareList = [];

Router.WITH_QUERY_STRING = true;
Router.WITHOUT_QUERY_STRING = false;

DI.register({
    class: Router,
    alias: 'router',
});  