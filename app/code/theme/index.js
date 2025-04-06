/**
 * Renders default theme.
 *
 */

 class Theme extends require('../component/index.js') {
  async init(app)  {
    super.init(app);
    const expressApp = app.component('./express/index.js').expressApp();
    // this._expressApp = this.express()();
    const ejsLayouts = require('express-ejs-layouts');
    // Tell Express to use ejs-layouts
    expressApp.use(ejsLayouts);
    expressApp.set('layout', 'themes/defaultTheme/layouts/layout');

    // Create middleware to pass common data to all views (header and footer data)
    expressApp.use((req, res, next) => {
      // Navigation data.
      res.locals.navData = app.c('nav').getNavigationMenuLinks();
      next();
    });

    return this;
  }

  render(res, viewName, args) {

    res.render('themes/defaultTheme/' + viewName, args);
  }

  /**
   * {@inheritdoc}
   */
  dependencies() {
    return [
      // './socket/index.js',
    ];
  }

}

module.exports = new Theme();
