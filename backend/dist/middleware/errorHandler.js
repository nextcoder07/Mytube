"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const errorHandler = (err, req, res, _next) => {
    console.error(err);
    if (err instanceof errors_1.HttpError) {
        return res.status(err.statusCode).json({ success: false, message: err.message, data: null, error: err.details });
    }
    return res.status(500).json({ success: false, message: "Internal Server Error", data: null, error: { code: "INTERNAL_ERROR" } });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map