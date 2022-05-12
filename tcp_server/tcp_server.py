import socket
from threading import Thread
from time import sleep
import paho.mqtt.client as mqtt #import the client1


#HOST = "127.0.0.1" #(localhost)
HOST = "192.168.1.43" #Server IP
PORT = 9999 # Port to listen on


client_mqtt = mqtt.Client("client_python") #create new instance

client_mqtt.connect("broker.hivemq.com") #connect to broker


#####################################

def _mqtt_node_2(data_1,data_2,data_3, time):
    client_mqtt.publish("Data_sensor_humi",data_1)
    client_mqtt.publish("Data_sensor_temp",data_2)
    client_mqtt.publish("Data_sensor_rain",data_3)
    client_mqtt.publish("Data_time_node2",time)


def _mqtt_node_1(data):
    client_mqtt.publish("Data_sensor_light",data)


def _mqtt_esp(data):
    client_mqtt.publish("Data_esp",data)


#####################################


def client(conn, addr):
    while True:
        #conn.sendall(b"ON") #gui du lieu
        data = conn.recv(1024) #doc du lieuif not data:
        if not data:
            break
        # conn.sendall(data) #gui du lieu
        
        if(data[1] == 1):
            
            start_node1 = data[0] 
            id_frame_node1 = data[1]
            cmd_node1 = data[2]
            length_node1 = data[3]
            
            data_light_h = data[4]
            data_light_l = data[5]

            crc_node1_h = data[6]
            crc_node1_l = data[7]

            stop_node1 = data[8]

            value_sensor = data_light_h * 256 + data_light_l

            crc_client_node_1 = crc_node1_h * 256 + crc_node1_l

            crc_check_server = start_node1 +  id_frame_node1 + cmd_node1 + length_node1 + data_light_h + data_light_l + stop_node1


            if(crc_client_node_1 == crc_check_server ) :
                print(f"Node_1: {data}")
                _mqtt_node_1(value_sensor)
                conn.sendall(bytearray([9])) 
            else:
                conn.sendall(bytearray([8]))

        if(data[1] == 2):
            
            start_node1 = data[0] 
            id_frame_node1 = data[1]
            cmd_node1 = data[2]
            length_node1 = data[3]
            
            data_rain_h = data[4]
            data_rain_l = data[5]
            data_temp = data[6]
            data_humi = data[7]

            crc_node2_h = data[8]
            crc_node2_l = data[9]
            time_h = data[10]
            time_l = data[11]

            stop_node1 = data[12]

            value_sensor_rain = data_rain_h * 256 + data_rain_l

            crc_client_node_2 = crc_node2_h * 256 + crc_node2_l
            
            time_local = time_h  * 256 + time_l
            # print(f"Time: {time_local}")

            crc_check_server = start_node1 +  id_frame_node1 + cmd_node1 + length_node1 + data_rain_h + data_rain_l +data_temp+data_humi + stop_node1 + time_l + time_h


            if(crc_client_node_2 == crc_check_server ) :
                print(f"Node_2: {data}")
                _mqtt_node_2(data_humi,data_temp,value_sensor_rain,time_local)
                conn.sendall(bytearray([9])) 
            else:
                conn.sendall(bytearray([8]))

        if(data[1] == 3): 

            start = data[0]
            id_esp = data[1]
            cmd = data[2]
            leng = data[3]
        
            data_esp = data[4] 
            crc_esp =  data[5]
            stop = data[6]
            
            # print(start, id_esp, cmd ,leng, data_esp,crc_esp,stop)
            crc_check_server = start + id_esp + cmd + leng + data_esp + stop 

            if(crc_check_server == crc_esp ) :

                # print (start, id_esp, cmd, leng, data_esp,crc_esp,stop)
                _mqtt_esp(data_esp)

                print(f"Node_esp: {data}")
                conn.sendall(b'8')
                if(data_esp == 1) :
                    print("Open")
                    
                    
                else: 
                    print("Close")
                
            else :
                conn.sendall(b'9')



    print("End connection from {}".format(addr))
    conn.close()

# Create a TCP/IP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# Bind the socket to the portc
sock.bind((HOST, PORT))
# Listen for incoming connections
sock.listen(1)


while True:
    conn, addr = sock.accept()
    
    print("Got connection from {}".format(addr))
 
    Thread(target=client, args=(conn, addr)).start()
    
        
   

