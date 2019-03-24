import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';

// A text can represent the image in two ways. Either by... 
export function text2image(text) {
  // 1. by being a url link to an image on the web
  if (text.includes('/')) {
    return { 
      isImage: false,
      path: text,
      remove(){ /*no need to remove an external file */ },
    };
  }
  // 2. or by being a mongo id of a document in our images collection
  const Images = Mongo.Collection.get('images');
  const image = Images.findOne({ _id: text });
  return image;
}

Template.registerHelper('srcOfImage', function (fieldValue) {
  return text2image(fieldValue).path;
});
