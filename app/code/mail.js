// @flow
/**
 * Send email.
 *
 * See https://nodemailer.com/smtp/.
 */

'use strict';

module.exports = {

  /** Initialize the mail server. */
  init: function() {
    this.privateTransporter = this.nodemailer().createTransport({
      host: String(this.env().required('SMTP_HOST')),
      port: String(this.env().required('SMTP_PORT')),
      // auth: {
      //   user: String(this.env().required('SMTP_USER')),
      //   pass: String(this.env().required('SMTP_PASS')),
      // }
    });
    return this;
  },

  send: function(from, to, subject, body) {
    this.transporter().sendMail({
      from: from,
      to: to,
      subject: subject,
      text: body
    });
  },

  /** Get the instance of the transporter. */
  transporter: function() {
    return this.privateTransporter;
  },

  /** Mockable wrapper around env. */
  env: function() /*:: : Object */ {
    // $FlowExpectedError
    return require('./env.js');
  },

  /** Mockable wrapper around nodemailer. */
  nodemailer: function() /*:: : Object */ {
    // $FlowExpectedError
    return require('nodemailer');
  },
};
