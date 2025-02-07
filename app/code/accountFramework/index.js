/**
 * AccountFramework provides API to merge accounts.
 *
 * Let's say someone logs in with GitHub, then Google, then a phone number,
 * it should be possible to merge those accounts so that whatever account you
 * log in with, it will always be the same account.
 */

class AccountFramework extends require('../component/index.js') {

  dependencies() {
    return [
      './database/index.js',
    ];
  }

  /**
   * @property {Function} init Initializes this object.
   * @returns AccountFramework
   */
   async init(app)  {
    super.init(app);

    const Schema = app.component('./database/index.js').mongoose().Schema;

    const accountFrameworkSchema = new Schema({
      // Reference to the User model
      userIds: [{ type: Schema.Types.ObjectId, ref: 'userInfo' }]
    });

    this.accountFrameworkModel = app.component('./database/index.js').mongoose().model('accountFramework', accountFrameworkSchema);

    return this;
  }

  // https://github.com/jshint/jshint/issues/3361
  /* jshint ignore:start */
  accountFrameworkModel;
  /* jshint ignore:end */

  /**
   * Fetch the "accountFramework" model.
   */
   getAccountFrameworkModel() {
    // Sample usage:
    // this.getAccountFrameworkModel().find({});

    return this.accountFrameworkModel;
  }

  /**
   * Validates if the provided userInfoId is a valid MongoDB ObjectId.
   *
   * @param {string} userInfoId - The ID to be validated.
   * @throws {Error} - Throws an error if the ObjectId is invalid.
   */
  async validateObjectId(userInfoId) {
    const mongoose = this.app().component('./database/index.js').mongoose();
    if (!mongoose.Types.ObjectId.isValid(userInfoId)) {
      throw new Error(`Invalid ObjectId: ${userInfoId}`);
    }
  }

  /**
   * Finds an account framework by a userInfoId.
   *
   * @param {string} userInfoId - The ObjectId of the user to search.
   * @returns {Promise<Object|null>} - The account document if found, otherwise null.
   */
  async findAccountByUserId(userInfoId) {
    const account = await this.getAccountFrameworkModel().findOne({ 'userIds': userInfoId })
      .select('userIds -_id')
      .populate('userIds')
      .lean();

    return account;
  }

  /**
   * Creates a new account framework with the provided userIds and saves it.
   *
   * @param {Array<string>} userIds - The userIds to be included in the new account framework.
   * @returns {Promise<Object>} - The newly created account framework.
   */
  async createNewAccountFramework(userIds) {
    const accountFramework = new (this.getAccountFrameworkModel())({
      userIds: userIds
    });

    await accountFramework.save();
    return accountFramework;
  }

  /**
   * Merges two account frameworks by combining their userIds and deleting the later one.
   *
   * @param {Object} account1 - The first account framework to be merged.
   * @param {Object} account2 - The second account framework to be merged.
   * @returns {Promise<void>} - Resolves when the merge operation is completed.
   */
  async mergeAccountFrameworks(account1, account2) {
    const mergedGroup = [...account1.userIds, ...account2.userIds];
    const uniqueGroup = [...new Set(mergedGroup)];

    account1.userIds = uniqueGroup;
    account2.userIds = uniqueGroup;

    // Save the merged accountFrameworks
    await account1.save();
    await account2.save();

    // Delete the later account framework
    await this.getAccountFrameworkModel().findByIdAndDelete(account2._id);
  }

  /**
   * Retrieves accounts for the provided userInfoId and returns the associated userIds.
   *
   * @param {string} userInfoId - The ID of the user to fetch account information for.
   * @returns {Promise<Array>} - An array of userIds associated with the account framework.
   * @throws {Error} - Throws an error if the ObjectId is invalid.
   */
  async getAccounts(userInfoId) {
    // Validate the ObjectId
    await this.validateObjectId(userInfoId);
    let account;
    const mongoose = this.app().component('./database/index.js').mongoose();
    const userInfoObjectId = new mongoose.Types.ObjectId(userInfoId);
    account = await this.findAccountByUserId(userInfoObjectId);

    if (account) {
      return account.userIds;
    } else {
      account = await this._app.c('authentication').userDetails().find({_id:'679cab8c2c8c9642d2d862b1'});
      if (account) {
        return account;
      }
      else {
        return [];
      }
    }
  }

  /**
   * Merges two accounts into a single account framework.
   * If the accounts are in separate frameworks, it creates a new merged framework.
   * If the accounts are in the same framework, it simply updates the userIds.
   *
   * @param {string} userInfoId1 - The ObjectId of the first user.
   * @param {string} userInfoId2 - The ObjectId of the second user.
   * @returns {Promise<Object>} - The status and message of the merge operation.
   */
  async merge(userInfoId1, userInfoId2) {
    try {
      let message = '';
      const status = true;

      // Find account frameworks for both users
      // Find the account framework that contains userInfoId1
      const account1 = await this.getAccountFrameworkModel().findOne({ 'userIds': userInfoId1 });

      // Find the account framework that contains userInfoid2
      const account2 = await this.getAccountFrameworkModel().findOne({ 'userIds': userInfoId2 });

      if (!account1 && !account2) {
        // Case: Neither account exists in an account framework
        const newAccount = await this.createNewAccountFramework([userInfoId1, userInfoId2]);
        message = 'Both accounts are not in account frameworks, created a new merged account framework.';
      } else if (account1 && !account2) {
        // Case: account1 exists but account2 does not
        account1.userIds.push(userInfoId2);
        await account1.save();
        message = 'Account1 exists in an account framework, added userInfoId2 to account1\'s framework.';
      } else if (!account1 && account2) {
        // Case: account2 exists but account1 does not
        account2.userIds.push(userInfoId1);
        await account2.save();
        message = 'Account2 exists in an account framework, added userInfoId1 to account2\'s framework.';
      } else {
        // Case: Both accounts exist in separate frameworks
        if (!account1._id.equals(account2._id)) {
          await this.mergeAccountFrameworks(account1, account2);
          message = 'Both accounts are already in account frameworks, merged them and deleted the later one.';
        } else {
          message = `${userInfoId1}, ${userInfoId2} are in the same account framework.`;
        }
      }

      return { status, message };
    } catch (error) {
      console.error('Error merging account frameworks:', error);
      throw new Error(`Failed to merge account frameworks: ${error.message}`);
    }
  }

  /**
   * Unmerges a user from an account framework, removing them from the existing framework 
   * and creating a new account framework for them alone.
   *
   * @param {string} userInfoId - The ObjectId of the user to be unmerged.
   * @returns {Promise<Object>} - The status and message of the unmerge operation.
   */
  async unmerge(userInfoId) {
    try {
      let status;
      let message;
      // Find the account framework that contains the user
      const account = await this.getAccountFrameworkModel().findOne({ 'userIds': userInfoId });
      if (!account) {
        return {
          status: false,
          message: `Account Framework not found for userIds ${userInfoId}`
        };
      }

      if (account.userIds.length > 1) {
        // Remove the user from the account framework
        account.userIds = account.userIds.filter(id => !id.equals(userInfoId));
        await account.save();

        // Create a new account framework with only this user
        await this.createNewAccountFramework([userInfoId]);
        status = true;
        message = 'Removed userInfoId from the account framework';
        message += ' and created a new account framework with only this user.';
      }
      else {
        status = false;
        message = "account framework doc don't have multiple userIds";
      }
      return { status: status, message: message};
    } catch (error) {
      console.error(`Error unmerging account framework for ${userInfoId}:`, error);
      return { status: false, message: error.message };
    }
  }

}

module.exports = new AccountFramework();
