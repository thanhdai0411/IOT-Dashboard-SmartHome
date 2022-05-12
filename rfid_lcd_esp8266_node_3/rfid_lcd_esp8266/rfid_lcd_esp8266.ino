#include <ESP8266WiFi.h>
#include <String.h>
#include <EEPROM.h>  //Library To read and write PICC's UIDs from/to EEPROM
#include <SPI.h>     //Library  RC522 Module uses SPI protocol
#include <MFRC522.h> //Library  RC522 Module
#include <LiquidCrystal_I2C.h>
#include <Servo.h>
Servo servo;
int Buzzer = D3;

boolean match = false;       // initialize card match to false
boolean programMode = false; // initialize programming mode to false
int successRead;             // Variable integer to keep if we have Successful Read from Reader
byte storedCard[4];          // Stores an ID read from EEPROM
byte readCard[4];            // Stores scanned ID read from RFID Module
byte masterCard[4];          // Stores master card's ID read from EEPROM

#define SS_PIN D8
#define RST_PIN D0
MFRC522 mfrc522(SS_PIN, RST_PIN); // Instance of the class
MFRC522::MIFARE_Key key;
LiquidCrystal_I2C lcd(0x27, 16, 2);

//******************************************************

/*
SDA - D8
SCK - D5
MOSI - D7
MISO - D6
GND - G
RST - D0
3V3 - 3V


*/

const char *ssid = "IOT_AI LAB";
const char *password = "IOT_HK2_21_22_k456hk54j";

// const char* ssid     = "LINE 2";
// const char* password = "1234567890a";

// const char* ssid     = "VINA";
// const char* password = "voinuocviet";

const uint16_t Port = 9999;
const char *Host = "192.168.1.43";

char buffer[1024] = "", inChar;
int count;
boolean connected = false;
WiFiClient client;

//******************************************************

//================================================
void failedWrite()
{

  //  Serial.println("Something wrong with Card");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("SOMETHING WRONG");
  lcd.setCursor(0, 1);
  lcd.print("WITH CARD");
  delay(2000);
}
// For Sucessfully Deleted:
void successDelete()
{
  //  Serial.println("Succesfully removed");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("  SUCCESFULLY!! ");
  lcd.setCursor(0, 1);
  lcd.print("  REMOVED CARD  ");
  delay(2000);
}

// For Sucessfully Added:
void successWrite()
{

  //  Serial.println("Succesfully added");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("  SUCCESFULLY!! ");
  lcd.setCursor(0, 1);
  lcd.print("   ADDED CARD   ");
  delay(2000);
}
int getID()
{
  // Getting ready for Reading PICCs
  if (!mfrc522.PICC_IsNewCardPresent())
  { // If a new PICC placed to RFID reader continue
    return 0;
  }
  if (!mfrc522.PICC_ReadCardSerial())
  { // Since a PICC placed get Serial and continue
    return 0;
  }

  //  Serial.println("Scanning PICC's UID.........");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("SCANNING");
  lcd.setCursor(0, 1);
  lcd.print("PICC's UID.....");
  delay(2000);
  for (int i = 0; i < 4; i++)
  {
    readCard[i] = mfrc522.uid.uidByte[i];
    //    Serial.print(readCard[i], HEX);
  }
  //  Serial.println("");
  mfrc522.PICC_HaltA(); // Stop reading
  return 1;
}

boolean checkTwo(byte a[], byte b[])
{
  if (a[0] != NULL) // Make sure there is something in the array first
    match = true;   // Assume they match at first
  for (int k = 0; k < 4; k++)
  {                   // Loop 4 times
    if (a[k] != b[k]) // IF a != b then set match = false, one fails, all fail
      match = false;
  }
  if (match)
  {              // Check to see if if match is still true
    return true; // Return true
  }
  else
  {
    return false; // Return false
  }
}

boolean isMaster(byte test[])
{
  if (checkTwo(test, masterCard))
    return true;
  else
    return false;
}

void readID(int number)
{
  int start = (number * 4) + 2; // Figure out starting position
  for (int i = 0; i < 4; i++)
  {                                         // Loop 4 times to get the 4 Bytes
    storedCard[i] = EEPROM.read(start + i); // Assign values read from EEPROM to array
  }
}
int findIDSLOT(byte find[])
{
  int count = EEPROM.read(0); // Read the first Byte of EEPROM that
  for (int i = 1; i <= count; i++)
  {            // Loop once for each EEPROM entry
    readID(i); // Read an ID from EEPROM, it is stored in storedCard[4]
    if (checkTwo(find, storedCard))
    { // Check to see if the storedCard read from EEPROM
      // is the same as the find[] ID card passed
      return i; // The slot number of the card
      break;    // Stop looking we found it
    }
  }
}
boolean findID(byte find[])
{
  int count = EEPROM.read(0); // Read the first Byte of EEPROM that
  for (int i = 1; i <= count; i++)
  {            // Loop once for each EEPROM entry
    readID(i); // Read an ID from EEPROM, it is stored in storedCard[4]
    if (checkTwo(find, storedCard))
    { // Check to see if the storedCard read from EEPROM
      return true;
      break; // Stop looking we found it
    }
    else
    { // If not, return false
    }
  }
  return false;
}

void deleteID(byte a[])
{
  if (!findID(a))
  {                // Before we delete from the EEPROM, check to see if we have this card!
    failedWrite(); // If not
  }
  else
  {
    //    Serial.println("Delete ========================================= ");
    int num = EEPROM.read(0); // Get the numer of used spaces, position 0 stores the number of ID cards
    //    Serial.print("  num: ");
    //    Serial.println(num);

    int slot;    // Figure out the slot number of the card
    int start;   // = ( num * 4 ) + 6; // Figure out where the next slot starts
    int looping; // The number of times the loop repeats
    int j;
    // int count = EEPROM.read(0); // Read the first Byte of EEPROM that stores number of cards
    // Serial.print("    count: ");
    // Serial.println(count);

    slot = findIDSLOT(a); // Figure out the slot number of the card to delete
    //    Serial.print("    slot: ");
    //    Serial.println(slot);

    start = (slot * 4) + 2;
    looping = ((num - slot) * 4);
    //    Serial.print("    looping: ");
    //    Serial.println(looping);

    num--;                // Decrement the counter by one
    EEPROM.write(0, num); // Write the new count to the counter
    //    Serial.print("    numNew--: ");
    //    Serial.println(num);
    // ghi 4 gia tri trước đó vào 4 vị trí bị xóa
    for (j = 0; j < looping; j++)
    {                                                      // Loop the card shift times
      EEPROM.write(start + j, EEPROM.read(start + 4 + j)); // Shift the array values to 4 places earlier in the EEPROM
    }
    for (int k = 0; k < 4; k++)
    { // Shifting loop
      EEPROM.write(start + j + k, 0);
    }
    successDelete();
    //    Serial.println("End Delete ========================================= ");
  }
}

// For Adding card to EEROM:
void writeID(byte a[])
{
  if (!findID(a))
  {
    // Before we write to the EEPROM, check to see if we have seen this card before!
    //    Serial.println("start ADD ========================================= ");

    int num = EEPROM.read(0); // Get the numer of used spaces, position 0 stores the number of ID cards
    //    Serial.print("    numAdd: ");
    //    Serial.println(num);

    int start = (num * 4) + 6; // Figure out where the next slot starts
    //    Serial.print("    startAdd: ");
    //    Serial.println(start);

    num++;                // Increment the counter by one
    EEPROM.write(0, num); // Write the new count to the counter
    //    Serial.print("    num++: ");
    //    Serial.println(num);
    for (int j = 0; j < 4; j++)
    {                                // Loop 4 times
      EEPROM.write(start + j, a[j]); // Write the array values to EEPROM in the right position
    }
    successWrite();

    //    Serial.println("end ADD ========================================= ");
  }
  else
  {
    failedWrite();
  }
}

//================================================

// function active ===============================================
void home()
{
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(" TEAM 1 WELCOME ");
  lcd.setCursor(0, 1);
  lcd.print("   Smart Home   ");
}

void modeMaster()
{
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(" In Mode MASTER ");
  lcd.setCursor(0, 1);
  lcd.print(" Scan for Exit ");
}
//===============================================

void cardSuccess()
{

  byte start_byte = 0x09;
  byte id = 0x03;
  byte leng = 0x01;
  byte cmd = 0x01;
  byte data = 0x01;
  byte stop_byte = 0x09;

  byte crc = start_byte + id + leng + cmd + data + stop_byte;

  char myArray_success[] = {start_byte, id, cmd, leng, data, crc, stop_byte};
  client.write(myArray_success);
  servo.write(180);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(" CONGRATULATION");
  lcd.setCursor(0, 1);
  lcd.print(" ACCESS GRANTED");

  delay(5000);

  servo.write(0);

  home();

  // servo.write(90);
}

void cardFail()
{

  byte start_byte = 0x09;
  byte id = 0x03;
  byte leng = 0x01;
  byte cmd = 0x01;
  byte data = 0x02;
  byte stop_byte = 0x09;

  byte crc = start_byte + id + leng + cmd + data + stop_byte;

  char myArray_fail[] = {start_byte, id, cmd, leng, data, crc, stop_byte};

  client.write(myArray_fail);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("   YOU'RE NOT  ");
  lcd.setCursor(0, 1);
  lcd.print("   AUTHORIZED   ");

  for (int i = 0; i < 3; i++)
  {
    digitalWrite(Buzzer, HIGH); // turn buzzer on
    delay(500);
    digitalWrite(Buzzer, LOW); // turn buzzer off
    delay(500);
  }

  // servo.write(0);

  home();
}
void setup()
{
  // put your setup code here, to run once:
  Serial.begin(9600); // Initialize serial communications with PC
  lcd.init();
  lcd.backlight();
  SPI.begin();        // MFRC522 Hardware uses SPI protocol
  mfrc522.PCD_Init(); // Initialize MFRC522 Hardware
  mfrc522.PCD_SetAntennaGain(mfrc522.RxGain_max);
  EEPROM.begin(512);
  servo.attach(D4);
  servo.write(0);
  pinMode(Buzzer, OUTPUT);
  digitalWrite(Buzzer, LOW); // turn buzzer off

  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.print("connecting to ");
  Serial.println(Host);
  // check Master Card =========================================================
  if (EEPROM.read(1) != 1)
  {
    Serial.println("No Master Card Defined");
    Serial.println("Scan A PICC to Define as Master Card");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.println(" SET MASTERCARD ");
    lcd.setCursor(0, 1);
    lcd.println("SCAN A CARD.....");
    delay(1500);
    do
    {
      successRead = getID();
    } while (!successRead);
    for (int j = 0; j < 4; j++)
    {
      EEPROM.write(2 + j, readCard[j]);
    }
    EEPROM.write(1, 1);
    Serial.println("Master Card Defined");
  }
  //============================================================================
  // show up UIT Master Card up terminal

  Serial.println("Master Card's UID");
  for (int i = 0; i < 4; i++)
  {
    masterCard[i] = EEPROM.read(2 + i);
    Serial.print(masterCard[i], HEX);
  }

  //============================================================================
  // WAITING TO SCAN THE RFID CARDS:
  //  Serial.println("");
  //  Serial.println("Waiting Card to bo scanned :)");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.println("    WAITING     ");
  lcd.setCursor(0, 1);
  lcd.println("  FOR CARDS....   ");
  delay(1000);
  home();
}

void loop()
{

  if (!client.connected())
  {
    if (!client.connect(Host, Port))
    {
      Serial.println("Connection failed");
      connected = false;
    }
    if (client.connected())
    {
      Serial.println("Connected to Server");
      connected = true;
    }
  }

  if (connected == false)
    return;

  // RFID******************************************************

  do
  {
    successRead = getID(); // sets successRead to 1 when we get read from reader otherwise 0

  } while (!successRead); // the program will not go further while you not get a successful read

  if (programMode)
  {
    if (isMaster(readCard)) // ss vs Master Card
    {                       // If master card scanned again exit program mode
      //      Serial.println("This is Master Card");
      //      Serial.println("Exiting Program Mode");
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("  EXITING FROM  ");
      lcd.setCursor(0, 1);
      lcd.print("MASTERCARD MODE");
      delay(2000);

      programMode = false;

      home();
      return;
    }
    else
    {
      if (findID(readCard))
      { // If scanned card is known delete it
        //        Serial.println("I know this CARD, so removing");
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("   AVAILABLE!   ");
        lcd.setCursor(0, 1);
        lcd.print("SO DELETING.....");
        delay(5000);
        deleteID(readCard);
        delay(1000);
        modeMaster();
        //        Serial.println("-----------------------------");
      }
      else
      { // If scanned card is not known add it
        //        Serial.println("I do not know this PICC, adding...");
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print(" Card have UID: ");
        lcd.setCursor(3, 1);
        lcd.print(readCard[0], HEX);
        lcd.print(readCard[1], HEX);
        lcd.print(readCard[2], HEX);
        lcd.print(readCard[3], HEX);
        lcd.print(readCard[4], HEX);
        delay(4000);
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("NOT AVAILABLE");
        lcd.setCursor(0, 1);
        lcd.print("SO ADDING.......");
        delay(5000);
        writeID(readCard);
        delay(1000);
        modeMaster();
        //        Serial.println("-----------------------------");
      }
    }
  }

  else
  {
    if (isMaster(readCard))
    {
      programMode = true;
      // Serial.println("Welcome to Mastercard Mode");
      int count = EEPROM.read(0); // get number card
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("    WELCOME    ");
      lcd.setCursor(0, 1);
      lcd.print("MASTERCARD MODE");
      delay(2000);

      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("    WELCOME    ");
      lcd.setCursor(0, 1);
      lcd.print(" Number User: ");
      lcd.setCursor(13, 1);
      lcd.print(count);
      delay(3000);

      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("SCAN CARD TO");
      lcd.setCursor(0, 1);
      lcd.print("ADD OR REMOVE...");
      delay(3000);
    }
    else
    {
      if (findID(readCard))
      { // If not, see if the card is in the EEPROM
        //        Serial.println("Acces Granted");

        cardSuccess();
        // lcd.clear();
      }
      else
      { // If not, show that the ID was not valid
        //        Serial.println("Access Denied");

        cardFail();
      }
    }
  }
  /////////
  while (client.available())
  {
    String line = client.readStringUntil('\r');
    Serial.print("Data from Server: ");
    Serial.println(line);

    if (line == "8")
    {
      Serial.println("OK");
      /// ADD THEM
      client.write("OK")
    }
    else
    {
      Serial.println("Fail");
      // fail keu bao quet lai
      for (int i = 0; i < 2; i++)
      {
        digitalWrite(Buzzer, HIGH); // turn buzzer on
        delay(1000);
        digitalWrite(Buzzer, LOW); // turn buzzer off
        delay(1000);
      }
    }
  }
}
