import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { AutoForm } from 'meteor/aldeed:autoform';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'meteor/underscore';

import { text2image } from './template-helper.js';

Template.afFileUpload.onCreated(function () {
  if (!this.data) this.data = { atts: {} };  
  this.formId  = this.data.atts.id;
  this.inputFieldName = this.data.name;
  this.dbValue = this.data.value;
  this.viewmodelValue = new ReactiveVar(this.data.value || null);
  this.currentUpload = new ReactiveVar(null);
  this.currentProgress = new ReactiveVar(0);
//  console.log('formId', this.formId);
//  console.log('atts', this.data.atts);
//  console.log('data', this.data);
  return;
});

Template.afFileUpload.helpers({
  viewmodelValue() {
    return Template.instance().viewmodelValue.get();
  },
  currentUpload() {
    return Template.instance().currentUpload.get();
  },
  currentProgress() {
    return Template.instance().currentProgress.get();
  },
  textOrHidden() {
    const vmValue = Template.instance().viewmodelValue.get();
    return text2image(vmValue)._id ? "hidden" : "text";
  },
  valueHasChanged() {
    return Template.instance().viewmodelValue.get() !== Template.instance().dbValue;
  },
  viewmodelFile() {
    const template = Template.instance();
    const viewmodelValue = template.viewmodelValue.get();
//    if (typeof viewmodelValue !== 'string' || viewmodelValue.length === 0) {
//      return undefined; // why this needed? how could this happen?
//    }
    const image = text2image(viewmodelValue);
    return image;
  }
});

Template.afFileUpload.events({
  'click [data-reset-file]'(e, template) {
    e.preventDefault();
    template.viewmodelValue.set(null);
    return false;
  },
  'click [data-remove-file]'(e, template) {
    e.preventDefault();
    template.viewmodelValue.set(null);
    if (template.data.value) {
      delete template.data.value;
    }
    try {
      this.remove();
    } catch (error) {
      // we're good here
    }
    return false;
  },
  'change [data-files-collection-upload]'(e, template) {
    if (!e.currentTarget.files || !e.currentTarget.files[0]) return;
    const file = e.currentTarget.files[0];

    let ctx;
    try {
      ctx = AutoForm.getValidationContext(template.formId);
    } catch (exception) {
      ctx = AutoForm.getValidationContext();  // Fix: "TypeError: Cannot read property '_resolvedSchema' of undefined"
    }
    console.log("ctx", ctx);

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
        template.$(e.currentTarget).val('');
        template.currentUpload.set(null);
      },
      onAbort(file) {
        console.log(file.name + ' upload has been aborted');
        template.currentUpload.set(null);
      },
      onComplete(file) {
        console.log(file.name + ' has been uploaded');
        template.currentUpload.set(null);
      },
      onCreate(file) {
        console.log(file.name + ' has been created with ID ' + file._id);
        template.viewmodelValue.set(file._id);
      },
      onProgress(file, progress) {
        console.log(file.name + ' ' + (progress*100) + '% uploaded');
        template.currentProgress.set(progress);
      },
      onStart(file) {
        console.log(file.name + ' started');
        ctx.resetValidation();
        template.currentUpload.set(this);
//        console.log('currentUpload:', this);
      },
      onStop(file) {
        console.log(file.name + ' stopped');
      },
    });

    // Starts the upload
    uploader.start();
  },
});
