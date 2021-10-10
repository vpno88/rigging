const https = require("https");
const { createProxyMiddleware } = require("http-proxy-middleware");

const createClusterProxy = (path, config) => {
  return createProxyMiddleware({
    target: config.apiServer,
    changeOrigin: true,
    pathRewrite: {
      [`^${path}/`]: "/",
    },
    onProxyReq: (proxyReq, req, res) => {
      proxyReq.removeHeader("Authorization");
      proxyReq.setHeader("Authorization", `Bearer ${config.authToken}`);
    },
    agent: new https.Agent({ ca: config.ca }),
  });
};

module.exports = { createClusterProxy };
