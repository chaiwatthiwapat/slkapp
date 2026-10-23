import express from 'express';

const app = express();
const port = Number(process.env.PORT ?? 3001);
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'slkapp-api', version: '0.1.0' });
});
app.use('/api', (_request, response) => {
  response.status(404).json({ message: 'API endpoint not found' });
});
const server = app.listen(port, '0.0.0.0', () => console.log(`SLK API listening on :${port}`));
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
