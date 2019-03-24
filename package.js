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
    'templating',
    'aldeed:autoform',
    'dburles:mongo-collection-instances',
    'manuel:viewmodel',
    'jalik:ufs'
  ]);

  api.addFiles([
    'lib/client/autoform.js',
    'lib/client/af-file-upload.html',
    'lib/client/af-file-upload.js',
  ], 'client');
});
