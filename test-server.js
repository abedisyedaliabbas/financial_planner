// Quick test to see if server can start
console.log('Testing server startup...');
try {
  console.log('Loading server/index.js...');
  require('./server/index.js');
  console.log('Server file loaded successfully!');
} catch (error) {
  console.error('ERROR loading server:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

