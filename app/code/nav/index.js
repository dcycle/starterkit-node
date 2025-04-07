/**
 * Navigation menu links
 *
 */

class Nav extends require('../component/index.js') {
  async init(app)  {
    super.init(app);
    return this;
  }

  getNavigationMenuLinks() {
    // get nav menu config from app/config/versioned.yml
    const navData = this._app.config().modules['./nav/index.js'].menus.navigation;

    if (!navData || !Array.isArray(navData)) {
      console.log("Navigation data is undefined or not an array.");
       // Return an empty array in case navData is undefined or malformed.
      return [];
    }

    // get all routes of the system.
    const routes = this._app.component('./express/index.js').getRoutes();

    // Resolve the path for each link based on the routes you have registered.
    const resolvedNavData = navData.map(link => {
      // Find the route object matching the `route` key in navData
      const route = routes.find(r => r.id === link.route);

      if (route) {
        // Assign the resolved path
        link.path = route.path;
      } else {
        // Default to '#' if no path is found for the route
        link.path = '#';
      }

      return link;
    });

    return resolvedNavData;
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

module.exports = new Nav();
