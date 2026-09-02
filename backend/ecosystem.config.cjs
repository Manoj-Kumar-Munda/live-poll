/** @type {import('pm2').StartOptions} */
module.exports = {
  apps: [
    {
      name: "livepoll-api",
      script: "./dist/index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
