import { Kafka, Partitioners } from "kafkajs";
import dotenv from "dotenv";
dotenv.config();

import { IEmailVerificationEvent, IPasswordResetEvent } from "../types/custom";

const { KAFKA_CLIENT_ID, KAFKA_BROKERS, KAFKA_USER_MANAGEMENT_TOPIC } = process.env;

const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: KAFKA_BROKERS!.split(","),
});

const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner
});

const connectProducer = async () => {
  try {
    await producer.connect();
    console.log("Kafka user management producer connected");
  } catch (error) {
    console.log("Error connecting Kafka producer:", error);
    setTimeout(connectProducer, 5000);
  }
};

const sendEmailVerificationEvent = async (event: IEmailVerificationEvent) => {
  try {
    await producer.send({
      topic: KAFKA_USER_MANAGEMENT_TOPIC!,
      messages: [{ value: JSON.stringify(event) }],
    });
    console.log("Sent email verification event to Kafka");
  } catch (error) {
    console.log("Error sending email verification event to Kafka:", error);
  }
};

const sendPasswordResetEvent = async (event: IPasswordResetEvent) => {
  try {
    await producer.send({
      topic: KAFKA_USER_MANAGEMENT_TOPIC!,
      messages: [{ value: JSON.stringify(event) }],
    });
    console.log("Sent password reset event to Kafka");
  } catch (error) {
    console.log("Error sending password reset event to Kafka:", error);
  }
};

export { connectProducer, sendEmailVerificationEvent, sendPasswordResetEvent };
