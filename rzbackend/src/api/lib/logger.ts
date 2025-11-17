import log4js from 'log4js';
import slugify from 'slugify'; 
import path from 'path';

const platformName = slugify(process.env.PLATFORMNAME || 'default');
const logFilePath = path.join(__dirname, '../../../logs', `application-${platformName}.log`);

const config: log4js.Configuration = {
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

let appLogger = log4js.configure(config);

export const logger = appLogger.getLogger();

export const createSafeLogger = () => {
    try {
        return appLogger.getLogger();
    } catch (error) {
        console.warn('log4js clustering issue detected, falling back to console logging');
        return {
            debug: (msg: any) => console.log(`[DEBUG] ${new Date().toISOString()} - ${msg}`),
            info: (msg: any) => console.info(`[INFO] ${new Date().toISOString()} - ${msg}`),
            warn: (msg: any) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`),
            error: (msg: any) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
            fatal: (msg: any) => console.error(`[FATAL] ${new Date().toISOString()} - ${msg}`)
        };
    }
};

export const safeLogger = createSafeLogger();

export const loggerMsg = (msg: any, type: string = 'warn') => {
    try {
        if(type) {
            if(type == 'debug')
                logger.debug(msg)
            if(type == 'info')
                logger.info(msg)
            if(type == 'warn')
                logger.warn(msg)
            if(type == 'error')
                logger.error(msg)
            if(type == 'fatal')
                logger.fatal(msg)
        } else {
            logger.error(msg)
        }
    } catch (error) {
        const logMethod = safeLogger[type as keyof typeof safeLogger];
        if (typeof logMethod === 'function') {
            logMethod(msg);
        } else {
            safeLogger.error(msg);
        }
    }
}

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