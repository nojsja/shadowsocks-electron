module.exports = async function(content) {
  const header = '---Header---';
  const footer = '---Footer---';

  return (`
    ${header}
    ${content}
    ${footer}
  `);
};
