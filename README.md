Autoform File
=============

### Description
Upload and manage files with autoForm via [`jalik:ufs`](https://github.com/jalik/jalik-ufs/).
Inspired by [`ostrio:autoform-files`]

### Quick Start:

 - Install `meteor add jalik:ufs` *if not yet installed*
 - Install `meteor add aldeed:autoform` *if not yet installed*
 - Install `meteor add droka:autoform-ufs`

 - Add this config to `simpl-schema` NPM package (depending of the language that you are using):
```javascript
SimpleSchema.setDefaultMessages({
  initialLanguage: 'en',
  messages: {
    en: {
      uploadError: '{{value}}', //File-upload
    },
  }
});
```
 - Create your Files Collection (See [`jalik:ufs`](https://github.com/jalik/jalik-ufs/))
```javascript
```

 - Define your schema and set the `autoform` property like in the example below
```javascript
Schemas = {};
Posts   = new Meteor.Collection('posts');
Schemas.Posts = new SimpleSchema({
  title: {
    type: String,
    max: 60
  },
  picture: {
    type: String,
    autoform: {
      afFieldInput: {
        type: 'fileUpload',
        collection: 'images',
      }
    }
  }
});

Posts.attachSchema(Schemas.Posts);
```

Generate the form with `{{> quickform}}` or `{{#autoform}}` as usual

You also have to have a store by the same name ('images' in this example).
