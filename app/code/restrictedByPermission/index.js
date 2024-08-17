/**
 * Restricted By Permission.
 */
class RestrictedByPermission extends require('../component/index.js') {
  dependencies() {
    return [
      './express/index.js',
      './authentication/index.js',
      'fs'
    ];
  }

  async init(app) {
    super.init(app);

    const expressApp = app.c('express').expressApp();
    // /usr/src/app/private/restricted-by-permission/
    const restrictedfolderpath = app.config().modules['./restrictedByPermission/index.js'].restrictedfolderpath;

    // Middleware to check permissions
    const checkPermission = (req, res, next) => {
      console.log(req.user);

      // console.log('req.user:', req.user); // Log the entire req.user object
      const permissionId = req.params.permissionId;
      // console.log("********************permissionId**************************");
      // console.log(permissionId);
      // console.log(req.user);
      // Check if req.user and req.user.permissions are defined
      const hasPermission = req.user?.permissions && req.user.permissions?.[`view-content-${permissionId}`] === 1;
      console.log("hello");
      console.log(req.user.hello);
      console.log(req.user.hello3);
      console.log(req.user.permissions);
      console.log("permissions");
      console.log(hasPermission);

      // Implement your actual permission logic here
      if (hasPermission) {
        // Permission granted, proceed to the next middleware or route handler
        next();
      } else {
        // console.log("********************permissionId**************************");
        // console.log(permissionId);
        // console.log(req.user);

        // Redirect to noaccess/index.html
        res.status(403).sendFile(`${restrictedfolderpath}/permission-${permissionId}/no-access/index.html`);
      }
    };

    // Add middleware
    app.c('express').addMiddleware('restrictedByPermission', 'get', [checkPermission]);

    // Handle dynamic routes
    app.c('express').addRoute(
      'restrictedByPermission',
      'get',
      '/private/restricted-by-permission/permission-:permissionId/access/*',
      (req, res) => {
        const permissionId = req.params.permissionId;
        // This captures everything after /access/
        const requestedUri = req.params[0];
        const filePath = `${restrictedfolderpath}/permission-${permissionId}/access/${requestedUri}`;
        // Check if the file exists
        fs.access(filePath, fs.constants.F_OK, (err) => {
          if (err) {
            // File not found, send a 404 response
            res.status(404).send('File not found');
          } else {
            // Serve the file
            res.status(200).sendFile(filePath);
          }
        });
    });

    return this;
  }
}

module.exports = new RestrictedByPermission();
