const multer = require('multer');
const AppError = require('../utils/AppError');

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File is too large.' });
    }
    return res.status(400).json({ error: err.message || 'Invalid file upload.' });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ error: `A record with this ${err.meta?.target?.join(', ') || 'value'} already exists.` });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found.' });
  }

  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}

module.exports = errorHandler;
