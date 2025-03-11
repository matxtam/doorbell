import { useEffect, useState } from "react";
import mqtt from "mqtt";
// import client from "../mqttClient";

const MQTT_BROKER = "wss://test.mosquitto.org:8081";
const MQTT_TOPIC = "matxtam/doorbell";

function Contact() {
	const [message, setMessage] = useState("no message");
	const [mqttClient, setMqttClient] = useState(null);

	useEffect(() => {
		const client = mqtt.connect(MQTT_BROKER);
		setMqttClient(client);

		client.on("connect", () => {
			console.log("connected to mqtt broker");
			client.subscribe(MQTT_TOPIC)
		});

    client.on("message", (topic, payload) => {
      console.log(`Received: ${payload.toString()}`);
      setMessage(payload.toString());
    });

    return () => {
      client.end();
    };
  }, []);

  const publishMessage = (msg) => {
		if (mqttClient) {
			mqttClient.publish(MQTT_TOPIC, msg);
		}
  };

  return (<>
		<h1>MQTT test</h1>
		<p>Received Message: {message}</p>
    <button onClick={() => publishMessage("d1.")}>open door</button>
    <button onClick={() => publishMessage("c0.")}>refuse</button>
  
	</>)
}
export default Contact;
