/**
 * Tokens management.
 */

class Tokens extends require('../component/index.js') {

  dependencies() {
    return [
      './express/index.js',
      './crypto/index.js',
    ];
  }

  /**
   * @property {Function} init Initializes this object.
   * @returns Chat
   */
   async init(app)  {
    super.init(app);

    const Schema = app.component('./database/index.js').mongoose().Schema;
    const tokensSchema = new Schema({
      name: { type: String, required: true },
      permissions: { type: [String], required: true },
      whatever: { type: String, required: true },
      _length: { type: Number, required: true },
      _digits_only: { type: Boolean, required: true },
      _hash: { type: String, required: true },
      _token: { type: String, required: true },
    });

    this.tokensModel = app.component('./database/index.js').mongoose().model('tokens', tokensSchema);

    return this;
  }

  // https://github.com/jshint/jshint/issues/3361
  /* jshint ignore:start */
  tokensModel;
  /* jshint ignore:end */

  tokens() {
    return [];
  }

  /**
   * Fetch the "observers" model.
   */
   getTokensModel() {
    // Sample usage:
    // this.getTokensModel().find({});

    return this.tokensModel;
  }

  /**
   * Checks if a token exists in the database based on the provided name and token value.
   *
   * This method queries the database to find a document in the `Tokens` collection where the `name`
   * matches the provided `name` and the `_token` matches the provided `token`. Optionally, a `fields`
   * can be provided to specify which fields to return in the query result.
   *
   * @param {string} name - The name associated with the token (e.g., "userAuthentication").
   * @param {string} token - The token value to check for existence in the database.
   * @param {string} [fields=""] - A string representing the fields to be included or excluded in the result.
   *                                      If omitted or an empty string is provided, all fields will be returned.
   *
   * @returns {Promise<Object|null>} - A promise that resolves to the token record if found, otherwise `null`.
   *
   * @throws {Error} - Throws an error if the query fails or there are issues accessing the database.
   *
   * @example
   * const tokenRecord = await app.c('tokens').checkTokenExists('userAuthentication', '12345678', 'name _token permissions');
   * if (tokenRecord) {
   *   console.log('Token exists:', tokenRecord);
   * } else {
   *   console.log('Token not found');
   * }
   */
  async checkTokenExists(name, token, fields = "") {
    // Query the database to find if the token exists in the _token field
    const existingToken = await this.getTokensModel().findOne({
      name: name,
      _token: token
    }, fields);
    return existingToken;
  }

  /**
   * Generates a unique token based on the specifications in the `tokenObject`.
   *
   * This method generates a random token with either digits-only or alphanumeric characters,
   * based on the `tokenObject`'s `_digits_only` and `_length` properties. It ensures the generated
   * token is unique by checking against existing tokens in the database. If a token already exists,
   * a new one will be generated until a unique token is found.
   *
   * @param {Object} tokenObject - The object containing the specifications for the token.
   * @param {number} tokenObject._length - The length of the token to generate.
   * @param {boolean} tokenObject._digits_only - If `true`, the token will consist only of digits.
   * @param {string} tokenObject.name - The name or category associated with the token (used for uniqueness check).
   *
   * @returns {Promise<string>} - A unique token as a string.
   *
   * @throws {Error} - Throws an error if there is an issue checking for token uniqueness or generating the token.
   *
   * @example
   * const tokenObject = {
   *   _length: 8,
   *   _digits_only: true,
   *   name: 'userAuthentication'
   * };
   *
   * const generatedToken = await app.c('tokens').generateToken(tokenObject);
   * console.log(generatedToken);  // Example output: "12345678"
   */
  async generateToken(tokenObject) {
    let token;
    let existingToken;

    do {
      if (tokenObject._digits_only) {
        // If the token should be digits-only, use randomDigital method
        token = this._app.c('crypto').randomDigits(tokenObject._length);
      } else {
        // Otherwise, generate a random string of the specified length
        token = this._app.c('crypto').random(tokenObject._length);
      }

      existingToken = await this.checkTokenExists(tokenObject.name, token);

    } while (existingToken);

    return token;
  }

  /**
   * Saves a token object to the database.
   *
   * This method takes a `tokenObject`, creates a new instance of the
   *  associated Mongoose model,
   * and saves it to the database. If the save operation is successful,
   *  the saved token object
   * is returned. If an error occurs, it is caught and logged, and an
   *  error is thrown.
   *
   * @param {Object} tokenObject - The token object to be saved to the database.
   *
   * @returns {Promise<Object>} - The saved token object returned after
   *  being saved in the database.
   *
   * @throws {Error} - Throws an error if the token cannot be saved due
   *  to a database issue.
   *
   * @example
   * const tokenObject = {
   *   _token: '12345678',
   *   _hash: 'abcdefg12345678',
   *   name: 'userAuthentication',
   *   permissions: ['read', 'write'],
   *   whatever: 'Some additional data',
   *   _length: 8,
   *   _digits_only: true
   * };
   *
   * try {
   *   const savedToken = await app.c('tokens').saveTokenToDatabase(tokenObject);
   *   console.log('Token saved:', savedToken);
   * } catch (error) {
   *   console.error('Failed to save token:', error.message);
   * }
   */
  async saveTokenToDatabase(tokenObject) {
    try {
      // Get the Mongoose model and create a new instance with the tokenObject
      const TokenModel = this.getTokensModel();
      const saveToken = new TokenModel(tokenObject);

      // Save the token to the database
      await saveToken.save();

      console.log("Token saved!!!");
      // Return success message
      return saveToken;
    } catch (error) {
      // Log the error and throw it to be handled by the caller
      console.error("Error saving token:", error);
      throw new Error("Failed to save token");
    }
  }

  /**
   * Check if the provided token is valid by verifying its hash.
   *
   * This method orchestrates the process of fetching the token record
   *  from the database,
   * cloning the record, generating a new hash, and verifying the integrity
   *  of the token.
   *
   * @param {string} name - The name associated with the token.
   * @param {string} tokenToVerify - The token value to verify.
   * @returns {Promise<boolean|null>} - Returns `true` if the token is valid,
   *  `false` if it's invalid, or `null` if no record is found.
   *
   * @throws {Error} - Throws an error if there is any issue during
   *  the process.
   *
   * @example
   * const isValid = await app.c('tokens').checkToken('exampleName', 'exampleToken');
   * if (isValid) {
   *   console.log('The token is valid.');
   * } else {
   *   console.log('The token is invalid.');
   * }
   */
  async checkToken(name, tokenToVerify) {
    try {
      // Fetch the token record from the database
      const tokensRecord = await this.fetchTokenRecord(name, tokenToVerify);

      // If no token record is found, log and return null
      if (!tokensRecord) {
        console.log(`No tokens found with name: ${name} and ${tokenToVerify}`);
        return null;
      }

      // Perform hash verification
      const isValid = await this.verifyTokenHash(tokensRecord, tokenToVerify);

      if (isValid) {
        console.log(`The token '${tokenToVerify}' is correct.`);
        return true;  // Return true if the token is valid
      } else {
        console.log(`The token '${tokenToVerify}' is incorrect.`);
        return false;  // Return false if the token is invalid
      }

    } catch (error) {
      // Handle any potential errors during the process
      console.error("Error checking token:", error);
      throw new Error(error);
    }
  }

  /**
   * Fetches the token record from the database using the provided name and token.
   *
   * @param {string} name - The name associated with the token.
   * @param {string} tokenToVerify - The token value to verify.
   *
   * @returns {Promise<Object|null>} - Returns the token record if found,
   *  otherwise null.
   *
   * @example
   * const tokenRecord = await app.c('tokens').fetchTokenRecord('exampleName', 'exampleToken');
   */
  async fetchTokenRecord(name, tokenToVerify) {
    try {
      return await this.checkTokenExists(
        name,
        tokenToVerify,
        'name permissions whatever _length _digits_only _token _hash -_id'
      );
    } catch (error) {
      console.error('Error fetching token record:', error);
      throw new Error('Failed to fetch token record from the database');
    }
  }

  /**
   * Creates a deep clone of the token record and removes
   * fields (_hash, _token, _id) to regenerate hash from provided token.
   *
   * @param {Object} tokensRecord - The token record to clone.
   * @returns {Object} - The cloned token record with fields removed.
   *
   * @example
   * const clonedRecord = app.c('tokens').cloneTokenRecord(tokenRecord);
   */
  cloneTokenRecord(tokensRecord) {
    // Perform a deep clone of the tokensRecord and remove sensitive fields
    const clonedTokensRecord = JSON.parse(JSON.stringify(tokensRecord));
    // Remove the stored hash from the cloned object
    delete clonedTokensRecord._hash;
    // Remove the _id field (if necessary)
    delete clonedTokensRecord._id;
    return clonedTokensRecord;
  }

  /**
   * Generates a hash for the token record, excluding the
   *  fields (_hash, _token, _id).
   *
   * @param {Object} clonedTokensRecord - The cloned token record to
   *  generate a hash for.
   * @param {string} tokenToVerify - The token value to verify.
   *
   * @returns {Promise<string>} - Returns the generated hash as a string.
   *
   * @example
   * const newHash = await app.c('tokens').generateHashForToken(clonedTokensRecord, tokenToVerify);
   */
  async generateHash(clonedTokensRecord, tokenToVerify = "") {
    try {
      if (tokenToVerify) {
        clonedTokensRecord._token = tokenToVerify;
      }
      // Generate the hash based on the cloned token record (excluding sensitive fields)
      return await this._app.c('crypto').hash(JSON.stringify(clonedTokensRecord));
    } catch (error) {
      console.error('Error generating hash for token:', error);
      throw new Error('Failed to generate hash for the token');
    }
  }

  /**
   * In this function get _hash value in tokensRecord object(stored in database)
   *  assign _hash value to oldHash variable, clone the tokenRecord so that
   *  if we delete _hash value in cloned object would not delete _hash
   *  value assigned to the oldHash. Then replace value of
   *  clonedTokensRecord._token with tokenToVerify. Now hash clonedTokensRecord
   *  to get newHash for the tokenToVerify.
   *
   * hash function generates different hash value for a same string. Hence
   *  instead of comparing oldHash and newHash we are calling
   *  await this._app.c('crypto').checkHash() method for newHash, tokensRecord
   *  and oldHash, tokensRecord. In both the case if checkHash() return true
   *  then token is valid (oldHashVerify === newHashVerify).
   *
   * @param {Object} tokensRecord - The token record with the stored hash.
   * @param {string} tokenToVerify - The token value to verify.
   *
   * @returns {Promise<boolean>} - Returns `true` if the hashes match, `false` otherwise.
   *
   * @example
   * const isValid = await app.c('tokens').verifyTokenHash(tokensRecord);
   */
  async verifyTokenHash(tokensRecord, tokenToVerify) {
    try {
      const oldHash = tokensRecord._hash;

      // Clone the token record and remove sensitive fields
      const clonedTokensRecord = this.cloneTokenRecord(tokensRecord);

      // Generate the new hash from the cloned token record
      const newHash = await this.generateHash(
        clonedTokensRecord,
        tokenToVerify
      );

      // validate hash value generated for the string is true
      const oldHashVerify = await this._app.c('crypto').checkHash(
        oldHash,
        JSON.stringify(tokensRecord)
      );
      // validate hash value generated for the string is true
      const newHashVerify = await this._app.c('crypto').checkHash(
        newHash,
        JSON.stringify(tokensRecord)
      );

      // Return whether the hashes match. If both are true then token is valid.
      return oldHashVerify === newHashVerify;
    } catch (error) {
      console.error('Error verifying token hash:', error);
      throw new Error('Failed to verify token hash');
    }
  }

  /**
   * Creates a new token, hashes the token object, and saves it to the database.
   *
   * This method generates a token based on the specifications in the
   *  `tokenObject`,
   * adds the token to the object, generates a hash of the token object,
   *  and then saves
   * the object to the database. The object is returned after it is saved
   *  to the database.
   *
   * @param {Object} tokenObject - The object containing the specifications
   *  for the token.
   *
   * @returns {Promise<String>} - The token from saved token object
   *  after it has been successfully saved to the database.
   *
   * @throws {Error} - Throws an error if any part of the token generation
   *  or database saving fails.
   *
   * @example
   * const tokenObject = {
   *   name: 'something',
   *   permissions: ['some-permission', 'another-permission'],
   *   whatever: 'hello world',
   *   _length: 6,
   *   _digits_only: true
   * };
   *
   * name - The name associated with the token.
   * permissions - An array of permissions associated with the token.
   * whatever - Some additional data, which might be useful for token
   *  generation or processing.
   * _length - The length of the token (used by the token generation method).
   * _digits_only - Whether the token should consist only of digits.
   *
   * const result = await app.c('tokens').newToken(tokenObject);
   * console.log('Genereated token is:', result);
   */
  async newToken(tokenObject) {
    // Generate the token based on the specifications
    const token = await this.generateToken(tokenObject);
    // Add the generated token to the tokenObject
    tokenObject._token = token;

    // Generate a hash of the token object
    const myhash = await this.generateHash(tokenObject);
    // Store the hash
    tokenObject._hash = myhash;

    const savedObject = await this.saveTokenToDatabase(tokenObject);

    // Save the token object to the database and returns token.
    return savedObject._token;
  }

}

module.exports = new Tokens();
