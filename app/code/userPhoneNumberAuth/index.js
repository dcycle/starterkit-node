
class UserPhoneNumberAuth extends require('../component/index.js') {

  async init(app) {
    super.init(app);

    return this;
  }

  dependencies() {
    return [
      './database/index.js',
    ];
  }

  loggedIn(req, res, next) {
    if (req.user) {
      next();
    } else {
      res.redirect('/login-with-phone-number');
    }
  }

  async generateToken(phoneNumber) {
    const token = await this._app.c('tokens').newToken({
      name: phoneNumber + ':token',
      permissions: ['some-permission', 'another-permission'],
      whatever: 'hello world',
      _length: 6,
      _digits_only: false,
    });

    return token;
  }

  // Send Token via your custom mechanism
  async sendToken(textframeworkSelected, phoneNumber, token) {
    // Use your existing mechanism to send the OTP
    // e.g., through SMS, email, etc.
    return await this._app.c('textFramework').sendText({
      plugin: textframeworkSelected,
      message: 'hello, your token is : ' + token,
      sendTo: phoneNumber
    });
  }

  // Request Token for login
  async sendTokenForLogin(req, res, next) {
    const { phoneNumber, textframeworkSelected } = req.body;

    // Validate phoneNumber number format (you can enhance this validation)
    if (!phoneNumber) {
      return res.status(400).send('Invalid phone number');
    }

    // Remove this code later.
    if (textframeworkSelected == "internal") {
      phoneNumber = 'robo';
    }

    const token = await this.generateToken(phoneNumber);
    // Send Token to the user's phoneNumber
    await this.sendToken(phoneNumber, token);
    let info = `Kindly Enter Login Token Sent through ${textframeworkSelected} message.`;

    // return res.send(`/login-token-verify?phoneNumber=${encodeURIComponent(phoneNumber)}&info=${encodeURIComponent(info)}`);
    return res.redirect(`/login-token-verify?phoneNumber=${encodeURIComponent(phoneNumber)}&info=${encodeURIComponent(info)}`);
  }

  // Verify OTP and authenticate user
  async verifyTokenAndLogin(req, res, next) {
    const { token, phoneNumber } = req.body;
    console.log("INSIDE post login token verify");
    console.log(token);
    console.log(phoneNumber);

    // Validate token: Check if it exists and is valid
    // Assuming you also pass phoneNumber to ensure the correct token is checked      
    const validToken = await this._app.c('tokens').checkToken(
      phoneNumber + ':token',
      token
    );

    if (validToken) {
      console.log("*********************** INSIDE validToken **********");
      this.userAuthenticate(req, res, next);
    } else {
      return res.redirect('/login-with-phone-number?info=Invalid or expired token. Please try again.');
    }
  }

  /**
   * Handle authentication using phoneNumber number and OTP.
   */
  async userAuthenticate(req, res, next) {
    const passport = this._app.component('./authentication/index.js').passport();
    passport.authenticate('phoneNumber-token', (err, user, info) => {
      if (err) {
        console.log('Error during phone Number authentication');
        console.log(err);
        return next(err);
      }

      if (!user) {
        console.log('Phone authentication failed: ' + info.message);
        return res.redirect('/login-with-phone-number?info=' + info.message);
      }

      // If successful, log the user in and create a session
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }

        console.log('User authenticated successfully');
        return res.redirect('/');  // Redirect to home page or dashboard
      });
    })(req, res, next);
  }

  async run(app)  {

    const authenticationWithphoneNumber = this._app.component('./authenticationWithPhone/index.js');
    if (!authenticationWithphoneNumber.initialized) {
      await authenticationWithphoneNumber.init(app);
    }

    const expressApp = app.component('./express/index.js').expressApp();

    expressApp.get('/login-with-phone-number',
      (req, res) => res.sendFile('login-with-phone-number.html',
      { root: '/usr/src/app/private' })
    );

    expressApp.get('/login-token-verify',
      (req, res) => res.sendFile('login-token-verify.html',
      { root: '/usr/src/app/private' })
    );

    expressApp.post('/auth/phone-number', async (req, res, next) => {
      await this.sendTokenForLogin(req, res, next);
    });

    expressApp.post('/login-token-verify', async (req, res, next) => {
      await this.verifyTokenAndLogin(req, res, next);
    });

    return this;
  }

}

module.exports = new UserPhoneNumberAuth();


    // const { otp } = req.body;
    // const { phoneNumber, otpExpiresAt } = req.session;

    // // Check if OTP has expired
    // if (Date.now() > otpExpiresAt) {
    //   return res.status(400).send('OTP has expired. Please request a new one.');
    // }

    // // Verify the OTP
    // if (otp === req.session.otp) {
    //   // OTP is correct, log the user in
    //   const user = await this.userDetails().findOne({ phoneNumber });

    //   if (!user) {
    //     // If the user does not exist, create a new user
    //     await this.createOrAlterUser(phoneNumber);
    //   }

    //   req.login(user, (err) => {
    //     if (err) {
    //       return res.status(500).send('Error logging in');
    //     }
    //     res.send('You are successfully logged in!');
    //   });
    // } else {
    //   res.status(400).send('Invalid OTP. Please try again.');
    // }


      // const { token, phoneNumber } = req.body;
      // console.log("INSIDE post login token verify");
      // console.log(token);
      // console.log(phoneNumber);

      // // Validate token: Check if it exists and is valid
      // // Assuming you also pass phoneNumber to ensure the correct token is checked      
      // const validToken = await app.c('tokens').checkToken(
      //   phoneNumber + ':token',
      //   token
      // );

      // if (validToken) {
      //   app.component('./authentication/index.js').passport().authenticate('local',
      //   (err, user, info) => {
      //     if (err) {
      //       console.log('error during /login phoneNumber number');
      //       console.log(err);
      //       return next(err);
      //     }

      //     if (!user) {
      //       console.log('no user during /login');
      //       console.log(info);
      //       return res.redirect('/login?info=' + info);
      //     }

      //     req.logIn(user, function(err) {
      //       console.log('There is a user, we are logging in');
      //       console.log(user);
      //       if (err) {
      //         return next(err);
      //       }

      //       return res.redirect('/');
      //     });
      //   })(req, res, next);
      // } else {
      //   return res.redirect('/login?info=Invalid or expired token. Please try again.');
      // }

  //   expressApp.post('/login', (req, res, next) => {
  //     app.component('./authentication/index.js').passport().authenticate('local',
  //     (err, user, info) => {
  //       if (err) {
  //         console.log('error during /login');
  //         console.log(err);
  //         return next(err);
  //       }

  //       if (!user) {
  //         console.log('no user during /login');
  //         console.log(info);
  //         return res.redirect('/login?info=' + info);
  //       }

  //       req.logIn(user, function(err) {
  //         console.log('There is a user, we are logging in');
  //         console.log(user);
  //         if (err) {
  //           return next(err);
  //         }

  //         return res.redirect('/');
  //       });
  //     })(req, res, next);
  //   });

  //   return this;
  // }
