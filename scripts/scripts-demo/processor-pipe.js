module.exports = async function (content) {
  const header = '---Header---\n';
  const footer = '---Footer---\n';

  return `${header}${content}${footer}`;
};
