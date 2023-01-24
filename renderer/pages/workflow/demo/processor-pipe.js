module.exports = async function main(content) {
  const header = '---Header---';
  const footer = '---Footer---';
  return (`
    ${header}
    ${content}
    ${footer}
  `);
};

main('[source data]');