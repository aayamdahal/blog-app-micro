import amqp from "amqplib";
let channel;
export const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect("amqp://admin:admin@localhost:5672/app");
        connection.on("error", (err) => {
            console.error("RabbitMQ connection error:", err.message);
        });
        connection.on("close", () => {
            console.error("RabbitMQ connection closed. Retrying in 5s…");
            setTimeout(connectRabbitMQ, 5000);
        });
        channel = await connection.createChannel();
        console.log("✅ Connected to RabbitMQ");
    }
    catch (error) {
        console.error("❌ RabbitMQ failed connection:", error);
        setTimeout(connectRabbitMQ, 5000);
    }
};
export const publishToQueue = async (queueName, message) => {
    if (!channel) {
        console.error("RabbitMQ channel is not initialized");
        return;
    }
    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        persistent: true,
    });
};
export const invalidateCacheJob = async (cacheKeys) => {
    try {
        const message = {
            action: "invalidateCache",
            keys: cacheKeys,
        };
        await publishToQueue("cache-invalidation", message);
        console.log("Cache invalidation job published to rabbit");
    }
    catch (error) {
        console.log(error, "Failed to publish to rabbit");
    }
};
