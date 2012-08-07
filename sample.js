//------------------------------------------------
// Multiple io pin setup and measurement.
//------------------------------------------------

var bb = require('bonescript');

var Seq   = 0;              // Sequence Number

var AIN0 = bone.P9_39;      // AIN0 Temp
var AIN1 = bone.P9_40;      // AIN1 Humid
var AIN2 = bone.P9_37;      // AIN2 Light
var AIN3 = bone.P9_38;      // AIN3 External

var PushSW = bone.P8_3;     // PushSW
var DipSW0 = bone.P8_12;    // DipSW bit0
var DipSW1 = bone.P8_11;    // DipSW bit1
var DipSW2 = bone.P8_16;    // DipSW bit2
var DipSW3 = bone.P8_15;    // DipSW bit3

var UsrLED1 = bone.USR1;    // User LED1
var ActLED = bone.P8_13;    // Active LED
var PSWout = bone.P8_41;    // Photocoupler Out

setup = function() {
    // PIN MODE SETTING -------------
    pinMode(ActLED, OUTPUT);    // User LED1
    pinMode(UsrLED1, OUTPUT);   // User LED1
    
    pinMode(PushSW, INPUT);     // Push Switch
    pinMode(DipSW0, INPUT);     // Dip Switch bit0
    pinMode(DipSW1, INPUT);     // Dip Switch bit1
    pinMode(DipSW2, INPUT);     // Dip Switch bit2
    pinMode(DipSW3, INPUT);     // Dip Switch bit3

    pinMode(PSWout, OUTPUT);    // Photocoupler SW out
    
    // INITIALIZE -------------------
    digitalWrite(UsrLED1, LOW); // Led1 Init "Off"
    digitalWrite(ActLED, LOW);  // Led3 Init "Off"      
    digitalWrite(PSWout, LOW);  // Photocoupler "Off"      
    console.log('Start sample.js');
};

loop = function() {
    // TIME STAMP ----------------------
    var date = new Date();
    console.log('(' + Seq + ')' + date);    Seq++;    
    
    // CHECK SWITCH STATUS1 -------------
    var valPSW = digitalRead(PushSW);           // Push Switch Status ON/OFF
    if(valPSW < 1) {    PSW = 'ON';     }       // change mode
    else {              PSW = 'OFF';    }

    // CHECK SWITCH STATUS2 -------------
    var valDSW0 = digitalRead(DipSW0); // bit0: Cape Address 0
    var valDSW1 = digitalRead(DipSW1); // bit1: Cape Address 1
    var valDSW2 = digitalRead(DipSW2); // bit2: XBee mode "Cordinator/End device"
    var valDSW3 = digitalRead(DipSW3); // bit3: Select SPI "Internal/Extention"
    var DIP4bit = 15-(valDSW3*0x08 | valDSW2*0x04 | valDSW1*0x02 | valDSW0*0x01);
    console.log('Push SW['+ PSW + '] / Dip SW['+ DIP4bit + ']'); 

    // MEASURE ANALOG INIPUT -----------
    var mVAIN0 = Math.round(analogRead(AIN0)*100000)/100;   // 
    var mVAIN1 = Math.round(analogRead(AIN1)*100000)/100;   // 
    var mVAIN2 = Math.round(analogRead(AIN2)*100000)/100;   // 
    var mVAIN3 = Math.round(analogRead(AIN3)*100000)/100;   // 
    console.log('AIN0['+ mVAIN0 +'(mV)] AIN1['+ mVAIN1 +'(mV)] AIN2['+ mVAIN2 +'(mV)] AIN3['+ mVAIN3 + '(mV)]');    
    
    // DISPLAY CONTROL --------------------    {
    digitalWrite(UsrLED1, HIGH); delay(500); 
    digitalWrite(UsrLED1, LOW);  delay(500); // LED1 blink 
    
};

bb.run();
