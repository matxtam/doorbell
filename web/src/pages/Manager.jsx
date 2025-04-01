import React from 'react';
import "./Home.css"
import { useEffect, useState, useRef } from "react";
import mqtt from "mqtt";
import hangup from "./../assets/hangup.png"
import pickup from "./../assets/pickup.png"

// const MQTT_BROKER = "wss://test.mosquitto.org:8081";
const MQTT_BROKER = "05b5f290eea24d6f857d3d2abc51ab88.s1.eu.hivemq.cloud"
const TIMEOUT = 5*1000;
class Active {
	constructor(callback) {
		this.timeoutID= "";
		this.callback = callback;
		this.startTimeout();
	}

	startTimeout(){
		this.timeoutID = setTimeout(() => {
			this.callback(false);
		}, TIMEOUT);
	}
	
	reactivate() {
		clearTimeout(this.timeoutID);
		this.callback(true);
		this.startTimeout();
	}
}

function Manager() {
	const [mqttClient, setMqttClient] = useState(null);
	const [input, setInput] = useState("");
	const [devices, setDevices] = useState([]);
	const inputUserRef = useRef(null);
	const inputPswdRef = useRef(null);

	const activeCallback = (id, newState) => {
		setDevices(predevices => {
			const found = predevices.find(dev => dev.id == id);
			return predevices.with(predevices.indexOf(found), 
				{...found, live: newState});
		})
	}

	// useEffect(() => {
	const handleConnect = () => {
		const client = mqtt.connect({
			host: MQTT_BROKER,
			port: 8884,
			path: "/mqtt",
			protocol: "wss",
			username: inputUserRef.current.value,
			password: inputPswdRef.current.value
		});
		setMqttClient(client);
		inputUserRef.current.value = "";
		inputPswdRef.current.value = "";

		client.on("connect", () => {
			console.log("connected to mqtt broker");
			client.subscribe("matxtam/devices");
		});

    client.on("message", (topic, payload) => {
      console.log(`Received: ${payload.toString()}`);
			const msg = payload.toString();

			setDevices(predevices => {
				const found = predevices.find(dev => dev.id == msg);
				if(found == undefined ){
					return [...predevices, {
							id:msg, 
							liveObj: new Active((newState) => {
								activeCallback(msg, newState);
							}),
							live: true
						}];
				}else{
					found.liveObj.reactivate();
				}
				return predevices;
			});
    });
	}

	const handleDisconnect = () => {
    mqttClient.end();
		setMqttClient(null);
	}

  const publishMessage = (topic, msg) => {
		if (mqttClient) {
			mqttClient.publish(topic, msg);
		}
  };


  return (<div className="center">
		<h1>Device Manager</h1>

		{mqttClient ? <></> : <>
		<input
      type="text"
			ref={inputUserRef}
      placeholder="username"
    />
		<input
      type="password"
			ref={inputPswdRef}
      placeholder="password"
    />
		</>}
		<button onClick={mqttClient ? handleDisconnect : handleConnect
		}>{mqttClient ? "disconnect" : "connect"}</button>
		{devices.map((device) => 
			(<div className={
				device.live ? "activedevice" : "device"
			} key={device.id}>
				<p >{device.id}</p>
				<p>{device.live ? "active" : "power off"}</p>
				<button onClick={
					() => publishMessage(device.id.concat("/cmd"), "update")
				}>update</button>
				<button onClick={
					() => publishMessage(device.id.concat("/cmd"), "reboot")
				}>reboot</button>
				<button onClick={
					() => publishMessage(device.id.concat("/cmd"), "shutdown")
				}>shutdown</button>
				
			</div>)
		)}
	</div>)
}
export default Manager;
