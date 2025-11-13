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
exports.storeUserActionActivity = void 0;
const userActionActivity_schema_1 = __importDefault(require("../domain/schema/userActionActivity.schema"));
const mongoose_1 = __importDefault(require("mongoose"));
const storeUserActionActivity = (user_id, module_type, action_type, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(user_id)) {
            throw new Error("Invalid user ID");
        }
        const activity = yield userActionActivity_schema_1.default.create({
            user_id: new mongoose_1.default.Types.ObjectId(user_id),
            module_name: module_type,
            action_type: action_type,
            message: message,
            status: true,
        });
        return activity;
    }
    catch (error) {
        console.error("Error in getLocationDetails:", error);
        throw error;
    }
});
exports.storeUserActionActivity = storeUserActionActivity;
//# sourceMappingURL=userActionActivity.service.js.map