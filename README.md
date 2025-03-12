# node-mandrill
A simple node.js wrapper for MailChimp's Mandrill API

## Documentation

### Usage

### Constructor options

* `MANDRILL_API_KEY`          {String} api key value (can also be specified with environment variable `MANDRILL_API_KEY`)
* `DEFAULT_FROM_EMAIL`        {String} default from email (optional)
* `DEFAULT_FROM_NAME`         {String} default from name (optional)
* `DEFAULT_TEMPLATE_OPTIONS`  {Object} default template options (optional)


### Methods

#### instance.send(options)

Return a fulfilled promise with mandrill response. See Below for `options` schema

#### instance.send(templateName, options)

Return a fulfilled promise with mandrill response. See Below for `options` schema


### Options Schema

* `to` {String/Array} email recipient or array of emails recipients
* `cc` {String/Array} email carbon copy or array of emails carbon copies (optional)
* `bcc` {String/Array} email blind carbon copy or array of emails blind carbon copies (optional)
* `subject` {String} email subject (optional)
* `html` {String} email HTML code (optional) (can be use only for `send`)
* `text` {String} email text (optional) (can be use only for `send`)
* `global_merge_vars` {Object} global merge vars, (optional) (see [Mandrill documentation](https://mandrillapp.com/api/docs/messages.nodejs.html) for more informations on it)
* `attachments` {Array} array of attachments files (optional)
* `headers` {Object} optional extra headers to add to the message (most headers are allowed)

### Examples

```javascript
const Mandrill = require('node-mandrill');

const mailer = new Mandrill({
  MANDRILL_API_KEY: 'MY_MANDRILL_API_KEY',
  DEFAULT_FROM_EMAIL: 'no-reply@email.com',
  DEFAULT_FROM_NAME: 'no-reply',
  DEFAULT_TEMPLATE_OPTIONS: {
    global_merge_vars: [
      {'name': 'COMPANY', 'content': 'My Company'},
    ],
  },
});

mailer.send({
  to: 'hugo@email.com',
  cc: 'sam@email.com',                          // optionnal
  bcc: ['john@email.com', 'tracy@email.com'],   // optionnal
  subject: 'Reset Password Request',            // optionnal
  html: '<html>Test</html>', // html or text required
  text: 'Test',              // html or text required
}); // => return Promise


mailer.sendTemplate('PASSWORD_RESET_TEMPLATE', {
  to: 'hugo@email.com',
  cc: 'sam@email.com',                              // optionnal
  bcc: ['john@email.com', 'tracy@email.com'],       // optionnal
  subject: 'Reset Password Request',                // optionnal
  html: '<html>Test</html>',                        // optionnal
  text: 'Test',                                     // optionnal
  global_merge_vars: [
    {'name': 'PASSWORD_RESET_LINK', 'content': 'http://google.com'},
  ],
}); // => return Promise

```

Send attachments
```javascript
const Mandrill = require('node-mandrill');
const fs = require('fs');

const mailer = new Mandrill(); // using MANDRILL_API_KEY defined in environment variable

mailer.send({
  to: ['hugo@email.com', 'sam@email.com']
  text: 'A file',
  attachments: [{
    type: 'application/pdf',
    name: 'Doc Name',
    content: new Buffer(fs.readFileSync('myDoc.pdf')).toString('base64'),
  }],
}); // => return Promise


```


## TODO

* unit test


## Contributing

This project is a work in progress and subject to API changes, please feel free to contribute
