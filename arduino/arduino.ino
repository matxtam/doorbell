#include <Arduino.h>
#include <U8g2lib.h>
 
#ifdef U8X8_HAVE_HW_SPI
#include <SPI.h>
#endif
#ifdef U8X8_HAVE_HW_I2C
#include <Wire.h>
#endif
 
U8G2_SSD1306_128X64_ALT0_F_HW_I2C u8g2(U8G2_R0, /* reset=*/ U8X8_PIN_NONE); // SSD1306 and SSD1308Z are compatible
 
// U8G2_SSD1306_128X64_NONAME_F_SW_I2C u8g2(U8G2_R0, /* clock=*/ SCL, /* data=*/ SDA, /* reset=*/ U8X8_PIN_NONE);    //Low spped I2C
 
/* command table:
c0 call ended
c1 call connected
c2 call connection failed
d1 door open
*/

const int buttonpin = 5;
const int ledpin = 6;
const int doorpin = 8;
int val, val_prev;
String inputString = "";         // a String to hold incoming data
bool receivingDisplay = false;

bool stringComplete = false;  // whether the string is complete
// bool calling = false;
char state = 's'; 
int timer=0;
void showText(const char *);
void showState();

void setup()
{
  Serial.begin(9600);
  pinMode(buttonpin, INPUT);
  pinMode(ledpin, OUTPUT);
  pinMode(doorpin, OUTPUT);
  // reserve 200 bytes for the inputString:
  inputString.reserve(200);
  digitalWrite(doorpin, false);
  Serial.println("Start");

  u8g2.begin();
  u8g2.setFont(u8g2_font_7x13B_tf);
  u8g2.clearBuffer();                   // clear the internal memory
  u8g2.drawStr(0,10,"System On");    // write something to the internal memory
  u8g2.sendBuffer();                    // transfer internal memory to the display
}

void loop()
{
   if (stringComplete) {
    // Serial.print("you just input:\"");
    Serial.print(inputString);
    Serial.print("\n");
    // Serial.println("\"");
    if(receivingDisplay){
      showText(inputString.c_str());
      delay(1000);
      showState();
      receivingDisplay = false;
    }else if(inputString == "c0"){
      digitalWrite(ledpin, false);
      state = 's';
      // delay(1000);
      showState();
      timer = 0;
      
    }else if(inputString == "d1"){
      // Serial.println("open door");
      showText("door opened!");
      digitalWrite(doorpin, true);
      delay(2000);
      showText("door closed!");
      digitalWrite(doorpin, false);
      delay(2000);
      showState();

    }else if(inputString == "c1"){
      // Serial.println("connected");
      // showText("Connected");
      digitalWrite(ledpin, false);
      state = 'n';
      showState();
      timer = 0;
    }
    inputString = "";
    
    stringComplete = false;
  }

  val = digitalRead(buttonpin);

  // status: calling
  if(val && !val_prev && state != 'l'){
    digitalWrite(ledpin, true);
    state = 'l';
    showState();
    Serial.print("calling");
    timer = millis();
  }
  val_prev = val;

  int time = millis();
  if(timer != 0 && time - timer > 30000){
    Serial.print("missed");
    digitalWrite(ledpin, false);
    state = 's';
    timer = 0;
    showText("No response");
    delay(1000);
    showState();
  }

  // analogWrite(wheelPin, fan_pwm);
}

/*
  SerialEvent occurs whenever a new data comes in the hardware serial RX. This
  routine is run between each time loop() runs, so using delay inside loop can
  delay response. Multiple bytes of data may be available.
*/
void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();

    if (inChar == '.') {
      stringComplete = true;
    }else if(inChar == '*'){
      receivingDisplay = true;
    }else if(inChar != '\n'){
      inputString += inChar;
    }
     
  }
}

void showText(const char *msg){
  u8g2.clearBuffer();
  u8g2.drawStr(2,12,msg);
  u8g2.sendBuffer();
}

void showState(){
  u8g2.clearBuffer();
  if(state == 's'){
    u8g2.drawStr(2, 12, "System On");
  }else if(state == 'l'){
    u8g2.drawStr(2, 12, "Calling...");
  }else if(state == 'n'){
    u8g2.drawStr(2, 12, "Connected");
  }else{
    u8g2.drawStr(2, 12, "Magic");
  }
  u8g2.sendBuffer();
}
