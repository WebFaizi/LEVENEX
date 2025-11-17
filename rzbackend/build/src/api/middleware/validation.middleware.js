"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)();
// export const validateRequest = (schema: ObjectSchema) => {
//     return (req: Request, res: Response, next: NextFunction) => {
//         const { error } = schema.validate(req.body, { abortEarly: false });
//         // abortEarly => if true then sends error on first failure => if false then sends all the failure errors
//         if (error) {
//             return res.status(400).json({
//                 status: "error",
//                 code: "VALIDATION_ERROR",
//                 message: "Validation failed for the request.",
//                 error: error.details.map(err => ({
//                     message: err.message,
//                     path: err.path
//                 }))
//             });
//         }
//         next();
//     };
// };
const validateRequest = (schema) => {
    return (req, res, next) => {
        upload.any()(req, res, (err) => {
            if (err) {
                return res.status(500).json({
                    status: "error",
                    code: "MULTER_ERROR",
                    message: "An error occurred while processing form-data."
                });
            }
            const dataToValidate = Object.assign(Object.assign(Object.assign({}, req.body), req.query), req.params);
            const { error } = schema.validate(dataToValidate, { abortEarly: false });
            if (error) {
                return res.status(400).json({
                    status: "error",
                    code: "VALIDATION_ERROR",
                    message: "Validation failed for the request.",
                    errors: error.details.map(err => ({
                        message: err.message,
                        path: err.path,
                    })),
                });
            }
            next();
        });
    };
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validation.middleware.js.map