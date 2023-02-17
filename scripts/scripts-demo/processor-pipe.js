module.exports = async function(
  content, // data from previous step
) {
  // import nodejs native module you need, such as http/https/fs/os/path.
  // see API https://nodejs.org/docs/latest-v16.x/api/os.html.
  const os = require('os');
  const header = `---${os.hostname()}---\n`;
  const footer = `---${os.userInfo().username}---\n`;

  // pass data to next step
  return `${header}${content}${footer}`;
};
