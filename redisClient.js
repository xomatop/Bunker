// redisClient.js
const redis = require('redis');

// Создаем клиент Redis
const client = redis.createClient({
  host: '127.0.0.1',
  port: 6379,
  //password: ' '
});

client.on('error', (err) => {
  console.error('Redis connection error:', err);
});

// Экспортируем клиент Redis для использования в других модулях
module.exports = client;