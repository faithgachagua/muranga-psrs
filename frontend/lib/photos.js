// Cloudinary delivers resized, optimised versions when transformations are added to the URL
const withTransform = (url, transform) => url.replace('/upload/', `/upload/${transform}/`);

export const thumbnail = (url) => withTransform(url, 'c_fill,w_320,h_320,q_auto,f_auto');
export const optimised = (url) => withTransform(url, 'q_auto,f_auto');
