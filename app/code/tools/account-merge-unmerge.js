/**
 * Functionality written to execute merge, unmerge, userinfo of accounts
 *  by username through shell.
 */

(async function () {
  'use strict';
  const app = require('../app.js');
  app.init().then(async () => {
    const env = app.c('env');
    // fetch EXEC environment variable value to know merge or unmerge
    // or info functionality to be executed.
    const exec = String(env.required('EXEC'));

    // Function to check if a user exists and return status
    const checkUserExists = async (username) => {
      const numberOfUser = await app.c('authentication').userExists(username);

      if (numberOfUser === 0) {
        console.log(`[error] there is no account with username "${username}"`);
        return false;
      } else if (numberOfUser > 1) {
        console.log(`[error] There are more than one account for username "${username}"`);
        return false;
      } else {
        console.log(`[ok] There is exactly one account with username "${username}"`);
      }
      return true;
    };

    // Handle logic based on the value of exec
    if (exec === 'merge') {
      // 2 username required to merge the accounts
      const username1 = String(env.required('USERNAME1'));
      const username2 = String(env.required('USERNAME2'));

      // Check for both users exist if not stop furthur execution.
      if (!(await checkUserExists(username1)) || !(await checkUserExists(username2))) {
        await app.exitGracefully();
      }
      // Fetch user info of user by user name to get user ids.
      const userInfo1 = await app.c('authentication').user(username1);
      const userInfo2 = await app.c('authentication').user(username2);
      // Run merge functionality
      const mergeResponse = await app.c('accountFramework').merge(userInfo1, userInfo2);
      if (mergeResponse.status) {
        console.log(`[ok] UserInfo Accunt "${username1}" and "${username2}" are merged.`);
      } else {
        console.log(`[error] Merge failed: ${mergeResponse.message}`);
      }
    } else if (exec === 'unmerge') {
      // fetch username to unmerge account.
      const username = String(env.required('USERNAME'));
      // Check for user if not found stop furthur execution.
      if (!(await checkUserExists(username))) {
        await app.exitGracefully();
      }

      // Get user details from user name
      const userInfo = await app.c('authentication').user(username);
      console.log(`Account    : \"${username}\" `);
      console.log(`Account Id : \"${userInfo._id}\" `);

      // Call Unmerge functionality
      const unmergeResponse = await app.c('accountFramework').unmerge(userInfo._id);

      if (unmergeResponse.status) {
        console.log(`[ok] Unmerge successful.`);
        console.log(unmergeResponse.message);
      } else {
        console.log(`[error] Unmerge unsuccessful! The account "${username}" might not be a merged account.`);
      }
    } else if (exec === 'info') {
      // fetch username to get user info.
      const username = String(env.required('USERNAME'));
      if (!(await checkUserExists(username))) {
        await app.exitGracefully();
      }

      // Get user details from username
      const userInfo = await app.c('authentication').user(username);
      console.log(`Account    : \"${username}\" `);
      console.log(`Account Id : \"${userInfo._id}\" `);

      // Run Info functionality
      const infoResponse = await app.c('accountFramework').getAccounts(userInfo._id);

      if (infoResponse.length > 1) {
        console.log(`[ok] User account with name "${username}" is a merged account.`);
        console.log(`This account ID "${userInfo._id}" is part of this group of merged accounts:`);
      } else {
        console.log(`[x] User account with name "${username}" is not a merged account.`);
      }
      console.log(infoResponse);
    } else {
      console.log(`[error] Invalid value for 'exec'. Expected 'merge', 'unmerge', or 'info'.`);
    }

    console.log(" ---- [done] ---- ");
    await app.exitGracefully();
  });
})();
