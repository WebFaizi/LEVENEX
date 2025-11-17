"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Counter schema for auto-increment
const CounterSchema = new mongoose_1.Schema({
    model: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
});
const Counter = mongoose_1.default.model("Counter", CounterSchema);
const JobSchema = new mongoose_1.Schema({
    unique_id: {
        type: Number,
        unique: true,
    },
    job_category_id: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: "JobCategory",
        required: true,
    },
    job_title: {
        type: String,
        required: true,
    },
    experience: {
        type: String,
        required: true,
    },
    salary: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    phone_number: {
        type: String,
        required: true,
    },
    keywords_tag: {
        type: [String],
        required: true,
    },
    is_approved: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    meta_title: {
        type: String,
        required: true,
    },
    meta_description: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
// Middleware to auto-increment `unique_id` safely
JobSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isNew) {
            const counter = yield Counter.findOneAndUpdate({ model: "Jobs" }, { $inc: { count: 1 } }, { new: true, upsert: true });
            this.unique_id = counter.count;
        }
        next();
    });
});
const Jobs = mongoose_1.default.model("Jobs", JobSchema);
exports.default = Jobs;
//# sourceMappingURL=jobs.schema.js.map