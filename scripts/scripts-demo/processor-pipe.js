module.exports = async function(
  content, // data from previous step
) {
  // Import nodejs native module you need, such as http/https/fs/os/path.
  // See API https://nodejs.org/docs/latest-v16.x/api/os.html.
  const os = require('os');
  const header = `---${os.hostname()}---\n`;
  const footer = `---${os.userInfo().username}---\n`;

  // Pass data to next step
  return `${header}${content}${footer}`;
};
