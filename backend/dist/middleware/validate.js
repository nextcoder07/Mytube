"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const errors_1 = require("../utils/errors");
/**
 * Middleware factory: validates req.body against a Zod schema.
 * Usage: router.post("/", validate(myZodSchema), controller)
 */
const validate = (schema) => {
    return (req, _res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                const details = err.errors.map((e) => ({
                    field: e.path.join("."),
                    message: e.message,
                }));
                return next(Object.assign(new errors_1.HttpError(400, "Validation error"), { details }));
            }
            next(err);
        }
    };
};
exports.validate = validate;
//# sourceMappingURL=validate.js.map