const app = require('./app');

const PORT = process.env.PORT || 5000;

async function start() {
  await app.initializeDb();
  app.listen(PORT, () => {
    console.log(`\n🚲 Hero Cycles API running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health\n`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
