// @ts-check
// The TypeScript engine will check all JavaScript in this file.

/**
 * Observers functionality.
 */
 class Observers extends require('../component/index.js') {

  /**
   * @property {Function} init Initializes this object.
   * @returns Observers
   */
  async init(app)  {
    super.init(app);

    this.observer = app.component('./database/index.js').mongoose().model('observers', {
      uuid: {
        type: String,
        // Generate a new UUID by default when a new document is created
        // default: this.uuid(),
        // Ensure UUID is unique
        unique: true
      },
      module: {
        type: String,
        required: true
      },
      verb: {
        type: String,
        required: true
      },
      // '*' for all numbers or a specific phone number
      applyTo: {
        type: String,
        required: true
      },
      callback: {
        // Store callback as a string (e.g., name of the function)
        type: String,
        required: true
      },
      expire: {
        // Store as a string, could represent time (e.g., "+1 hour", or a specific date)
        type: String,
        required: true
      }
    });

    return this;
  }

  // https://github.com/jshint/jshint/issues/3361
  /* jshint ignore:start */
  observer;
  /* jshint ignore:end */

  /**
   * Returns the dependencies.
   * @returns {String[]}
   */
  dependencies() {
    return [
      // Dependency on express module
      './express/index.js',
      './database/index.js',
    ];
  }

  collection() {
    return this.app().c('database').client()
      .db('login')
      .collection('observers');
  }

  /**
   * Fetch the "whatsappMessages" model.
   */
   observers() {
    // Sample usage:
    // this.observers().find({},(err, observers)=> {
    //   return observers;
    // });

    return this.observer;
  }

  /** Store a observer */
  async addObserver(
    observerObject /*:: : Object */
  ) {
    try {
      const uniqueUuid = await this.generateUniqueUuid();
      observerObject.uuid = uniqueUuid;
      const observer = await this.observers()(observerObject);
      return observer.save().then(async (value)=> {
        console.log("!! observer saved to database !!");
        return value.uuid;
      }).catch((err)=>{
        console.log(err);
        return false;
      });
    } catch (error) {
      // Handle Mongoose validation errors
      if (error.name === 'ValidationError') {
        console.error('Validation Error:', error.message);
        throw new Error('Validation error occurred while storing observer.');
      }
      // Handle other types of errors
      console.error('Error storing observer:', error);
      throw new Error('An error occurred while storing observer.');
    }
  }

  async updateOne(
    uuid,
    fieldName,
    fieldValue
  ) {
    let obj = {};
    obj[fieldName] = fieldValue;    
    await this.collection().updateOne({
      uuid: uuid,
    }, {
      $set: obj,
    });
  }

  // Function to find a observer by UUID
  async findByUuid(uuid) {
    try {
      // Get observer by UUID exists in the database.
      let observer = await this.observers().findOne({ uuid: uuid });
      return observer;
    } catch (error) {
      console.error("Error getting observer:", error);
      return false;
    }
  }

  // Function to delete a observer by UUID
  async deleteByUuid(uuid) {
    try {
      const result = await this.observers().deleteOne({ uuid });
      if (result.deletedCount === 0) {
        console.log("No observer found with that UUID.");
      } else {
        console.log(`Observer with UUID: ${uuid} has been deleted.`);
      }
      return true;
    } catch (error) {
      console.error("Error deleting observer:", error);
      return false;
    }
  }

  async observersGetAll() {
    try {
      const observers = await this.observers().find({});
      // Return the fetched observers
      return observers;
    } catch (err) {
      console.error("Error fetching observers:", err);
      // Return an empty array or handle error as needed
      return [];
    }
  }

  /**
   * Get a UUID.
   *
   * @returns string
   *   A UUID.
   */
  async generateUniqueUuid() {
    // Import UUID for generating unique conversation IDs.
    // @ts-ignore
    const { v4: uuidv4 } = require('uuid');
    let newUuid = uuidv4();

    // Check if the UUID already exists in the database
    let existingObserver = await this.findByUuid({ uuid: newUuid });

    // If the UUID already exists, generate a new one
    while (existingObserver) {
      newUuid = uuidv4();
      existingObserver = await this.findByUuid({ uuid: newUuid });
    }

    return newUuid;
  }
}

module.exports = new Observers();
