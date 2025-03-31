import uuid
import paho.mqtt.client as mqtt
from pathlib import Path
import threading
import time
import os
# os.system('sudo shutdown -r now')

MQTT_BROKER = "test.mosquitto.org"
MQTT_PORT = 8081
ID = ""
isConnected = False
timer = None

def broadcast(client):
  try:
    client.publish("matxtam/devices", ID)
    global timer
    timer = threading.Timer(2, broadcast, args=(client,))  # Runs again after 10 seconds
    timer.start()
  except:
    print("[-] broadcast interupted")

def stop_broadcast():
  global timer
  if timer:
    timer.cancel()  # Stops the next scheduled run
    print("[+] Broadcast stopped")

def on_connect(client, userdata, flags, rc):
  if rc == 0:
    print("[+] Connected to broker")
    client.subscribe("matxtam/cmd")
    broadcast(client)
    print("[*] Broadcast start")
  else:
    print("[!] Failed to connect to broker")

def handleUpdate():
    os.system("wget -O device.py https://raw.githubusercontent.com/matxtam/doorbell/refs/heads/main/dma/device.py")
    os.system("sudo systemctl restart dma")

def on_message(client, ser, msg): # ser is a user data
  print("[*] Received "+msg.topic+": "+msg.payload.decode('utf-8'))
  if msg.topic == "matxtam/cmd" :
    if msg.payload.decode('utf-8') == "update":
        handleUpdate()

def gen_ID():
  UUID = uuid.uuid4()
  print("[+] generated ID = " + str(UUID))
  with open("ID.txt", "w") as text_file:
    text_file.write(str(UUID))

def main():

  ID_f = Path("./ID.txt")
  if not ID_f.is_file():
    gen_ID()
  
  with open("ID.txt", "r") as text_file:
    global ID
    ID = text_file.read()
  

  # mqtt
  client = mqtt.Client(transport='websockets')
  client.on_connect = on_connect
  client.on_message = on_message
  client.tls_set()
  client.connect(MQTT_BROKER, MQTT_PORT, 60)
  client.loop_start()
  print("[*] mqtt client start...")
  try:
    while(1):
      time.sleep(1)
  except KeyboardInterrupt:
    stop_broadcast()
    client.loop_stop()
    client.disconnect()
    print("[+] mqtt client stop")

if __name__=='__main__':
  main()
