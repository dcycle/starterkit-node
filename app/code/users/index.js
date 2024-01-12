/**
 * Manage users.
 */

class Users extends require('../component/index.js') {

  dependencies() {
    return [
      './database/index.js',
    ];
  }

  /**
   * Get a user, which can exist or not.
   *
   * @param struct
   *   A struct with an _id and name.
   *
   * @return
   *   A user object.
   */
  fromStruct(struct) {

  }

}

module.exports = new Users();
