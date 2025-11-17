"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCronJobs = void 0;
const dailyPriceCheckJob_1 = require("./jobs/dailyPriceCheckJob");
// Initialize all cron jobs
const initCronJobs = () => {
    (0, dailyPriceCheckJob_1.dailyPriceCheckJob)();
};
exports.initCronJobs = initCronJobs;
//# sourceMappingURL=index.js.map