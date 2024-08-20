/**
 * Crashes the appliation.
 *
 * Useful for testing.
 */

class CrashTest extends require('../component/index.js') {
  dependencies() {
    return [
      './express/index.js',
      './env/index.js',
    ];
  }

  async init(app) {
    // Call the init method of the parent class
    super.init(app);

    app.c('express').addRoute(
      'CrashTest',
      // HTTP method for this route
      'get',
      // Route pattern with dynamic permissionId and file path
      '/dev/crash/:token',
      (req, res) => {
        const token = req.params.token;
        // Capture the rest of the URL after '/access/'
        const tokenCheck = String(require('../env/index.js').required('CRASHTEST_TOKEN'));
        if (token === tokenCheck) {
          // @ts-expect-error
          process.exit();
        }
        else {
          res.status(403).send('This path is used to purposely crash the application for development. The token you are using is not equal to the environment token CRASHTEST_TOKEN, so we will not crash.');
        }
    });

    // Return the instance of the class
    return this;
  }
}

module.exports = new CrashTest();
