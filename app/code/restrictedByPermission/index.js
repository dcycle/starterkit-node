/**
 * Restricted By Permission.
 * This class defines middleware and routes for handling access to restricted content based on permissions.
 */
class RestrictedByPermission extends require('../component/index.js') {
  dependencies() {
    return [
      // Dependency on express module
      './express/index.js',
      // Dependency on authentication module
      './authentication/index.js',
    ];
  }

  // Initialization method to set up middleware and routes
  async init(app) {
    // Call the init method of the parent class
    super.init(app);

    // Retrieve the express app instance from the app container
    const expressApp = app.c('express').expressApp();

    // Retrieve the path to the restricted folder from the configuration
    // This path is used to locate restricted content
    // it will be /usr/src/app/private/restricted-by-permission/
    const restrictedfolderpath = app.config().modules['./restrictedByPermission/index.js'].restrictedfolderpath;

    // Middleware function to check user permissions
    const checkPermission = (req, res, next) => {
      let hasAccess = false;
      // Check if the user is logged in
      if (typeof req.user !== 'undefined') {
        // req.user is now the user object
        if (app.c('authentication').userFieldValue(
          // The user object
          req.user,
          // The permission field to check
          'view-content-permission-' + req.params.permissionId,
          // Default value if permission field does not exist
          '0'
        ) === '1') {
          hasAccess = true;
        }
      }
      else {
        // User is not logged in, so should never have access.
      }

     // If the user has access, proceed to the next middleware or route handler
      if (hasAccess) {
        next();
      }
      else {
        // User does not have access, send a 403 Forbidden response
        // and serve the no-access index.html file content
        res.status(403).sendFile(`${restrictedfolderpath}/permission-${req.params.permissionId}/no-access/index.html`);
      }
    };

        // Add the permission-checking middleware to handle GET requests
    app.c('express').addMiddleware('restrictedByPermission', 'get', [checkPermission]);

    // Handle dynamic routes for accessing restricted content
    app.c('express').addRoute(
      'restrictedByPermission',
      // HTTP method for this route
      'get',
      // Route pattern with dynamic permissionId and file path
      '/private/restricted-by-permission/permission-:permissionId/access/*',
      (req, res) => {
        // Extract the permission ID from route parameters
        const permissionId = req.params.permissionId;
        // Capture the rest of the URL after '/access/'
        const requestedUri = req.params[0];
        // Construct the file path to the requested content
        const filePath = `${restrictedfolderpath}/permission-${permissionId}/access/${requestedUri}`;
        // Require the filesystem module
        // @ts-expect-error
        const fs = require('fs');
        // Check if the requested file exists
        fs.access(filePath, fs.constants.F_OK, (err) => {
          if (err) {
            // File not found, send a 404 Not Found response
            res.status(404).send('File not found');
          } else {
            // File exists, serve the file with a 200 OK response
            res.status(200).sendFile(filePath);
          }
        });
    });

    // Return the instance of the class
    return this;
  }
}

// Export an instance of the RestrictedByPermission class
module.exports = new RestrictedByPermission();
