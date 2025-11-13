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
const swagger_autogen_1 = __importDefault(require("swagger-autogen"));
const child_process_1 = require("child_process");
const outputFile = './swagger-output.json';
const endpointsFiles = ['./api/interface/routes/app.routes.ts']; // Your main route file(s)
const doc = {
    info: {
        title: 'Telegram-Clone App API Doc',
        description: 'API Documentation for Telegram-Clone App',
        version: '1.0.0',
    },
    servers: [
        {
            url: 'https://api.laptoprental.co/api',
            description: 'Local Development Server',
        },
        {
            url: 'https://telegram-clone-4gd7.onrender.com/api',
            description: 'Live Production Server',
        }
    ],
    schemes: ['https'],
    basePath: '/',
};
const swaggerAutogenInstance = (0, swagger_autogen_1.default)({ openapi: '3.0.0' });
swaggerAutogenInstance(outputFile, endpointsFiles, doc).then(() => __awaiter(void 0, void 0, void 0, function* () {
    // This will start your server (assuming it's in the same file)
    (0, child_process_1.exec)('ts-node ./api/interface/routes/app.routes.ts', (err, stdout, stderr) => {
        if (err) {
            console.error('Error starting the server:', err);
            return;
        }
    });
}));
//# sourceMappingURL=swagger.js.map