function createError(message, status = 500) {
  let err = new Error(message);
  err.status = status;
  return err;
}

module.exports = createError;
