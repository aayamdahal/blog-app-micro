import amqp from "amqplib";
let channel;
export const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: "localhost",
            port: 5672,
            username: "admin",
            password: "admin123",
        });
        channel = await connection.createChannel();
        console.log("Connected To RabbitMQ");
    }
    catch (error) {
        console.log(error, "failed connection");
    }
};
