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
exports.generateAgoraToken = exports.convertToSlug = exports.generateToken = exports.generateOtp = exports.hashdPassword = exports.logErrorMessage = exports.uploadImagesFile = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../lib/logger");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const agora_token_1 = require("agora-token");
exports.uploadImagesFile = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            let folder = "";
            const mimeType = file.mimetype;
            if (mimeType.startsWith('image/')) {
                folder = "images";
            }
            else if (mimeType.startsWith('video/')) {
                folder = "videos";
            }
            else if (mimeType.startsWith('audio/')) {
                folder = "audio";
            }
            else if (mimeType === "application/pdf" || mimeType.startsWith('application/msword') || mimeType.startsWith('application/vnd')) {
                folder = "documents";
            }
            else {
                //@ts-ignore
                return cb(new Error('Unsupported file type'), false);
            }
            const uploadDir = path_1.default.resolve(__dirname, '../../assets', folder);
            if (!fs_1.default.existsSync(uploadDir)) {
                fs_1.default.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const mimeType = file.mimetype;
            let folder = "";
            // Assign folder based on mime type
            if (mimeType.startsWith('image/')) {
                folder = "images";
            }
            else if (mimeType.startsWith('video/')) {
                folder = "videos";
            }
            else if (mimeType.startsWith('audio/')) {
                folder = "audio";
            }
            else if (mimeType === "application/pdf" || mimeType.startsWith('application/msword') || mimeType.startsWith('application/vnd')) {
                folder = "documents";
            }
            // Modify filename to include the folder name for easy reference
            // const modifiedFileName = `${folder}-${Date.now()}-${file.originalname}`;
            const modifiedFileName = `${folder}-${file.originalname}`;
            cb(null, modifiedFileName);
        }
    }),
    fileFilter: (req, file, cb) => {
        const allowedImagesExits = ['.png', '.jpg', '.jpeg'];
        const allowedVideosExits = ['.mp4', '.mkv', '.avi'];
        const allowedAudioExits = ['.mp3', '.wav', '.aac'];
        const allowedDocsExits = ['.pdf', '.doc', '.docx'];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (allowedImagesExits.includes(ext) || allowedVideosExits.includes(ext) || allowedAudioExits.includes(ext) || allowedDocsExits.includes(ext)) {
            cb(null, true);
        }
        else {
            console.log("Unsuported file extension:", ext);
        }
    },
}).array("files");
const logErrorMessage = (error, customMessage) => {
    // Log the error details for debugging
    if (error instanceof Error) {
        (0, logger_1.loggerMsg)(`${customMessage}\nError Name${error.name}\nError message: ${error.message}\nStack trace: ${error.stack}`);
    }
    else {
        (0, logger_1.loggerMsg)(`${customMessage}\nUnexpected error: ${error}`);
    }
};
exports.logErrorMessage = logErrorMessage;
const hashdPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    return yield bcrypt_1.default.hash(password, 10);
});
exports.hashdPassword = hashdPassword;
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateOtp = generateOtp;
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, "supersecretkeys", { expiresIn: "1h" });
};
exports.generateToken = generateToken;
const convertToSlug = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};
exports.convertToSlug = convertToSlug;
const generateAgoraToken = (appId, appCertificate, channelName, uid, expirationTimeInSeconds = 3600) => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
    return agora_token_1.RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, agora_token_1.RtcRole.PUBLISHER, privilegeExpiredTs, privilegeExpiredTs);
};
exports.generateAgoraToken = generateAgoraToken;
//# sourceMappingURL=helper.js.map