// Custom Error Class - Intentional Error thrown will use this

export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;

        this.isOperational = true;

        // Capturing Stack Trace (Excluding Constructor) -> Easier Debugging
        Error.captureStackTrace(this, this.constructor);
    }
}
