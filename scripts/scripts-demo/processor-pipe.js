module.exports = async function(
  content, // data from previous step
) {
  const header = '---Header---\n';
  const footer = '---Footer---\n';

  return `${header}${content}${footer}`;
};
