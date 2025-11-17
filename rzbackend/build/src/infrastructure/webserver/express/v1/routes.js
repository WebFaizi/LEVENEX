"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRouter = void 0;
const express_1 = __importDefault(require("express"));
const app_routes_1 = require("../../../../api/interface/routes/app.routes");
const createRouter = () => {
    const router = express_1.default.Router();
    (0, app_routes_1.appRoute)(router);
    return router;
};
exports.createRouter = createRouter;
//# sourceMappingURL=routes.js.map