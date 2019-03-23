Package.describe({
  name: 'droka:autoform-ufs',
  summary: 'File upload for AutoForm using jalik:ufs',
  description: 'File upload for AutoForm using jalik:ufs',
  version: '0.1.0',
  git: 'https://github.com/droka/meteor-autoform-ufs.git'
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.6.1');

  api.use([
    'check',
    'ecmascript',
    'underscore',
    'mongo',
    'reactive-var',
    'templating@1.3.2',
    'aldeed:autoform',
    'dburles:mongo-collection-instances',
    'jalik:ufs'
  ]);

  api.addFiles([
    'lib/client/autoform.js',
    'lib/client/fileUpload.html',
    'lib/client/fileUpload.js',
    'lib/client/uploadImageDemo.html',
    'lib/client/uploadFileDemo.html'
  ], 'client');
});
