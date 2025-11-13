"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUserData = exports.protectedRoute = void 0;
const user_schema_1 = __importDefault(require("../../../src/api/domain/schema/user.schema"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const protectedRoute = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    let message = 'Not authorized to access this route.';
    let msg = 'The user belonging to this token does not exist.';
    // check header for authorization
    if (req.headers.authorization) {
        if (req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            // console.log(token);
        }
        else {
            token = req.headers.authorization;
        }
    }
    if (!token) {
        res.status(401).json({ message: message });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_KEY || "defaultsecretkey");
        req.user = decoded;
        const user = yield user_schema_1.default.findById(req.user.userId);
        if (!user) {
            return res.status(401).json({ message: 'The user belonging to this token does not exist.' });
        }
        if (!user.login_status) {
            return res.status(401).json({ message: 'User is logged out. Please login again.' });
        }
        next();
    }
    catch (error) {
        res.status(403).json({ message: "Invalid or expired token" });
    }
});
exports.protectedRoute = protectedRoute;
const LoginUserData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    let message = 'Not authorized to access this route.';
    let msg = 'The user belonging to this token does not exist.';
    // check header for authorization
    if (req.headers.authorization) {
        if (req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            console.log(token);
        }
        else {
            token = req.headers.authorization;
        }
    }
    if (!token) {
        res.status(401).json({ message: message });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_KEY || "defaultsecretkey");
        return decoded;
    }
    catch (error) {
        res.status(403).json({ message: "Invalid or expired token" });
    }
});
exports.LoginUserData = LoginUserData;
//# sourceMappingURL=auth.middleware.js.map