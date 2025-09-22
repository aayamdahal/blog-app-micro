import amqp from "amqplib";
import { redisClient } from "../server.js";
import { sql } from "./db.js";

interface CacheInvalidationMessage {
  action: string;
  keys: string[];
}

export const startCacheConsumer = async () => {
  try {
    const connection = await amqp.connect(
      "amqp://admin:admin@localhost:5672/app"
    );
    const channel = await connection.createChannel();
    const queueName = "cache-invalidation";

    await channel.assertQueue(queueName, { durable: true });
    console.log("Blog cache service running");

    channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(
            msg.content.toString()
          ) as CacheInvalidationMessage;

          console.log("Blog service received", content);

          if (content.action == "invalidateCache") {
            for (const pattern of content.keys) {
              const keys = await redisClient.keys(pattern);

              if (keys.length > 0) {
                await redisClient.del(keys);
                console.log(
                  `blog service invalidated ${keys.length} cache matching ${pattern}`
                );

                const searchQuery = "";
                const category = "";
                const cacheKey = `blogs:${searchQuery}:${category}`;
                const blogs =
                  await sql`SELECT * FROM blogs ORDER BY create_at DESC`;
                await redisClient.set(cacheKey, JSON.stringify(blogs), {
                  EX: 3600,
                });
                console.log("cache rebuilt with key:", cacheKey);
              }
            }
          }
          channel.ack(msg);
        } catch (error) {}
      }
    });
  } catch (error) {}
};
