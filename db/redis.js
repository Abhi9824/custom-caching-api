const redis = require("redis");

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

redisClient.on("connect", () => console.log(" Redis Connected"));
redisClient.on("error", (err) => console.error(" Redis Error:", err));

redisClient.connect();

module.exports = redisClient;
