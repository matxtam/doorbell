#!/usr/bin/env python

import sys
import serial
import threading
import time
import paho.mqtt.client as mqtt

MQTT_TOPIC = "matxtam/doorbell"
MQTT_BROKER = "test.mosquitto.org"
MQTT_PORT = 8081
msg_opendoor = "d1."
msg_calling = "c1."
msg_endcall = "c0."

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to broker")
        client.subscribe("matxtam/door")
        client.subscribe("matxtam/call")
        client.subscribe("matxtam/msg")
    else:
        print("Failed to connect to broker")

def on_message(client, ser, msg): # ser is a user data
    print("Received "+msg.topic+": "+msg.payload.decode('utf-8'))
    if msg.topic == "matxtam/door" :
        ser.write(msg_opendoor.encode())
    if msg.topic == "matxtam/call": 
        if msg.payload.decode('utf-8') == "refused":
            display_msg = "*call refused."
            ser.write(msg_endcall.encode())
            ser.write(display_msg.encode())
        elif msg.payload.decode('utf-8') == "ing":
            display_msg = "*connected."
            ser.write(msg_calling.encode())
            ser.write(display_msg.encode())
        elif msg.payload.decode('utf-8') == "ended":
            display_msg = "*call ended."
            ser.write(msg_endcall.encode())
            ser.write(display_msg.encode())
    if msg.topic == "matxtam/msg": 
        display_msg = "*" + msg.payload.decode('utf-8') + "."
        ser.write(display_msg.encode())


def main():
    print('input q for quit')
    try:
        ser = serial.Serial('/dev/ttyACM0', 9600, timeout= 0.5 ) #RPi serial port
    except:
        print("failed to connect to serial port")
    client = mqtt.Client(transport='websockets')
    client.on_connect = on_connect
    client.on_message = on_message
    client.tls_set()
    client.user_data_set(ser)
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_start()

    while True:
        if ser.in_waiting:
            msg_ardu = ser.readline().decode('utf-8')
            print(msg_ardu)
            if msg_ardu == "calling":
                client.publish("matxtam/call", "calling")
                print("calling state published")
        '''
        input_temp = input()
        
        if input_temp == 'q':
            if ser:
                ser.close()
            break
        if input_temp == 'mqtttest':
            print('please input message')
            input_temp = input()
            client.publish(MQTT_TOPIC, input_temp)
            continue
        try:
            ser.write(input_temp.encode())
        except Exception as e:
            print("write error: ")
            print(e)
        '''

    client.loop_stop()
    client.disconnect()

if __name__=='__main__':
    main()
