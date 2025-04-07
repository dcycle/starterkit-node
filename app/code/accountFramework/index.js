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
      './express/index.js'
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
   * Finds an account framework by a userInfoId and returns only merged userIds
   *  field dont populate UserInfo.
   *
   * @param {string} userInfoId - The ObjectId of the user to search.
   * @returns {Promise<Object|null>} - The UserIds of merged account document if found,
   *  otherwise null.
   */
   async getOnlyUserIdsMAByUserId(userInfoId) {
    const account = await this.getAccountFrameworkModel().findOne({ 'userIds': userInfoId })
      .select('userIds -_id').lean();

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
      account = await this.app().c('authentication').userDetails().find({_id: userInfoObjectId});
      if (account) {
        return account;
      }
      else {
        return [];
      }
    }
  }

  /**
   * Retrieves Only Merged UserIds (dont populate userInfo) for the provided
   *  userInfoId and returns the associated userIds.
   *
   * @param {string} userInfoId - The ID of the user to fetch account information for.
   * @returns {Promise<Array>} - An array of userIds associated with the account framework.
   * @throws {Error} - Throws an error if the ObjectId is invalid.
   */
  async getUserIdsOfMergedAccounts(userInfoId) {
    // Validate the ObjectId
    await this.validateObjectId(userInfoId);
    const mongoose = this.app().component('./database/index.js').mongoose();
    const userInfoObjectId = new mongoose.Types.ObjectId(userInfoId);
    // Get only userIds field dont populate userInfo from a merge account.
    const mergedUserIds = await this.getOnlyUserIdsMAByUserId(userInfoObjectId);

    if (mergedUserIds) {
      return mergedUserIds.userIds;
    } else {
      return [userInfoId];
    }
  }

  /**
   * Checks if an account is merged by verifying if a user is associated with a merged account.
   *
   * This method validates the given `userInfoId` to ensure it's a valid MongoDB ObjectId.
   * After validation, it attempts to retrieve the account associated with the provided user ID
   * to determine if the account is merged with others.
   *
   * @param {string} userInfoId - The user ID of the account to check.
   * @returns {Promise<Object|null>} - Returns the account details if merged, or null if not merged.
   *
   * @throws {Error} If the userInfoId is invalid or the database operation fails.
   */
   async accountIsMerged(userInfoId) {
    try {
      // Step 1: Validate that the provided userInfoId is a valid MongoDB ObjectId
      await this.validateObjectId(userInfoId);
      // Step 2: Initialize mongoose and convert userInfoId to a valid MongoDB ObjectId
      const mongoose = this.app().component('./database/index.js').mongoose();
      const userInfoObjectId = new mongoose.Types.ObjectId(userInfoId);
      // Step 3: Find the account in the account Framework based on the validated ObjectId
      return await this.findAccountByUserId(userInfoObjectId);
    } catch (error) {
      // Step 4: Handle errors and throw them if the operation fails
      throw new Error(`Failed to check if the account is merged: ${error.message}`);
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
    // Check if either userInfoId1 or userInfoId2 is null
    if (userInfoId1 === null || userInfoId2 === null) {
      throw new Error("userInfoId1 and userInfoId2 cannot be null");
    }
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
          message = `User ids ${userInfoId1}, ${userInfoId2} are in the same account framework.`;
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
        message = `Removed ${userInfoId} from the account framework`;
        message += ` and created a new account framework with only this user.`;
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

  /**
   * Generates a token for the accounts merging.
   *
   * note :- token expiryduration set to 1 hour in config/versioned.yml.
   *
   * @param {string} name - The name to generate the token for.
   * @returns {Promise<string>} - The generated token.
   */
   async generateToken(name) {
    // If tokenExpiryDuration duration is 0 then token never expires.
    let tokenExpiryDuration = 0;
    // Fetch token Expiration time set in config.
    if (this.app().config().modules['./accountFramework/index.js'].tokenExpiryDuration) {
      tokenExpiryDuration = this.app().config().modules['./accountFramework/index.js'].tokenExpiryDuration;
    }

    const token = await this.app().c('tokens').newToken({
      name: name,
      permissions: ['some-permission', 'another-permission'],
      whatever: 'Token generated for merge accounts',
      _length: 12,
      _digits_only: false,
    }, tokenExpiryDuration);

    return token;
  }

  async run(app) {
    const that = this;
    // /account-framework/get-username?userid=<userid> path gets the user account details
    // from account framework. It will try to find merged userIds userIfo if not merged gets the
    // user data from userInfo.
    app.c('express').addRoute('accountFrameworkUserDetail', 'get', '/account-framework/get-username', async (req, res) => {
      const userdetails = await that.getAccounts(req.query.userid);
      if (userdetails) {
        res.header('Content-Type', 'application/json');
        res.send(JSON.stringify(userdetails['0']));
      }
    });

    // we have to pass username1 and username2. find user ids
    // of username1 and username2 and merge user ids.
    // We have written this code to test merge functionality
    // chat based tests cases.
    app.c('express').addRoute('accountFrameworkMerge', 'post', '/account-framework/merge-accounts/:token', async (req, res) => {
      try {
        // Capture the rest of the URL after /send/.
        const token = req.params.token;
        const isValidToken = app.c('helpers').validateToken(token, 'AUTH_API_TOKEN');
        if (!isValidToken) {
          return res.status(403).send('Invalid token.');
        }
        // @ts-ignore
        let { username1, username2 } = req.body;
        const userid1 = await app.c('authentication').user(username1);
        const userid2 = await app.c('authentication').user(username2);
        const response = await that.merge(userid1._id, userid2._id);
        res.status(200).send(JSON.stringify(response));
      } catch (error) {
        // @ts-ignore
        console.error(`Error merging account framework for ${username1}, ${username2}`, error);
        return { status: false, message: error.message };
      }
    });

    // we have to pass username. find user id of username and unmerge user id.
    // We have written this code to test merge functionality chat based tests cases.
    app.c('express').addRoute('accountFrameworkUnMerge', 'post', '/account-framework/unmerge-accounts/:token', async (req, res) => {
      try {
        // Capture the rest of the URL after /send/.
        const token = req.params.token;
        const isValidToken = app.c('helpers').validateToken(token, 'AUTH_API_TOKEN');
        if (!isValidToken) {
          return res.status(403).send('Invalid token.');
        }
        // @ts-ignore
        let { username } = req.body;
        const userid = await app.c('authentication').user(username);
        const response = await that.unmerge(userid._id);
        res.status(200).send(JSON.stringify(response));
      } catch (error) {
        // @ts-ignore
        console.error(`Error unmerging account framework for ${username}:`, error);
        return { status: false, message: error.message };
      }
    });

    // Add route for handling account merge UI requests
    app.c('express').addRoute('accountFrameworkMergeUI', 'get', '/account/merge', async (req, res) => {
      // This line checks if the account for the current logged-in user is already merged.
      // `req.user._id` contains the user ID from the session or authentication.
      const account = await that.accountIsMerged(req.user._id);
      // Declare a variable to hold the response object
      let response;
      // Check if the account is merged
      if (account) {
        // If the account is merged, return a response with account merged status as true
        // and the associated userIds of the merged accounts.
        response = {
          // Indicates the account is merged.
          'accountMerged': true,
          // Array of users info of a merged accounts.
          'accounts': account.userIds
        };
      }
      else {
        // If the account is not merged, return a response with accountMerged as false
        response = {
          // Indicates the account is not merged
          'accountMerged': false
        };
      }

      // Later in your code, add the 'title' property
      response.title = "Account Merge";

      // Render the 'accountMerge' template and pass the response data to the template
      // The 'accountMerge' template will be populated with the values of 'accountMerged' and 'accounts'
      app.c('theme').render(res, 'accountMerge', response);
    });

    // Add route for generating a token for account merge operation
    app.c('express').addRoute('accountFrameworkMergeUIGT', 'get', '/account/merge/generate-token', async (req, res) => {
      try {
        // Generate a token using the user's ID and a specific action ('merge-with-another-account')
        // The token will be associated with the user's ID
        const token = await that.generateToken("merge-with-another-account:" + req.user._id);
        // Check if the token was generated successfully
        if (token) {
          // If token generation is successful, send a response with the token and a success message
          res.status(200).send(JSON.stringify({
            // Token format is userID:generatedToken
            'token': req.user._id + ":" + token,
            // Success message
            'message': 'Token generated successfully. Copy this token and paste it in your other account'
          }));
        }
        else {
          // If token generation failed, send a response indicating the failure
          res.status(200).send(JSON.stringify({
            // No token generated
            'token': '',
            // Failure message
            'message': "Token hasn't generated."
          }));
        }
      } catch (error) {
        // Handle any errors that occur during the token generation process
        // Log the error for debugging purposes
        console.error(`Error at account framework generate token`, error);
        // Return an error response with status and message
        return res.status(500).send({
          // Indicates failure
          status: false,
          // Error message from the catch block
          message: error.message
        });
      }
    });

    // Add route to merge accounts through ui using a merge token.
    app.c('express').addRoute('accountFrameworkTokenSubmit', 'post', '/account/merge/token-submit', async (req, res) => {
      try {
        // Retrieve the merge token from the request body
        const mergeToken = req.body.token;
        // Split the token into userID and token parts using colon as separator
        const [userID, token] = mergeToken.split(':');

        // Check if both userID and token are provided
        if (!userID || !token) {
          // If either part is missing, return an error with status 400 and a message indicating invalid token format
          res.status(400).send(JSON.stringify({ message: 'Invalid Token format' }));
        }
        else {
          // Validate the token using the tokens service
          const validToken = await app.c('tokens').checkToken(
            "merge-with-another-account:" + userID,
            token
          );

          // If the token is valid, proceed with the account merge process
          if (validToken) {
            const mergeResponse = await that.merge(userID, req.user._id);
            // Retrieve the updated accounts for the user
            const accounts = await that.getAccounts(req.user._id);

            res.status(200).send(JSON.stringify({
              // Indicates the operation was successful
              'status': mergeResponse.status,
              // Message from the merge operation
              'message': mergeResponse.message,
              // The updated list of accounts after merging
              'accounts': accounts
            }));
          }
          else {
            // If the token is invalid, return a response with an invalid token message
            res.status(400).send(JSON.stringify({ message: 'Invalid Token format / Token expired / accounts already merged. Refresh the page and Enter New token.' }));
          }
        }
      } catch (error) {
        // Log any errors that occur during the process for debugging purposes
        // @ts-ignore is used to suppress TypeScript errors related to the console.error call
        console.error(`Error at account framework accountFrameworkTokenSubmit`, error);
        // Return an error response with status and message indicating the error
        return {
          // Indicates failure
          status: false,
          // The error message generated during the try block
          message: error.message
        };
      }
    });

    // Add route for handling account unmerge requests
    app.c('express').addRoute('accountFrameworkUnmergeSubmit', 'get', '/account/unmerge', async (req, res) => {
      try {
        // Call the 'unmerge' function to unmerge the account using the current user's ID (req.user._id)
        const unmergeResponse = await that.unmerge(req.user._id);
        // Send the unmerge response back to the client with a status code of 200 (OK)
        res.status(200).send(JSON.stringify(unmergeResponse));
      } catch (error) {
        // If an error occurs during the unmerge operation, log the error
        // @ts-ignore is used to suppress TypeScript errors related to the console.error call
        console.error(`Error at account framework accountFrameworkUnmergeSubmit`, error);

        // Return an error response with a failure status and the error message
        return res.status(500).send({
          status: false,           // Indicates failure
          message: error.message  // Error message generated during the unmerge process
        });
      }
    });

    return this;
  }

}

module.exports = new AccountFramework();
