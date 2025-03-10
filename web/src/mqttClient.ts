import mqtt from "mqtt";

const MQTT_BROKER = "mqtt://test.mosquitto.org:8080"; // Use WebSocket URL
const options = {
  clean: true, // Maintain session
  connectTimeout: 4000, // Timeout
  reconnectPeriod: 1000, // Auto-reconnect
};

// const client = mqtt.connect(MQTT_BROKER, options);
const client = mqtt.connect(MQTT_BROKER);

client.on("connect", () => {
  client.subscribe("presence", (err) => {
    if (!err) {
      client.publish("presence", "Hello mqtt");
    }
  });
});

client.on("message", (topic, message) => {
  // message is Buffer
  console.log(message.toString());
  client.end();
});

/*
client.on("connect", () => {
  console.log("Connected to MQTT broker");
	client.subscribe("presence", (err) => {
    if (!err) {
      client.publish("presence", "Hello mqtt");
    }
  });
});

client.on("error", (err) => {
  console.error("MQTT Connection Error:", err);
});

console.log("heck");
*/
export default client;
