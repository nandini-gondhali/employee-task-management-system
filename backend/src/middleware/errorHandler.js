import multer from 'multer';

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File size exceeds 5 MB limit.' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err.message === 'Only PDF, JPG, and PNG files are allowed') {
    return res.status(400).json({ success: false, message: err.message });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error'
  });
};

export default errorHandler;
