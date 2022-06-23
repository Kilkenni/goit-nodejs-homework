function filterUserEmailSub(userData) {
  const { email, subscription } = userData;
  return { email, subscription };
}

module.exports = filterUserEmailSub;