import socket
import time
import math
import sys
import RPi.GPIO as GPIO1
from grove.gpio import GPIO
from grove.grove_servo import GroveServo
from grove.adc import ADC
from seeed_dht import DHT
from urllib import request, parse
from time import sleep
from rpi_ws281x import PixelStrip, Color
from gpiozero import Button
from random import randint
from grove import helper
from grove.helper import helper
from grove.helper import SlotHelper
import random
import paho.mqtt.client as mqtt #import the client1


GPIO1.setmode(GPIO1.BCM)

helper.root_check()

HOST = "192.168.1.43" #Server IP
PORT = 9999 # Port to listen on
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect((HOST, PORT))

charmap = {
    '0': 0x3f,
    '1': 0x06,
    '2': 0x5b,
    '3': 0x4f,
    '4': 0x66,
    '5': 0x6d,
    '6': 0x7d,
    '7': 0x07,
    '8': 0x7f,
    '9': 0x6f}
a = 0  
ADDR_AUTO = 0x40
ADDR_FIXED = 0x44
STARTADDR = 0xC0
BRIGHT_DARKEST = 0
BRIGHT_DEFAULT = 2
BRIGHT_HIGHEST = 7


LED_FREQ_HZ    = 800000  # LED signal frequency in hertz (usually 800khz)
LED_DMA        = 10      # DMA channel to use for generating signal (try 10)
LED_BRIGHTNESS = 255     # Set to 0 for darkest and 255 for brightest
LED_INVERT     = False   # True to invert the signal (when using NPN transistor level shift)

###############################################################################

###############################################################################


class GroveWS2813RgbStrip(PixelStrip):
    def __init__(self, pin, count, brightness = None):
        ws2812_pins = { 12:0, 13:1, 18:0, 19:1}
        if not pin in ws2812_pins.keys():
            print("OneLedTypedWs2812: pin {} could not used with WS2812".format(pin))
            return
        channel = ws2812_pins.get(pin)

        if brightness is None:
            brightness = LED_BRIGHTNESS

        # Create PixelStrip object with appropriate configuration.
        super(GroveWS2813RgbStrip, self).__init__(
            count,
            pin,
            LED_FREQ_HZ,
            LED_DMA,
            LED_INVERT,
            brightness,
            channel
        )

        # Intialize the library (must be called once before other functions).
        self.begin()


# Define functions which animate LEDs in various ways.
def colorWipe(strip, color, wait_ms=0.01):
    """Wipe color across display a pixel at a time."""
    for i in range(strip.numPixels()):
        strip.setPixelColor(i, color)
        strip.show()
        time.sleep(wait_ms/1000.0)

def theaterChase(strip, color, wait_ms=0.01, iterations=10):
    """Movie theater light style chaser animation."""
    for j in range(iterations):
        for q in range(3):
            for i in range(0, strip.numPixels(), 3):
                strip.setPixelColor(i+q, color)
            strip.show()
            time.sleep(wait_ms/1000.0)
            for i in range(0, strip.numPixels(), 3):
                strip.setPixelColor(i+q, 0)

def wheel(pos):
    """Generate rainbow colors across 0-255 positions."""
    if pos < 85:
        return Color(pos * 3, 255 - pos * 3, 0)
    elif pos < 170:
        pos -= 85
        return Color(255 - pos * 3, 0, pos * 3)
    else:
        pos -= 170
        return Color(0, pos * 3, 255 - pos * 3)

def rainbow(strip, wait_ms=0.01, iterations=1):
    """Draw rainbow that fades across all pixels at once."""
    for j in range(256*iterations):
        for i in range(strip.numPixels()):
            strip.setPixelColor(i, wheel((i+j) & 255))
        strip.show()
        time.sleep(wait_ms/1000.0)

def rainbowCycle(strip, wait_ms=0.01, iterations=5):
    """Draw rainbow that uniformly distributes itself across all pixels."""
    for j in range(256*iterations):
        for i in range(strip.numPixels()):
            strip.setPixelColor(i, wheel((int(i * 256 / strip.numPixels()) + j) & 255))
        strip.show()
        time.sleep(wait_ms/1000.0)

def theaterChaseRainbow(strip, wait_ms=0.01):
    """Rainbow movie theater light style chaser animation."""
    for j in range(256):
        for q in range(3):
            for i in range(0, strip.numPixels(), 3):
                strip.setPixelColor(i+q, wheel((i+j) % 255))
            strip.show()
            time.sleep(wait_ms/1000.0)
            for i in range(0, strip.numPixels(), 3):
                strip.setPixelColor(i+q, 0)

#################################################################################

class Grove4DigitDisplay(object):
    colon_index = 1
 
    def __init__(self, clk, dio, brightness=BRIGHT_DEFAULT):
        self.brightness = brightness
 
        self.clk = GPIO(clk, direction=GPIO.OUT)
        self.dio = GPIO(dio, direction=GPIO.OUT)
        self.data = [0] * 4
        self.show_colon = False
 
    def clear(self):
        self.show_colon = False
        self.data = [0] * 4
        self._show()
 
    def show(self, data):
        if type(data) is str:
            for i, c in enumerate(data):
                if c in charmap:
                    self.data[i] = charmap[c]
                else:
                    self.data[i] = 0
                if i == self.colon_index and self.show_colon:
                    self.data[i] |= 0x80
                if i == 3:
                    break
        elif type(data) is int:
            self.data = [0, 0, 0, charmap['0']]
            if data < 0:
                negative = True
                data = -data
            else:
                negative = False
            index = 3
            while data != 0:
                self.data[index] = charmap[str(data % 10)]
                index -= 1
                if index < 0:
                    break
                data = int(data / 10)
 
            if negative:
                if index >= 0:
                    self.data[index] = charmap['-']
                else:
                    self.data = charmap['_'] + [charmap['9']] * 3
        else:
            raise ValueError('Not support {}'.format(type(data)))
        self._show()
 
    def _show(self):
        with self:
            self._transfer(ADDR_AUTO)
 
        with self:
            self._transfer(STARTADDR)
            for i in range(4):
                self._transfer(self.data[i])
 
        with self:
            self._transfer(0x88 + self.brightness)
 
    def update(self, index, value):
        if index < 0 or index > 4:
            return
 
        if value in charmap:
            self.data[index] = charmap[value]
        else:
            self.data[index] = 0
 
        if index == self.colon_index and self.show_colon:
            self.data[index] |= 0x80
 
        with self:
            self._transfer(ADDR_FIXED)
 
        with self:
            self._transfer(STARTADDR | index)
            self._transfer(self.data[index])
 
        with self:
            self._transfer(0x88 + self.brightness)
 
 
    def set_brightness(self, brightness):
        if brightness > 7:
            brightness = 7
 
        self.brightness = brightness
        self._show()
 
    def set_colon(self, enable):
        self.show_colon = enable
        if self.show_colon:
            self.data[self.colon_index] |= 0x80
        else:
            self.data[self.colon_index] &= 0x7F
        self._show()
 
    def _transfer(self, data):
        for _ in range(8):
            self.clk.write(0)
            if data & 0x01:
                self.dio.write(1)
            else:
                self.dio.write(0)
            data >>= 1
            time.sleep(0.000001)
            self.clk.write(1)
            time.sleep(0.000001)
 
        self.clk.write(0)
        self.dio.write(1)
        self.clk.write(1)
        self.dio.dir(GPIO.IN)
 
        while self.dio.read():
            time.sleep(0.001)
            if self.dio.read():
                self.dio.dir(GPIO.OUT)
                self.dio.write(0)
                self.dio.dir(GPIO.IN)
        self.dio.dir(GPIO.OUT)
 
    def _start(self):
        self.clk.write(1)
        self.dio.write(1)
        self.dio.write(0)
        self.clk.write(0)
 
    def _stop(self):
        self.clk.write(0)
        self.dio.write(0)
        self.clk.write(1)
        self.dio.write(1)
 
    def __enter__(self):
        self._start()
 
    def __exit__(self, exc_type, exc_val, exc_tb):
        self._stop()
   
#####################################################
class GroveWaterSensor:
 
    def __init__(self, channel):
        self.channel = channel
        self.adc = ADC()
 
    @property
    def value(self):
        return self.adc.read(self.channel)

#####################################################
class LEDStrip:

    def __init__(self, clock, data):

        GPIO1.setwarnings(False)

        GPIO1.setmode(GPIO1.BCM)

        self.__clock = clock

        self.__data = data

        self.__delay = 0

        GPIO1.setup(self.__clock, GPIO1.OUT)

        GPIO1.setup(self.__data, GPIO1.OUT)



    def __sendclock(self):

        GPIO1.output(self.__clock, False)

        time.sleep(self.__delay)

        GPIO1.output(self.__clock, True)

        time.sleep(self.__delay)



    def __send32zero(self):

        for x in range(32):

            GPIO1.output(self.__data, False)

            self.__sendclock()



    def __senddata(self, dx):

        self.__send32zero()

        for x in range(32):

            if ((dx & 0x80000000) != 0):

                GPIO1.output(self.__data, True)

            else:

                GPIO1.output(self.__data, False)

            dx <<= 1

            self.__sendclock()

        self.__send32zero()



    def __getcode(self, dat):

        tmp = 0

        if ((dat & 0x80) == 0):

            tmp |= 0x02

        if ((dat & 0x40) == 0):

            tmp |= 0x01

        return tmp



    def setcolourrgb(self, red, green, blue):

        dx = 0

        dx |= 0x03 << 30

        dx |= self.__getcode(blue)

        dx |= self.__getcode(green)

        dx |= self.__getcode(red)



        dx |= blue << 16

        dx |= green << 8

        dx |= red



        self.__senddata(dx)



    def setcolourwhite(self):

        self.setcolourrgb(255, 255, 255)



    def setcolouroff(self):

        self.setcolourrgb(0, 0, 0)



    def setcolourred(self):

        self.setcolourrgb(255, 0, 0)



    def setcolourgreen(self):

        self.setcolourrgb(0, 255, 0)



    def setcolourblue(self):

        self.setcolourrgb(0, 0, 255)




    def cleanup(self):

        self.setcolouroff()

        GPIO1.cleanup()
#####################################################
class GroveLightSensor:
 
    def __init__(self, channel):
        self.channel = channel
        self.adc = ADC()
 
    @property
    def light(self):
        value = self.adc.read(self.channel)
        return value
#####################################################


############################################################

def on_connect(client, userdata, flags, rc):
    
    client.subscribe("Data_control")
    # client.publish("IoT_Mqtt","Client Python")

def on_disconnect(client, userdata, rc):
    print("Disconnected From Broker")

def on_message(client, userdata, message):
    print(message.topic+ ": " + str(message.payload.decode("utf-8")))
    
    #print(message.payload.decode("utf-8"))
    if(message.payload.decode("utf-8") == "ON_4") :
        i = 1
        while(i <= 2):
            print(i)
            i += 1
            colorWipe(strip, Color(255, 0, 0))  # Red wipe
            colorWipe(strip, Color(0, 255, 0))  # Blue wipe
            colorWipe(strip, Color(0, 0, 255))  # Green wipe
            #print ('Theater chase animations.')
            theaterChase(strip, Color(127, 127, 127))  # White theater chase
            theaterChase(strip, Color(127,   0,   0))  # Red theater chase
            theaterChase(strip, Color(  0,   0, 127))  # Blue theater chase
            #print ('Rainbow animations.')
            rainbow(strip)
            rainbowCycle(strip)
            theaterChaseRainbow(strip)
    elif(message.payload.decode("utf-8") == "OFF_4") :
        theaterChase(strip, Color(0, 0, 0))

    elif(message.payload.decode("utf-8") == "ON_5") :
        led.setcolourred()
        time.sleep(0.2)
        led.setcolourgreen()
        time.sleep(0.2)
        led.setcolourblue()
        time.sleep(0.2)
    elif(message.payload.decode("utf-8") == "OFF_5") :
        led.setcolouroff()
            
 
    
########################################

client = mqtt.Client("client_node2") #create new instance

client.on_connect = on_connect
client.on_disconnect = on_disconnect
client.on_message = on_message #attach function to callback

client.connect("broker.hivemq.com") #connect to broker

client.loop_start()   







 
#####################################################


sh = SlotHelper(SlotHelper.PWM)
# pin = sh.argv2pin(" [led-count]")

count = 30
if len(sys.argv) >= 3:
    count = int(sys.argv[2])

strip = GroveWS2813RgbStrip(12, count)
servo = GroveServo(24)
sensor = GroveWaterSensor(0)
led = LEDStrip(26, 27)
display = Grove4DigitDisplay(5, 6)
switch1 = Button(16)
switch2 = Button(22)
sensorDHT = DHT('11', 18)
count = 0


GPIO1.setmode(GPIO1.BCM)

GPIO1.setup(16,GPIO1.IN)
input = GPIO1.input(16)


GPIO1.setup(22,GPIO1.IN)
input = GPIO1.input(22)


while True:
    

    angle = 45
    servo.setAngle(angle)
    #switch1.when_pressed = switch1_press
    #switch1.when_released = switch1_release

    #switch2.when_pressed = switch2_press
    #switch2.when_released = switch2_release
    if (GPIO1.input(16)):
        colorWipe(strip, Color(255, 0, 0))  # Red wipe
        colorWipe(strip, Color(0, 255, 0))  # Blue wipe
        colorWipe(strip, Color(0, 0, 255))  # Green wipe
        #print ('Theater chase animations.')
        theaterChase(strip, Color(127, 127, 127))  # White theater chase
        theaterChase(strip, Color(127,   0,   0))  # Red theater chase
        theaterChase(strip, Color(  0,   0, 127))  # Blue theater chase
        #print ('Rainbow animations.')
        rainbow(strip)
        rainbowCycle(strip)
        theaterChaseRainbow(strip)
    else:
        
        theaterChase(strip, Color(0, 0, 0))
    
    if (GPIO1.input(22)):
        led.setcolourred()
        time.sleep(0.2)
        led.setcolourgreen()
        time.sleep(0.2)
        led.setcolourblue()
        time.sleep(0.2)
        #time.sleep(1)
    else:
        led.setcolouroff()
        

    value_rain = sensor.value

    t = time.strftime("%H%M", time.localtime(time.time()))
    display.show(t)
    display.set_colon(count & 1)
    count += 1
    print(t)
    
    
    # time.sleep(1)
    if (value_rain < 200):
        print("{}, Detected Water.".format(value_rain))
        angle = 120
        servo.setAngle(angle)
        print('{}degree.'.format(angle))
        # time.sleep(1)
    else:
        print("{}, Dry.".format(value_rain))
        angle1 = 45
        servo.setAngle(angle1)
        print('{}degree.'.format(angle1))
        # time.sleep(1)   

    humi, temp = sensorDHT.read()

    print('nhiet do {}C, do am {}%'.format(temp, humi))



    ##############################
    start_byte = 9
    id_frame = 2
    cmd = 1
    length = 20
    stop_byte = 9
    data_1_rain = (value_rain & 0xff00) >> 8
    data_2_rain = (value_rain & 0xff)
    data_temp = temp 
    data_humi = humi
    # time = int(t) 

    time_h = (int(t)  & 0xff00) >> 8
    time_l = (int(t)  & 0xff)
    #print(data_1, data_2)
    
    crc = start_byte + id_frame + cmd + length + stop_byte + data_1_rain + data_2_rain + data_temp + data_humi + time_h +  time_l

    crc_h = (crc & 0xff00) >> 8
    crc_l = (crc & 0xff)

    frame_trans = bytearray([start_byte, id_frame, cmd , length, data_1_rain, data_2_rain , data_temp, data_humi, crc_h, crc_l,time_h, time_l, stop_byte])


    sock.sendall(frame_trans)


    data = sock.recv(1024) 
    # print("Data Server: {}".format(data))
    if(data[0] == 9) :
        print(">> Succesfull!!")
        sock.sendall(b"OK") 
    else:
        print(">> Fail")
        sock.sendall(frame_trans)


    ##############################

    sleep(1)
    
        
 
