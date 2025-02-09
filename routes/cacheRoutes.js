const express = require("express");
const redisClient = require("../db/redis");
const Cache = require("../models/cachedSchema");

const router = express.Router();
const CACHE_LIMIT = process.env.CACHE_LIMIT || 10;

// Stores key-value pair
router.post("/cache", async (req, res) => {
  const { key, value } = req.body;

  if (!key || !value)
    return res.status(400).json({ message: "Key and value are required" });

  try {
    const keys = await redisClient.keys("*");
    if (keys.length >= CACHE_LIMIT) {
      return res.status(400).json({ message: "Cache limit reached" });
    }

    await redisClient.set(key, value);
    await Cache.findOneAndUpdate({ key }, { value }, { upsert: true });

    res.status(201).json({ message: "Cached successfully", key, value });
  } catch (err) {
    res.status(500).json({ message: "Error caching data", error: err.message });
  }
});

// Retrieve value
router.get("/cache/:key", async (req, res) => {
  const { key } = req.params;

  if (!key) {
    return res.status(400).json({ message: "Key parameter is required" });
  }

  try {
    let value = await redisClient.get(key);
    if (value) {
      return res.json({ key, value, source: "Redis" });
    }

    const cacheEntry = await Cache.findOne({ key });
    if (cacheEntry) {
      await redisClient.set(key, cacheEntry.value);
      return res.json({ key, value: cacheEntry.value, source: "MongoDB" });
    }

    res.status(404).json({ message: "Key not found" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving data", error: err.message });
  }
});

// Remove from cache
router.delete("/cache/:key", async (req, res) => {
  const { key } = req.params;

  try {
    const deletedFromRedis = await redisClient.del(key);
    const deletedFromMongo = await Cache.findOneAndDelete({ key });

    if (!deletedFromRedis && !deletedFromMongo) {
      return res.status(404).json({ message: "Key not found" });
    }

    res.json({ message: "Deleted successfully", key });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting data", error: err.message });
  }
});

module.exports = router;
