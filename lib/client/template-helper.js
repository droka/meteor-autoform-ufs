import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';

export function imageIsHostedByUs(src) {
  return (src.startsWith('/uploads') || src.startsWith('/images'));
}

export function src2image(src) {
  if (src.startsWith('/uploads')) {
    const imageId = src.split('/')[3];
    const Images = Mongo.Collection.get('images');
    const image = Images.findOne(imageId);
    return image;
  } else {
    return { 
      _id: null,
      isImage: true,
      path: src,
      remove() {},
      // should not remove our template images (src.startsWith('/images'))
      // and no need to remove an external file (src.startsWith('http'))
    };
  }
}

/*
Template.registerHelper('srcOfImage', function (fieldValue) {
  return text2image(fieldValue).path;
});
*/