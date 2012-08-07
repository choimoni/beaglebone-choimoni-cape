//------------------------------------------------
// Put measurement result on html file.
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
    console.log('Start filetest.js');
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
    //console.log('Push SW['+ PSW + '] / Dip SW['+ DIP4bit + ']'); 

    // MEASURE ANALOG INIPUT -----------
    var mVAIN0 = Math.round(analogRead(AIN0)*100000)/100;   //
    var mVAIN1 = Math.round(analogRead(AIN1)*100000)/100;   //
    var mVAIN2 = Math.round(analogRead(AIN2)*100000)/100;   //
    var mVAIN3 = Math.round(analogRead(AIN3)*100000)/100;   //       
    //console.log('AIN0['+ mVAIN0 +'(mV)] AIN1['+ mVAIN1 +'(mV)] AIN2['+ 
    //mVAIN2 +'(mV)] AIN3['+ mVAIN3 + '(mV)]');

    // DISP DATA --------------------------
    var htmldata = '<html><head><title>sw disp</title><meta http-equiv="refresh" content="5"></head>' +
    '<body bgcolor="pink">' + '<p><center><B><font size="32" color="blue">' + 
    'SW:' + DIP4bit + '</br>AIN0:' + mVAIN0 + '(mV)' + '</br>AIN1:' + mVAIN1 + '(mV)' +
    '</br>AIN2:' + mVAIN2 + '(mV)' + '</br>AIN3:' + mVAIN3 + '(mV)<br>' +
    //'<a href="http://www.choimoni.net/udata/bone001/mdata.csv">csv data</a>' +
    '</font></B></center></p></body></html>';

    // HTTP ACCESS ----------------------
    var http = require('http'), url = require('url'), fs = require('fs'), util = require('util');
    var urlStr = 'http://www.choimoni.net/udata/bone001/mdata.html';
    var u = url.parse(urlStr);                                  //console.log(u);     
    var client = http.createClient(u.port || 80, u.hostname);   //console.log(client);

    //var request = client.request('GET', u.pathname, { host: u.hostname });Å@  // for GET(1/1)
    var request = client.request('PUT', u.pathname, { host: u.hostname });      // for PUT(1/2)
    var wrequest = request.write(htmldata, encoding='utf8');                    // for PUT(2/2)
    request.end();                          //console.log(request);

    request.on('response', function(response){  console.log(response.statusCode);
    Å@for(var i in response.headers){           //console.log(i + ": " + response.headers[i]);
      }
      response.setEncoding('utf8');
      response.on('data', function(chunk){
         util.print(chunk);
      });
      response.on('end', function(){            //console.log('');
      });
    });

    // DISPLAY CONTROL --------------------    {
    digitalWrite(UsrLED1, HIGH); delay(1500); 
    digitalWrite(UsrLED1, LOW);  delay(1500); // LED1 blink 

};

bb.run();
