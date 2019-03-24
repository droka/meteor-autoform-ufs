import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { AutoForm } from 'meteor/aldeed:autoform';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';

import { isHostedByUs, link2doc } from './template-helper.js';
import './af-file-upload.js';

Template.afFileUpload.onCreated(function () {
  if (!this.data) this.data = { atts: {} };  
  this.formId  = this.data.atts.id;
  this.inputFieldName = this.data.name;
  this.dbValue = this.data.value || null;
  return;
});

Template.afFileUpload.onRendered(function() {
  $('button[name=upload]').blur();  // TODO ?! this does not help
});

Template.afFileUpload.viewmodel({
  value: null,  // viewmodel Value!
  currentUpload: null,
  currentProgress: 0,
  onCreated(template) {
    this.value(template.data.value || null);
    return;
  },
  textOrHidden() {
    const vmValue = this.value();
    return vmValue ? "hidden" : "text";
//    return isHostedByUs(vmValue) ? "hidden" : "text";
  },
  valueHasChanged() {
    return this.value() !== this.templateInstance.dbValue;
  },
});

Template.afFileUpload.events({
  'click [data-reset-file]'(e, template) {
    e.preventDefault();
    template.viewmodel.value(null);
    return false;
  },
  'click [data-remove-file]'(e, template) {
    e.preventDefault();
    const vmValue = template.viewmodel.value();
    template.viewmodel.value(null);
    const image = link2doc(vmValue);
    if (image) image.remove();
  },
  'click button[name=upload]'(e, template) {
    e.preventDefault();
    let ctx;
    try {
      ctx = AutoForm.getValidationContext(template.formId);
    } catch (exception) {
      ctx = AutoForm.getValidationContext();  // Fix: "TypeError: Cannot read property '_resolvedSchema' of undefined"
    }
    UploadFS.selectFiles(function (file) {
      console.log("template:", template);
      const doc = {
        name: file.name,
        size: file.size,
        type: file.type,
        communityId: Session.get('activeCommunityId'),
        userId: Meteor.userId(),
      };

      // Create a new Uploader for this file
      const uploader = new UploadFS.Uploader({
        store: 'images',
        data: file, // The File/Blob object containing the data
        file: doc,  // The document to save in the collection

        // settings copied from example file
        adaptive: true,
        capacity: 0.8, // 80%
        chunkSize: 8 * 1024, // 8k
        maxChunkSize: 128 * 1024, // 128k
        maxTries: 5,

        onError(err, file) {
          console.error('Error during uploading ' + file.name);
          console.error(err);
          ctx.resetValidation();
          ctx.addInvalidKeys([{ name: template.inputFieldName, type: 'uploadError', value: err.reason }]);
          template.viewmodel.value('');
          template.viewmodel.currentUpload(null);
        },
        onAbort(file) {
          console.log(file.name + ' upload has been aborted');
          template.viewmodel.currentUpload(null);
        },
        onComplete(file) {
          console.log(file.name + ' has been uploaded');
          template.viewmodel.value(file.path);
          template.viewmodel.currentUpload(null);
          console.log("template:", template);
        },
        onCreate(file) {
          console.log(file.name + ' has been created with ID ' + file._id);
          template.viewmodel.value('/images/avatars/avatarnull.png');
        },
        onProgress(file, progress) {
          console.log(file.name + ' ' + (progress*100) + '% uploaded');
          template.viewmodel.currentProgress(Math.round(progress*100));
        },
        onStart(file) {
          console.log(file.name + ' started');
          ctx.resetValidation();
          template.viewmodel.currentProgress(0);
          template.viewmodel.currentUpload(this);
        },
        onStop(file) {
          console.log(file.name + ' stopped');
        },
      });

      // Starts the upload
      uploader.start();
    });
  },
});
