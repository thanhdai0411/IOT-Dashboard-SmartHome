import time
from grove.grove_ultrasonic_ranger import GroveUltrasonicRanger
from grove.grove_servo import GroveServo
import RPi.GPIO as GPIO
from grove.adc import ADC
from gpiozero import LED

import socket

import paho.mqtt.client as mqtt #import the client1


#####################################################

 
class GroveLightSensor:
 
    def __init__(self, channel):
        self.channel = channel
        self.adc = ADC()
 
    @property
    def light(self):
        value = self.adc.read(self.channel)
        return value
 
Grove = GroveLightSensor
 


#####################################################


ultra_1_in = GroveUltrasonicRanger(5)

ultra_1_out = GroveUltrasonicRanger(16)


servo_cong  = GroveServo(12)

sensor_light = GroveLightSensor(0)
led_cong = LED(24)

led_room_1 = LED(22)
led_room_2 = LED(26)
led_room_3 = LED(23)
led_room_4 = LED(18)




############################################################

def on_connect(client, userdata, flags, rc):
    
    client.subscribe("Data_control")
    # client.publish("IoT_Mqtt","Client Python")

def on_disconnect(client, userdata, rc):
    print("Disconnected From Broker")

def on_message(client, userdata, message):
    print(message.topic+ ": " + str(message.payload.decode("utf-8")))
    
    #print(message.payload.decode("utf-8"))
    if(message.payload.decode("utf-8") == "ON_0") :
        led_room_1.on() 
    elif(message.payload.decode("utf-8") == "OFF_0"):
        led_room_1.off() 
    elif(message.payload.decode("utf-8") == "ON_1") :
        led_room_2.on() 
    elif(message.payload.decode("utf-8") == "OFF_1"):
        led_room_2.off() 
    elif(message.payload.decode("utf-8") == "ON_2"):
        led_room_3.on() 
    elif(message.payload.decode("utf-8") == "OFF_2"):
        led_room_3.off()
    elif(message.payload.decode("utf-8") == "ON_3"):
        led_room_4.on() 
    elif(message.payload.decode("utf-8") == "OFF_3"):
        led_room_4.off() 
########################################

client = mqtt.Client("client_node1") #create new instance

client.on_connect = on_connect
client.on_disconnect = on_disconnect
client.on_message = on_message #attach function to callback

client.connect("broker.hivemq.com") #connect to broker

client.loop_start()   



#####################################################

HOST = "192.168.1.43" #Server IP
PORT = 9999 # Port to listen on
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect((HOST, PORT))


while True :
    distance_out = ultra_1_out.get_distance()
    time.sleep(0.1)
    distance_in = ultra_1_in.get_distance()
    value_light = sensor_light.light
    servo_cong.setAngle(135)

    #####################################################
   
    
    
    print('Out:{:.2f} cm'.format(distance_out))
    print('In: {:.2f} cm'.format(distance_in))
    print('Light value: {0}'.format(value_light))

    #####################################################
    
    if(int(distance_in) < 5 or int(distance_out) < 5 ) :
        servo_cong.setAngle(180)  
    else:
        servo_cong.setAngle(135)
        
    if(value_light < 100) :
        led_cong.on() 
    elif (value_light > 600) :
        led_cong.off()

    #####################################################

    start_byte = 9
    id_frame = 1
    cmd = 1
    length = 20
    stop_byte = 9
    data_1 = (value_light & 0xff00) >> 8
    data_2 = (value_light & 0xff)
    #print(data_1, data_2)

    crc = start_byte + id_frame + cmd + length + stop_byte + data_1 + data_2

    crc_h = (crc & 0xff00) >> 8
    crc_l = (crc & 0xff)

    frame_trans = bytearray([start_byte, id_frame, cmd , length, data_1, data_2 , crc_h, crc_l, stop_byte])


    sock.sendall(frame_trans)


    data = sock.recv(1024) 
    print("Data Server: {}".format(data))
    if(data[0] == 9) :

        print("Succesfull!!")
        sock.sendall(b"OK") 

    else:
        print("Fail")
        sock.sendall(frame_trans) 

    #####################################################
      
      
    
    time.sleep(1)
    