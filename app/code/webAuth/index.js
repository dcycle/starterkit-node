/**
 * Abstract class providing web authentication.
 */

class WebAuth extends require('../component/index.js') {

  dependencies() {
    return [
      './authentication/index.js',
      './express/index.js',
      './env/index.js',
      'express-session',
      './database/index.js'
    ];
  }

  async init(app)  {
    this._app = app;

    const expressApp = app.component('./express/index.js').expressApp();
    const expressSession = app.component('express-session')({
      secret: app.component('./env/index.js').required('EXPRESS_SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
      // Store session in mongo db.
      store: app.component('./database/index.js').mongoStore()
    });

    expressApp.use(expressSession);
    expressApp.use(app.component('./authentication/index.js').passport().initialize());
    expressApp.use(app.component('./authentication/index.js').passport().session());

    // Add middleware for each route to verify user has valid permission to access route
    this.addPathMiddlewaresFromConfigRoutes();

    return this;
  }

  /**
   * Adds middlewares to the Express routes based on configuration.
   *
   * This function reads route configurations from a configuration file,
   * and for each route, attaches appropriate middleware to the Express app
   * based on the permissions and user roles specified in the configuration.
   */
  addPathMiddlewaresFromConfigRoutes() {
    // Access routes from configuration file.
    const paths = this._getRoutesFromConfig();

    if (!paths) {
      console.log("Paths not found in config");
      return;
    }

    // Foreeach Route attach middleware to expressApp based on permissions and user roles.
    paths.forEach((routeConfig) => {
      this._addRouteMiddleware(routeConfig);
    });
  }

  /**
   * Retrieves the route configurations from the application configuration.
   *
   * This function accesses the app configuration to fetch the route definitions
   * from the `./webAuth/index.js` module. If the routes are valid and of the correct
   * type (object), they are returned; otherwise, an error message is logged.
   *
   * @returns {Object|null} An object representing the routes if valid, or null if the paths are invalid.
   */
  _getRoutesFromConfig() {
    const paths = this._app.config().modules['./webAuth/index.js'].routes;
    if (!paths || typeof paths !== 'object') {
      console.log("Paths are not valid.");
      return null;
    }
    return paths;
  }

  /**
   * Adds middleware to the specified route based on the provided configuration.
   *
   * This function checks if the route configuration includes a valid permission setting.
   * If the permission is found, it creates the necessary middleware callback and
   * attaches it to the specified route and HTTP verb using the Express middleware system.
   *
   * @param {Object} routeConfig - The configuration object for the route.
   * @param {string} routeConfig.route - The path for the route (e.g., '/users').
   * @param {string} routeConfig.verb - The HTTP verb for the route (e.g., 'GET', 'POST').
   * @param {string} routeConfig.permission - The permission required to access the route.
   */
  _addRouteMiddleware(routeConfig) {
    if (!routeConfig.permission) {
      console.log("Permission not found for the route.");
      return;
    }

    const callback = this._createMiddlewareCallback(routeConfig);

    this._app.component('./express/index.js').addMiddleware(routeConfig.route, routeConfig.verb, [callback]);
  }

  /**
   * Creates a middleware callback for handling requests
   *  based on the user's authentication status.
   *
   * This function returns an asynchronous middleware callback
   *  that checks if the request contains a user object (indicating
   *  an authenticated user). If the user is not authenticated, the middleware
   *  will delegate the handling to the `_handleAnonymousUser` method. If the
   *  user is authenticated,
   *  the middleware will call the `_handleAuthenticatedUser` method.
   *
   * @param {Object} routeConfig - The configuration object for the route.
   * @returns {Function} An asynchronous middleware callback function.
   */
  _createMiddlewareCallback(routeConfig) {
    return async (req, res, next) => {
      if (!req.user) {
        this._handleAnonymousUser(req, res, next, routeConfig);
      } else {
        this._handleAuthenticatedUser(req, res, next, routeConfig);
      }
    };
  }

  /**
   * Handles requests for anonymous users (i.e., users who are not authenticated).
   *
   * This function checks if the provided permission in the `routeConfig` is valid for
   * users with the 'anonymous' role. If the permission is valid, the request is passed
   * along to the next middleware in the stack. Otherwise, the function redirects or sends
   * a JSON response based on the logic in the `_redirectOrSendJson` method.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function to call in the Express stack.
   * @param {Object} routeConfig - The configuration object for the route.
   */
  _handleAnonymousUser(req, res, next, routeConfig) {
    if (this.isPermissionValidForRoles(routeConfig.permission, ['anonymous'])) {
      next();
    } else {
      this._redirectOrSendJson(res);
    }
  }

  /**
   * Handles requests for authenticated users (i.e., users who are logged in).
   *
   * This function retrieves the roles associated with the authenticated user and checks
   * if they have the appropriate permissions to access the requested route. If the user
   * has the 'administrator' role, they are granted access to all routes. If the user has
   * the necessary role(s) for the route's permission, they are allowed to proceed to
   *  the next middleware. Otherwise, the function redirects or sends a JSON response
   *  based on the logic in the `_redirectOrSendJson` method.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function to call in the Express stack.
   * @param {Object} routeConfig - The configuration object for the route, including permissions.
   */
  async _handleAuthenticatedUser(req, res, next, routeConfig) {
    const roles = await this._app.c("accountFramework").getMARolesByUserId(req.user._id);

    if (roles.includes('administrator')) {
      next();  // Administrator has access to all routes
    } else if (this.isPermissionValidForRoles(routeConfig.permission, roles)) {
      next();  // User has access based on their roles
    } else {
      this._redirectOrSendJson(res);
    }
  }

  /**
   * Redirects the user or sends a JSON response based on the request's content type.
   *
   * This function checks the `Content-Type` of the incoming request to determine whether
   * the response should be a JSON object or a redirect. If the request's content type is
   * 'application/json', it sends a JSON response indicating that the user is not authenticated.
   * Otherwise, it redirects the user to the login page.
   *
   * @param {Object} res - The response object used to send the response or redirect.
   */
  _redirectOrSendJson(res) {
    const contentType = res.req.headers['content-type'];
    if (contentType && contentType.includes('application/json')) {
      res.send(JSON.stringify({
        authentified: false,
        error: 'authentication failed; you need to be logged in to call this endpoint.',
      }));
    } else {
      res.redirect('/login');
    }
  }

  /**
   * Checks if any of the user's roles have the required permission.
   *
   * This function iterates through the user's roles and checks if any of them are associated
   * with the given permission. It retrieves the permissions for each role from the configuration.
   * If any role contains the specified permission, the function returns `true`. If no roles have
   * the required permission, it returns `false`.
   *
   * @param {string} permission - The permission that needs to be validated for the user's roles.
   * @param {Array<string>} userRoles - The array of roles associated with the user.
   * @returns {boolean} - Returns `true` if any role has the required permission, `false` otherwise.
   */
  isPermissionValidForRoles(permission, userRoles) {
    // Loop through all roles and check if any role has the required permission
    for (let role of userRoles) {
      const rolePermissions = this._app.config().modules['./webAuth/index.js'].roles[role];

      // If the rolePermissions is an array and includes the permission, return true
      if (Array.isArray(rolePermissions) && rolePermissions.includes(permission)) {
        return true;
      }
    }

    // Return false if no role has the required permission
    return false;
  }

  async run(app)  {

    app.component('./express/index.js').expressApp().post('/logout', function(req, res, next) {
      req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
    });

    return this;
  }

}

module.exports = new WebAuth();
