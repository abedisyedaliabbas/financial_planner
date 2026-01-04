const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Determine backend URL
  // Priority: REACT_APP_BACKEND_URL > REACT_APP_BACKEND_PORT > default (5001)
  // Server is running on 5001 by default (see server/.env or PORT env var)
  const backendPort = process.env.REACT_APP_BACKEND_PORT || '5001';
  const backendUrl = process.env.REACT_APP_BACKEND_URL || `http://localhost:${backendPort}`;
  
  console.log(`🔗 Proxy configured to forward /api requests to: ${backendUrl}`);

  // Only proxy /api requests to the backend
  // Static files (CSS, JS, images) will be served by React dev server
  app.use(
    '/api',
    createProxyMiddleware({
      target: backendUrl,
      changeOrigin: true,
      secure: false,
      logLevel: 'warn', // Reduce log noise
      onError: (err, req, res) => {
        // Only log errors for /api requests
        if (req.url && req.url.startsWith('/api')) {
          console.error(`Proxy error: Could not proxy ${req.url} to ${backendUrl}`);
          console.error('Make sure the backend server is running on', backendUrl);
        }
      }
    })
  );
};

