"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const bg_remove_worker_1 = require("./workers/bg_remove.worker");
const tryon_worker_1 = require("./workers/tryon.worker");
const PORT = process.env.PORT || 5000;
// Start Workers
console.log('🚀 Starting Try-On workers...');
bg_remove_worker_1.bgRemoveWorker.on('failed', (job, err) => console.error(`Job ${job?.id} failed:`, err));
tryon_worker_1.tryonWorker.on('failed', (job, err) => console.error(`Job ${job?.id} failed:`, err));
app_1.default.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
