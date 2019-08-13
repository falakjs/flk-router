class QueryString {
    /**
     * Constructor
     */
    constructor() {
        this.object = {};
        this.QueryString = window.location.href.split('?')[1];
        this._collectParameters();
    }

    /**
     * Build query string from object
     * 
     * @param   object object
     * @returns string
     */
    build(object, prefix) {
        const query = Object.keys(object).map((k) => {
            let key = k;
            let value = object[key];

            if (!value && (value === null || value === undefined || isNaN(value))) {
                value = '';
            }

            switch (object.constructor) {
                case Array:
                    key = `${prefix}[]`;
                    break;
                case Object:
                    key = (prefix ? `${prefix}[${key}]` : key);
                    break;
            }

            if (typeof value === 'object') {
                return this.build(value, key); // for nested objects
            }

            return `${key}=${encodeURIComponent(value)}`;
        });

        return query.join('&');
    }

    /**
     * Collect query string object
     */
    _collectParameters() {
        let str = this.QueryString,
            separator = '&';

        if (!str) return;

        let splitedString = str.split(separator);

        for (let segment of splitedString) {
            segment = decodeURIComponent(segment);
            let [key, value] = segment.split('=');

            // if the key exists we will skip it if and only if it is not a compound name
            // compound names contain [] brackets
            if (typeof this.object[key] != 'undefined' && !key.includes('[]')) continue;

            if (typeof value == 'undefined') {
                value = '';
            }

            // escape the value
            // value = _e(decodeURIComponent(value).replace(/\+/g, ' '));
            value = decodeURIComponent(value).replace(/\+/g, ' ');

            if (key.includes('[]')) {
                // remove the brackets from the key []
                key = key.replace(/\[\]/, '');

                if (typeof this.object[key] == 'undefined') {
                    this.object[key] = [];
                }

                this.object[key].push(value);
            } else {
                this.object[key] = value;
            }
        }
    }

    /**
     * Get all object
     */
    all() {
        return this.object;
    }

    /**
     * Get the query string as string
     * 
     * @returns string
     */
    toString() {
        return this.QueryString;
    }

    /**
     * Get query string param by key
     * 
     * @param  string key
     * @param  mixed defaultValue
     * @returns mixed
     */
    get(key, defaultValue = null) {
        return Object.get(this.object, key, defaultValue);
    }
}