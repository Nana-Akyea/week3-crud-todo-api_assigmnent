const errorHandler = (err, req, res, next) => {
    console.error(err.message); 
    console.error(err.stack || '');
    const status = err.statusCode || 500;
    res.status(status).json({
        error: err.message});
};

module.exports = errorHandler;