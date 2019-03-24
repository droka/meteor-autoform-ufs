import { Mongo } from 'meteor/mongo';

export function isHostedByUs(link) {
  return (link.startsWith('/uploads') || link.startsWith('/images'));
}

export function link2doc(link) {
  if (link.startsWith('/uploads')) {
    const imageId = link.split('/')[3];
    const Images = Mongo.Collection.get('images');
    const image = Images.findOne(imageId);
    return image;
  } else {
    return { 
      _id: null,
      isImage: true,
      path: link,
      remove() {},
      // should not remove our template images (link.startsWith('/images'))
      // and no need to remove an external file (link.startsWith('http'))
    };
  }
}
