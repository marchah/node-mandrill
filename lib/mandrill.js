'use strict';

const mandrill = require('mandrill-api/mandrill');
const Promise = require('bluebird');
const _ = require('lodash');

const utils = require('./utils');

/**
 * Mandrill Error
 * @param {String} message Error message
 */
function MandrillError(message) {
  if (!(this instanceof MandrillError)) {
    return new MandrillError(message);
  }
  this.name = 'MandrillError';
  this.message = message;
  this.stack = new Error(message).stack;
}

MandrillError.prototype = Object.create(Error.prototype);
MandrillError.prototype.constructor = MandrillError;

class Mandrill {
  constructor(options) {
    this.defaultFromEmail = _.get(options, 'DEFAULT_FROM_EMAIL');
    this.defaultFromName = _.get(options, 'DEFAULT_FROM_NAME');
    this.defaultTemplateOptions = _.get(options, 'DEFAULT_TEMPLATE_OPTIONS');
    const apiKey = _.get(
      options,
      'MANDRILL_API_KEY',
      utils.getEnv('MANDRILL_API_KEY')
    );
    if (_.isNil(apiKey)) {
      throw MandrillError('Mandrill API Key is missing');
    }

    this.mandrillClient = new mandrill.Mandrill(apiKey);
  }

  /**
   * Options example
   * {
   *    to: 'hugo@email.com',
   *    cc: 'sam@email.com',
   *    bcc: ['john@email.com', 'tracy@email.com'],
   *    fromEmail: 'no-reply@email.com',
   *    fromName: 'No Reply',
   *    subject: 'Reset Password Request',
   *    html: '<html>Test</html>', // html or text required
   *    text: 'Test',              // html or text required
   *    preserve_recipients: true, // boolean;
   *    merge_vars: Array<MergeVar>
   *  }
   */
  send(options) {
    const message = {
      html: options.html,
      text: options.text,
      subject: options.subject,
      from_email: options.fromEmail ? options.fromEmail : this.defaultFromEmail,
      from_name: options.fromName ? options.fromName : this.defaultFromName,
      to: [],
      attachments: options.attachments ? options.attachments : undefined,
      preserve_recipients: !!options.preserve_recipients,
      merge_vars: options.mergeVars,
    };

    if (!_.isUndefined(options.to)) {
      utils.addEmails(message, options.to, 'to');
    }

    if (!_.isUndefined(options.cc)) {
      utils.addEmails(message, options.cc, 'cc');
    }

    if (!_.isUndefined(options.bcc)) {
      utils.addEmails(message, options.bcc, 'bcc');
    }

    return new Promise((resolve, reject) => {
      this.mandrillClient.messages.send(
        {
          message: message,
          async: false
        },
        results => {
          resolve(results);
        },
        err => {
          reject(MandrillError(err.message));
        }
      );
    });
  }

  /**
   * Options example
   * {
   *    to: 'hugo@email.com',
   *    cc: 'sam@email.com',                              // optional
   *    bcc: ['john@email.com', 'tracy@email.com'],       // optional
   *    subject: 'Reset Password Request',                // optional [already has default value]
   *    html: '<html>Test</html>',                        // optional
   *    text: 'Test',                                     // optional
   *    global_merge_vars: [
   *      {'name': 'PASSWORD_RESET_LINK', 'content': 'http://google.com'},
   *    ],
   *    preserve_recipients: true,                        // optional
   *  }
   */
  sendTemplate(templateName, options) {
    if (_.isPlainObject(options.global_merge_vars)) {
      options.global_merge_vars = utils.convertMergeTagsObjectIntoArray(
        options.global_merge_vars
      );
    }

    let defaultOptions = {};

    if (!_.isUndefined(this.defaultTemplateOptions)) {
      defaultOptions = this.defaultTemplateOptions;
    }

    const message = _.assign(
      {
        from_email: options.fromEmail ? options.fromEmail : undefined,
        from_name: options.fromName ? options.fromName : undefined,
        inline_css: true,
        attachments: options.attachments ? options.attachments : undefined,
        preserve_recipients: !!options.preserve_recipients
      },
      defaultOptions,
      options,
      { to: [] }
    );

    if (defaultOptions) {
      utils.mergeGlobalVar(message, defaultOptions);
    }

    if (!_.isUndefined(options.to)) {
      utils.addEmails(message, options.to, 'to');
    }

    if (!_.isUndefined(options.cc)) {
      utils.addEmails(message, options.cc, 'cc');
    }

    if (!_.isUndefined(options.bcc)) {
      utils.addEmails(message, options.bcc, 'bcc');
    }

    return new Promise((resolve, reject) => {
      this.mandrillClient.messages.sendTemplate(
        {
          template_name: templateName,
          template_content: [],
          message: message,
          async: false
        },
        results => {
          resolve(results);
        },
        err => {
          reject(MandrillError(err.message));
        }
      );
    });
  }
}

Mandrill.Error = MandrillError;

module.exports = Mandrill;
