async () => {
  // see API https://nodejs.org/docs/latest-v16.x/api/os.html.
  const header = `<---${os.hostname()}---`;
  const footer = `---${os.userInfo().username}--->`;

  // pass data to next step
  return `${header}${content}${footer}`;
};
