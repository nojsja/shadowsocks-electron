module.exports = async function(content, {
  clipboard, // electron clipboard module
  http, // nodejs http module
  https, // nodejs https module
  fs, // nodejs fs module
  path, // nodejs path module
}) {
  console.log(content);
  return '[source data]';
};
