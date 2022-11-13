// @flow
/**
 * Interacts with a GitHub app.
 */

 class GitHubApp extends require('../component/index.js') {

  jwt() {
    // $FlowFixMe
    return require('jsonwebtoken');
  }

  openssl() {
    // $FlowFixMe
    return require('openssl-nodejs');
  }

  /**
   * Get a JWT from a private key.
   *
   * See
   * https://docs.github.com/en/developers/apps/building-github-apps/authenticating-with-github-apps#authenticating-as-a-github-app.
   */
  privateKeyToJwt() {
    app_id = this.app().config().modules['./gitHubApp/index.js'].appId;
    private_pem = this.app().config().modules['./gitHubApp/index.js'].privateKey;
    private_key = OpenSSL::PKey::RSA.new(private_pem)

    payload = {
      // issued at time, 60 seconds in the past to allow for clock drift
      iat: Date.now()/1000 - 60,
      // JWT expiration time (10 minute maximum)
      exp: Date.now()/1000 + (10 * 60),
      // GitHub App's identifier
      iss: app_id,
    }

    return this.jwt().encode(payload, private_key, "RS256");
  }

}

// $FlowExpectedError
module.exports = new GitHubApp();
