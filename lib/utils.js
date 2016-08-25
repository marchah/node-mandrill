'use strict';

const _ = require('lodash');

function addEmail(message, email, type) {
  if (_.isString(email) && email.length > 0) {
    message.to.push({ email, type });
  }
}

function addEmails(message, emails, type) {
  if (_.isArray(emails)) {
    emails.forEach((email) => {
      addEmail(message, email, type);
    });
  }
  else {
    addEmail(message, emails, type);
  }
  message.to = _.uniqBy(message.to, 'email');
}

function convertMergeTagsObjectIntoArray(mergeTags) {
  const mergeTagsArray = [];

  _.forOwn(mergeTags, (value, key) => {
    mergeTagsArray.push({ name: key, content: value });
  });

  return mergeTagsArray;
}

function mergeGlobalVar(message, defaultOptions) {
  defaultOptions.global_merge_vars.forEach((itemDefault) => {
    let flag = false;
    message.global_merge_vars.forEach((item) => {
      if (itemDefault.name === item.name) {
        flag = true;
      }
    });
    if (!flag) {
      message.global_merge_vars.push(itemDefault);
    }
  });
}

function getEnv(name, value) {
  if (name in process.env) {
    return process.env[name];
  }
  return value;
}

module.exports = {
  addEmails,
  convertMergeTagsObjectIntoArray,
  mergeGlobalVar,
  getEnv,
};