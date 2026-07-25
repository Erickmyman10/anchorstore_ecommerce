const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const isDev = process.env.NODE_ENV !== "production";

    // Always log full detail server-side
    console.error(`[${new Date().toISOString()}] ${statusCode} ${req.method} ${req.path} — ${err.message}`);
    if (isDev) console.error(err.stack);

    res.status(statusCode).json({
        error: isDev ? err.message : "An unexpected error occurred. Please try again.",
        ...(isDev && { stack: err.stack }),
    });
};

export default errorHandler;