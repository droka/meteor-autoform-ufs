import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Session } from 'meteor/session';
import { AutoForm } from 'meteor/aldeed:autoform';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { _ } from 'meteor/underscore';

Template.afFileUpload.onCreated(function () {
  if (!this.data) this.data = { atts: {} };  
  this.formId  = this.data.atts.id;
  this.inputFieldName = this.data.name;
  this.currentUpload = new ReactiveVar(false);
  this.temporaryValue = new ReactiveVar(this.data.value || false);
  console.log('formId', this.formId);
  console.log('atts', this.data.atts);
  console.log('data', this.data);
  return;
});

Template.afFileUpload.helpers({
  viewmodelValue() {
    return Template.instance().temporaryValue.get() || this.value;
  },
  valueHasChanged() {
    return Template.instance().temporaryValue.get() !== this.value;
  },
  currentUpload() {
    return Template.instance().currentUpload.get();
  },
  uploadedFile() {
    const template = Template.instance();
    const viewmodelValue = template.temporaryValue.get() || this.value;
    if (typeof viewmodelValue !== 'string' || viewmodelValue.length === 0) {
      return null;
    }
    const Images = Mongo.Collection.get('images');
    const image = Images.findOne({ _id: viewmodelValue });
    if (image) return image;
    else return { 
      isImage: false,
      path: viewmodelValue,
      remove(){/*no need to remove external file */},
    };
    //    const imageId = viewmodelValue.split('/')[3];
  }
});

Template.afFileUpload.events({
  'click [data-reset-file]'(e, template) {
    e.preventDefault();
    template.temporaryValue.set(false);
    return false;
  },
  'click [data-remove-file]'(e, template) {
    e.preventDefault();
    template.temporaryValue.set(false);
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

      adaptive: true,
      capacity: 0.8, // 80%
      chunkSize: 8 * 1024, // 8k
      maxChunkSize: 128 * 1024, // 128k
      maxTries: 5,

      onError(err, file) {
        console.error(err);
        ctx.resetValidation();
        ctx.addInvalidKeys([{name: template.inputFieldName, type: 'uploadError', value: err.reason}]);
        template.$(e.currentTarget).val('');
      },
      onAbort(file) {
        console.log(file.name + ' upload has been aborted');
        template.currentUpload.set(false);
      },
      onComplete(file) {
        console.log(file.name + ' has been uploaded');
      },
      onCreate(file) {
        console.log(file.name + ' has been created with ID ' + file._id);
        if (template) {
          template.temporaryValue.set(file._id);
        }
      },
      onProgress(file, progress) {
        console.log(file.name + ' ' + (progress*100) + '% uploaded');
      },
      onStart(file) {
        console.log(file.name + ' started');
        ctx.resetValidation();
        template.currentUpload.set(this);
        console.log('currentUpload:', this);
      },
      onStop(file) {
        console.log(file.name + ' stopped');
      },
    });

    // Starts the upload
    uploader.start();
  },
});
