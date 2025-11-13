"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cryptoService = void 0;
const crypto_1 = __importDefault(require("crypto"));
class CryptoService {
    constructor() {
        this.algorithm = "aes-256-cbc";
    }
    encrypt(text, key, iv) {
        const cipher = crypto_1.default.createCipheriv(this.algorithm, Buffer.from(key), Buffer.from(iv));
        let encrypted = cipher.update(text, "utf8");
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return encrypted.toString("hex");
    }
    decrypt(encryptedText, key, iv) {
        const decipher = crypto_1.default.createDecipheriv(this.algorithm, Buffer.from(key), Buffer.from(iv));
        let decrypted = decipher.update(Buffer.from(encryptedText, "hex"));
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString("utf8");
    }
    generateKey() {
        return crypto_1.default.randomBytes(32).toString("hex").slice(0, 32);
    }
    generateIV() {
        return crypto_1.default.randomBytes(16).toString("hex").slice(0, 16);
    }
    encryptCombinedValue(token, slug, key, iv) {
        const combinedValue = `${token}:${slug}`;
        const encryptedText = this.encrypt(combinedValue, key, iv);
        return { encryptedText };
    }
    decryptCombinedValue(encryptedText, key, iv) {
        const decryptedValue = this.decrypt(encryptedText, key, iv);
        const [token, slug] = decryptedValue.split(":");
        return { token, slug };
    }
}
exports.cryptoService = new CryptoService();
//# sourceMappingURL=cryptoService.js.map