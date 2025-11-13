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
exports.convertToWebpAndSave = void 0;
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const convertToWebpAndSave = (buffer, originalName, uploadDir) => __awaiter(void 0, void 0, void 0, function* () {
    if (!fs_1.default.existsSync(uploadDir)) {
        fs_1.default.mkdirSync(uploadDir, { recursive: true });
    }
    const baseName = path_1.default.parse(originalName).name;
    const fileName = `${Date.now()}-${baseName}.webp`;
    const savePath = path_1.default.join(uploadDir, fileName);
    yield (0, sharp_1.default)(buffer)
        .webp({ quality: process.env.SHARP_QUALITY ? parseInt(process.env.SHARP_QUALITY) : 80 })
        .toFile(savePath);
    return savePath;
});
exports.convertToWebpAndSave = convertToWebpAndSave;
//# sourceMappingURL=imageService.js.map