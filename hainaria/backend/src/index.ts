import app from './app';
import { bgRemoveWorker } from './workers/bg_remove.worker';
import { tryonWorker } from './workers/tryon.worker';

const PORT = process.env.PORT || 5000;

// Start Workers
console.log('🚀 Starting Try-On workers...');
bgRemoveWorker.on('failed', (job, err) => console.error(`Job ${job?.id} failed:`, err));
tryonWorker.on('failed', (job, err) => console.error(`Job ${job?.id} failed:`, err));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
