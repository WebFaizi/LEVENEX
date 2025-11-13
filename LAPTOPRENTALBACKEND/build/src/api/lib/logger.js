"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerMsg = exports.safeLogger = exports.createSafeLogger = exports.logger = void 0;
const log4js_1 = __importDefault(require("log4js"));
const slugify_1 = __importDefault(require("slugify"));
const path_1 = __importDefault(require("path"));
const platformName = (0, slugify_1.default)(process.env.PLATFORMNAME || 'default');
const logFilePath = path_1.default.join(__dirname, '../../../logs', `application-${platformName}.log`);
const config = {
    appenders: {
        application: {
            type: "dateFile",
            filename: logFilePath,
            pattern: "yyyy-MM-dd",
            backups: 10,
            keepFileExt: true,
            alwaysIncludePattern: true,
        },
        console: {
            type: "console",
            layout: {
                type: "pattern",
                pattern: "%d{yyyy-MM-dd hh:mm:ss} [%p] %c - %m"
            }
        }
    },
    categories: {
        default: {
            appenders: ["application", "console"],
            level: "debug"
        }
    },
    disableClustering: true
};
let appLogger = log4js_1.default.configure(config);
exports.logger = appLogger.getLogger();
const createSafeLogger = () => {
    try {
        return appLogger.getLogger();
    }
    catch (error) {
        console.warn('log4js clustering issue detected, falling back to console logging');
        return {
            debug: (msg) => console.log(`[DEBUG] ${new Date().toISOString()} - ${msg}`),
            info: (msg) => console.info(`[INFO] ${new Date().toISOString()} - ${msg}`),
            warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`),
            error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
            fatal: (msg) => console.error(`[FATAL] ${new Date().toISOString()} - ${msg}`)
        };
    }
};
exports.createSafeLogger = createSafeLogger;
exports.safeLogger = (0, exports.createSafeLogger)();
const loggerMsg = (msg, type = 'warn') => {
    try {
        if (type) {
            if (type == 'debug')
                exports.logger.debug(msg);
            if (type == 'info')
                exports.logger.info(msg);
            if (type == 'warn')
                exports.logger.warn(msg);
            if (type == 'error')
                exports.logger.error(msg);
            if (type == 'fatal')
                exports.logger.fatal(msg);
        }
        else {
            exports.logger.error(msg);
        }
    }
    catch (error) {
        const logMethod = exports.safeLogger[type];
        if (typeof logMethod === 'function') {
            logMethod(msg);
        }
        else {
            exports.safeLogger.error(msg);
        }
    }
};
exports.loggerMsg = loggerMsg;
// import Winston from 'winston';
// import DailyRotateFile from 'winston-daily-rotate-file';
//
// const transports: Array<Winston.transport> = [];
//
// transports.push(
//     new Winston.transports.Console({
//         format: Winston.format.combine(
//             Winston.format.cli(),
//             Winston.format.splat()
//         )
//     })
// );
//
// export const logger: Winston.Logger = Winston.createLogger({
//     level: 'debug',
//     levels: Winston.config.npm.levels,
//     format: Winston.format.combine(
//         Winston.format.timestamp({
//             format: 'YYYY-MM-DD HH:mm:ss',
//         }),
//         Winston.format.errors({ stack: true }),
//         Winston.format.splat(),
//         Winston.format.json()
//     ),
//     silent: false,
//     transports,
// })
//
// export const LoggerStream = {
//     write: (msg: string): void => {
//         logger.info(msg.replace(/(\n)/gm, ''))
//     },
// }
//
//
// const transport: DailyRotateFile = new DailyRotateFile({
//     filename: 'logs/application-%DATE%.log',
//     datePattern: 'YYYY-WW', // Use 'YYYY-WW' for weekly rotation
//     zippedArchive: true,
//     maxSize: '20m',
//     maxFiles: '14w' // Use '14w' for 14 weeks of retention
// });
//
// export const loggerFile = Winston.createLogger(
//     {
//         transports: [
//             transport
//         ]
//     }
// );
//# sourceMappingURL=logger.js.map