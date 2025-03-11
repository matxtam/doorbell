import "./Home.css"
import { useEffect, useState } from "react";
import mqtt from "mqtt";
import hangup from "./../assets/hangup.png"
import pickup from "./../assets/pickup.png"

const MQTT_BROKER = "wss://test.mosquitto.org:8081";

function Home() {
	const [mqttClient, setMqttClient] = useState(null);
	const [call, setCall] = useState("none");
	const [input, setInput] = useState("");

	useEffect(() => {
		const client = mqtt.connect(MQTT_BROKER);
		setMqttClient(client);

		client.on("connect", () => {
			console.log("connected to mqtt broker");
			client.subscribe("matxtam/call");
			client.subscribe("matxtam/missedCalls");
		});

    client.on("message", (topic, payload) => {
      console.log(`Received: ${payload.toString()}`);
		setCall(payload.toString());
    });

    return () => {
      client.end();
    };
  }, []);

  const publishMessage = (topic, msg) => {
		if (mqttClient) {
			mqttClient.publish(topic, msg);
		}
  };

	const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      console.log("Entered:", input);
			publishMessage("matxtam/msg", input);
      setInput(""); // Clear input
    }
  };


  return (<div className="center">
		<h1 hidden={call !== "calling"}>Bell ringing</h1>
		<h1 hidden={call !== "ing"}>    In a call</h1>
		<div className="btn">
			<button 
			hidden={call !== "calling" && call !== "ing"}
			onClick={() => {
				if(call === "calling")publishMessage("matxtam/call", "refused")
				if(call ===     "ing")publishMessage("matxtam/call", "ended")
			}}>
				<img src={hangup} width="100"/>
			</button>
			<button
			hidden={call !== "calling"}
			onClick={() => {
				publishMessage("matxtam/call", "ing")
			}}>
				<img src={pickup} width="100"/>
			</button>
		</div>
		<button onClick={() => publishMessage("matxtam/door", "unlock")}>unlock door</button>
		<input
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="leave a message to your door"
      className="border rounded p-2"
    />
	</div>)
}
export default Home;
