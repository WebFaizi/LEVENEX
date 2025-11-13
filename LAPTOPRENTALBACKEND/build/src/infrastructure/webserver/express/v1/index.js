"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = exports.onlineUsers = exports.getIo = void 0;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = require("./routes");
const env_1 = require("../../../env");
const retry_1 = __importDefault(require("retry"));
const cron_1 = require("../../../../api/cron");
const db_1 = __importDefault(require("../../../../api/config/db"));
// import { setupSwagger } from '../../../../swagger';
const swagger_output_json_1 = __importDefault(require("../../../../swagger-output.json"));
const socket_io_1 = require("socket.io");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const initDemoSocketHandlers_1 = require("../../../../api/socket/initDemoSocketHandlers");
const path_1 = __importDefault(require("path"));
const serve_index_1 = __importDefault(require("serve-index"));
const logger_1 = require("../../../../api/lib/logger");
const ipBan_middleware_1 = require("../../../../api/middleware/ipBan.middleware");
/**
 * Creates an Express server with the necessary configurations and middleware.
 * The server listens on the specified port and host.
 *
 * @returns {void}
 */
let io = null;
// Export the socket.IO instance
const getIo = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized!");
    }
    return io;
};
exports.getIo = getIo;
// Socket.IO logic
exports.onlineUsers = new Map();
const createServer = () => {
    // Create the Express app
    const app = (0, express_1.default)();
    // Trust proxy - IMPORTANT for getting real client IPs behind proxies/load balancers
    // This enables proper IP detection from X-Forwarded-For and similar headers
    app.set('trust proxy', true);
    // Get configuration values
    const port = env_1.env.APP_PORT || 3000;
    // Create an HTTP server explicitly
    const server = http_1.default.createServer(app);
    // Initialize Socket.IO with the server
    io = new socket_io_1.Server(server, {
        cors: {
            origin: "*", // Adjust as per your needs
            methods: ["GET", "POST"]
        }
    });
    const host = env_1.env.HOST;
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: 60 * 1000, // 1 minutes
        max: 60, // Limit each IP to 60 requests per windowMs
        message: {
            status: 0,
            message: 'Too many requests, please try again later.'
        }
    });
    // app.use(limiter);
    // Middleware setup
    app.use(body_parser_1.default.json({ limit: '50mb' })); // JSON body parser
    app.use(body_parser_1.default.urlencoded({ limit: '50mb', extended: true })); // URL-encoded body parser
    app.use((0, cookie_parser_1.default)());
    // Simple and effective CORS setup
    app.use((0, cors_1.default)({
        origin: function (origin, callback) {
            // Allow all origins for now
            callback(null, true);
        },
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Cache-Control', 'X-CSRF-Token', 'X-Api-Version', 'X-File-Name']
    }));
    app.use((req, res, next) => {
        if (env_1.env.NODE_ENV == "development") {
            // Log every HTTP request
        }
        // CORS Headers - manual handling for preflight requests
        const responseSettings = {
            "AccessControlAllowOrigin": '*',
            "AccessControlAllowHeaders": "Content-Type,X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5,  Date, X-Api-Version, X-File-Name",
            "AccessControlAllowMethods": "POST, GET, PUT, DELETE, OPTIONS",
            "AccessControlAllowCredentials": 'true'
        };
        // Set CORS headers
        res.header("Access-Control-Allow-Credentials", responseSettings.AccessControlAllowCredentials);
        res.header("Access-Control-Allow-Headers", (req.headers['access-control-request-headers']) ? req.headers['access-control-request-headers'] : "x-requested-with");
        res.header("Access-Control-Allow-Methods", (req.headers['access-control-request-method']) ? req.headers['access-control-request-method'] : responseSettings.AccessControlAllowMethods);
        if ('OPTIONS' == req.method) {
            res.status(200).end(); // Respond to preflight OPTIONS requests
        }
        else {
            next(); // Continue to the next middleware/route handler
        }
    });
    app.get("/", (req, res) => {
        res.send(`<h1 style="color: green;">Server Running CICD CHECK</h1>`);
    });
    // Apply IP ban checking middleware globally to all API routes
    app.use("/api", ipBan_middleware_1.checkIpBannedFrontend);
    app.use("/api", (0, routes_1.createRouter)());
    // setupSwagger(app)
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_output_json_1.default));
    app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
    (0, cron_1.initCronJobs)();
    // initSocketHandlers(io)
    app.set('socketio', io);
    (0, initDemoSocketHandlers_1.initDemoSocketHandlers)(io);
    const logsPath = path_1.default.join(__dirname, "../../../../../logs");
    (0, logger_1.loggerMsg)(`logs path...\n${logsPath}`, "debug");
    const imagePath = path_1.default.resolve(__dirname, String(env_1.env.IMAGES_PATH));
    (0, logger_1.loggerMsg)(`image path...\n${imagePath}`, "debug");
    app.use('/logs', express_1.default.static(logsPath), (0, serve_index_1.default)(logsPath, { icons: true }));
    app.use('/images', express_1.default.static(imagePath), (0, serve_index_1.default)(imagePath, { icons: true }));
    app.get("/chat-app", (req, res) => {
        res.sendFile(path_1.default.join(__dirname, "../../../../public/index.html"));
    });
    // Initialize the database connection with retry mechanism
    const maxRetries = 3;
    let connectionInitialized = false;
    const operation = retry_1.default.operation({ retries: maxRetries });
    function initializeAppDataSource(currentAttempt) {
        if (connectionInitialized) {
            return;
        }
        if (currentAttempt <= maxRetries) {
            try {
                (0, db_1.default)().then(() => {
                    server.listen(port, () => {
                        console.info(`Server listening on http://localhost:${port}`);
                    });
                })
                    .catch((error) => {
                    console.error(`Database Connection Failed (Attempt ${currentAttempt} of ${maxRetries}):`, error);
                    setTimeout(() => initializeAppDataSource(currentAttempt + 1), 1000); // Retry after 1 second
                });
            }
            catch (error) {
                console.error(`Database Connection Failed (Attempt ${currentAttempt} of ${maxRetries}):`, error);
                setTimeout(() => initializeAppDataSource(currentAttempt + 1), 1000); // Retry after 1 second
            }
        }
        else {
            console.error('Max retries reached. Database Connection Failed.');
        }
    }
    // Use the retry library to initialize the database connection
    operation.attempt((currentAttempt) => {
        initializeAppDataSource(currentAttempt);
    });
};
exports.createServer = createServer;
//# sourceMappingURL=index.js.map