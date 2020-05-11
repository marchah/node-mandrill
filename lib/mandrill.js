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
   *    merge_vars: Array<RecipientVariables>
   *    track_clicks: options.trackClicks,
   *    track_opens: options.trackOpens,
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
      merge_vars: options.recipientVariables,
      track_clicks: options.trackClicks,
      track_opens: options.trackOpens,
      metadata: options.metadata,
      recipient_metadata: options.recipientMetadata,
    };

    if (options.headers) {
      message.headers = options.headers;
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

  /**
   *
   * @param {*} options Example
   *
   * {
   *   key: string; // Mandrill API KEY, should automatically be included in Mandrill class
   *   query: string;
   *   dateFrom: string; // "2013-01-01",
   *   dateTo: string; // "2013-01-02",
   *   tags: Array<string>;
   *   senders: Array<string>;
   *   apiKeys: Array<string>;
   *   limit: number // default: 100
   */

  search(options) {
    const formattedOptions = {
      query: options.query,
      tags: options.tags || [],
      senders: options.senders || [],
      api_keys: options.apiKeys || [],
      limit: 100,
    };

    if (options.date_from) {
      formattedOptions.date_from = options.dateFrom;
    }

    if (options.date_to) {
      formattedOptions.date_to = options.dateTo;
    }

    return new Promise((resolve, reject) => {
      this.mandrillClient.messages.search(
        {
          ...formattedOptions,
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
