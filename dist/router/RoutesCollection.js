class RoutesCollection {
    /**
     * Constructor
     *  
     * @param object groupOptions 
     * @param callback callback 
     */
    constructor(groupOptions = {prefix: null, middleware: []}, callback) {
        this.options = groupOptions;

        callback(this);
    }

    /**
     * Create new router collection
     * 
     * @param object groupOptions 
     * @param callback callback 
     * @returns RoutesCollection
     */
    group(options, callback) {
        if (this.options.prefix) {
            options.prefix = options.prefix ? this.options.prefix + options.prefix : this.options.prefix;
        } 

        if (this.options.middleware) {
            options.middleware = options.middleware ? this.options.middleware.concat(options.middleware) : this.options.middleware;
        }

        return Router.group(options, callback);
    }

    /**
     * Add new route
     * 
     * @param string|regex route 
     * @param Layout.Page page 
     * @param object options 
     */
    add(route, page, otherOptions = {}) {
        if (this.options.prefix) {
            route = this.options.prefix + route;
        }

        let options = Object.merge(this.options, otherOptions);

        if (this.options.middleware) {
            options.middleware = options.middleware ? this.options.middleware.concat(options.middleware) : this.options.middleware;
        }

        delete options.prefix;

        Router.add(route, page, options);
    }
}