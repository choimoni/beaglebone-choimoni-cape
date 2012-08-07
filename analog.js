//-------------------------------------------------
// Put measurement result on csv file. 
// Get policy file for control io pin.
//-------------------------------------------------
var bb = require('bonescript');

var myname = "choimonio"; 

var title = "date," + "temp(C)," + "humid(%)," + "light(uW)," + "ext(mV),";
var dataAp = 2;             // pointer
var NofM = 10;              // Number of measurement buffer
var dataArray = new Array(NofM);
var Photocoupler = 0;       // Push SW for test

var mode   = 0;             // mode
var Seq    = 0;             // Sequence Number
var HysBar = 4;             // ON/OFF Control Bar

var UsrLED1 = bone.USR1;    // User LED1
var UsrLED2 = bone.USR2;    // User LED2
var UsrLED3 = bone.USR3;    // User LED3

var AIN0 = bone.P9_39;      // Temp
var AIN1 = bone.P9_40;      // Humid
var AIN2 = bone.P9_37;      // Light
var AIN3 = bone.P9_38;      // External

var PushSW = bone.P8_3;     // PushSW
var DipSW0 = bone.P8_12;    // DipSW bit0
var DipSW1 = bone.P8_11;    // DipSW bit1
var DipSW2 = bone.P8_16;    // DipSW bit2
var DipSW3 = bone.P8_15;    // DipSW bit3

var PSWout = bone.P8_41;    // Photocoupler Out
var ActLED = bone.P8_13;    // Active LED

setup = function() {
    // PIN MODE SETTING -------------
    // pinMode(pin, direction, [mux], [pullup], [slew], [callback])
    pinMode(ActLED, OUTPUT);    // User LED1
    
    pinMode(UsrLED1, OUTPUT);   // User LED1
    pinMode(UsrLED2, OUTPUT);   // User LED2
    pinMode(UsrLED3, OUTPUT);   // User LED3
    
    pinMode(PushSW, INPUT);     // Push Switch
    pinMode(DipSW0, INPUT);     // Dip Switch bit0
    pinMode(DipSW1, INPUT);     // Dip Switch bit1
    pinMode(DipSW2, INPUT);     // Dip Switch bit2
    pinMode(DipSW3, INPUT);     // Dip Switch bit3

    pinMode(PSWout, OUTPUT);    // Photocoupler SW out

    // INITIALIZE -------------------
    digitalWrite(UsrLED1, LOW); // Led1 Init "Off"
    digitalWrite(UsrLED2, LOW); // Led2 Init "Off"
    digitalWrite(UsrLED3, LOW); // Led3 Init "Off"  
    digitalWrite(ActLED, LOW);  // Led3 Init "Off"    
    digitalWrite(PSWout, Photocoupler);     // Photocoupler ON/OFF
    console.log('Start analog.js');
};

loop = function() {
    // CHECK SWITCH STATUS1 -------------
    var valPSW = 1;             // Push Switch value  0/1
    var PSW = '';               // Push Switch Status ON/OFF
    if(digitalRead(PushSW) < 1) {   
        delay(50);                                      // 50ms delay
        if(digitalRead(PushSW) < 1) { valPSW = 0; }     // double check
    }
    if(valPSW < 1) { PSW = 'ON'; mode++;  if(mode > 3) { mode = 1; }}   // change mode
    else {           PSW = 'OFF';       }                               // do nothing

    // TIME STAMP ----------------------
    var date = new Date();
    console.log('(' + Seq + ')' + date);    Seq++;

    // CHECK SWITCH STATUS2 -------------
    var valDSW0 = digitalRead(DipSW0);      // bit0: Cape Address 0
    var valDSW1 = digitalRead(DipSW1);      // bit1: Cape Address 1
    var valDSW2 = digitalRead(DipSW2);      // bit2: XBee mode "Cordinator/End device"
    var valDSW3 = digitalRead(DipSW3);      // bit3: Select SPI "Internal/Extention"
    var DIP4bit = 15-(valDSW3*0x08 | valDSW2*0x04 | valDSW1*0x02 | valDSW0*0x01);
    console.log('Push SW['+ PSW + '] / Dip SW['+ DIP4bit + '] / Mode[' + mode + ']'); 
                                            // 4bit hex to decimal(0-15)

    // MEASURE ANALOG INIPUT -----------
    var mVAIN0 = Math.round(analogRead(AIN0)*100000)/100;   // Temp raw voltage
    var mVAIN1 = Math.round(analogRead(AIN1)*100000)/100;   // Humid raw voltage
    var mVAIN2 = Math.round(analogRead(AIN2)*100000)/100;   // Light raw voltage
    var mVAIN3 = Math.round(analogRead(AIN3)*100000)/100;   // Ext raw voltage
    // console.log('AIN0['+ mVAIN0 +'(mV)] AIN1['+ mVAIN1 +'(mV)] AIN2['+ 
    //    mVAIN2 + '(mV)] AIN3['+ mVAIN3 + '(mV)]');    

    // CALCULATE DATA ------------------
    var valTEMP  = Math.round(((mVAIN0*2 - 550)/10)*10)/10; // TEMP  (V-0.55)*100
    var valHUMID = Math.round(((mVAIN1*2 - 450)/20)*10)/10; // HUMID (V-0.45)*50
    var valLIGHT = Math.round(((mVAIN2*2)/96)*10)/10;       // LIGHT 96mV/(uW/cm2)
    var valEXT   = mVAIN3*2;    // EXT
    console.log('Temp['+ valTEMP +'(C)] Humid['+ valHUMID +'(%)] Light['+ 
        valLIGHT + '(uW/cm2)] Ext['+ valEXT + '(mV)]'); 

    // DATA ORGANIZE (to csv) -------------------
    dataArray[0] = "[0]," + "Name = " + myname + ",Photocoupler = " + Photocoupler + ",";    
    dataArray[1] = "[1]," +  title;
    dataArray[dataAp] = "[" + dataAp + "]," + date + "," + mVAIN0 + "," + 
        mVAIN1 + "," + mVAIN2 + "," + mVAIN3 + ",";
    var data = dataArray[0] + "\r\n" + dataArray[1] + "\r\n";   // Data Header lines
    var ii = dataAp;                                            // Ring Buffer Pointer
    for(var i = 2; i < NofM; i++){                              // Reorder Buffers
        ii++;  if(ii > NofM - 1) { ii = 2; }    
        data = data + dataArray[ii] + "\r\n";  
    }
    console.log(data);
    dataAp++;  if(dataAp > NofM - 1) { dataAp = 2; }            // data store pointer increment

    // DISP DATA --------------------------
    var htmldata = '<html><head><title>sw disp</title><meta http-equiv="refresh" content="5"></head>' +
    '<body bgcolor="pink">' + '<p><center><B><font size="32" color="blue">' + 
    'SW:' + DIP4bit + '</br>Temp:' + valTEMP + '(C)' + '</br>Humid:' + valHUMID + '(%)' +
    '</br>Light:' + valLIGHT + '(uW)' + '</br>Voltage:' + valEXT + '(mV)<br>' +
    '<a href="http://www.choimoni.net/udata/bone001/mdata.csv">csv data</a>' +
    '</font></B></center></p></body></html>';
    // console.log(htmldata);

    // Hairetsu Regen --------------------------
    var d = data.split("\r\n");     // gyo bunkatsu   
    var dsu = d.length - 1;         // Number of gyo

    var td = d[1].split(",");       // title bunkatsu
    var tdsu = td.length - 1;       // Number of Komoku
    console.log('gyosuu = ' + dsu + ' / number of items ' + tdsu);

    var item = new Array(tdsu);     // koumoku lines
    for(var it = 0; it < tdsu; it++){  item[it] = '';    }    // Reset
    for(var tdi = 0; tdi < tdsu; tdi++){    // item number  
        //----------------------------------// gyosuu bun data nukidashi
        for(var di = 2; di < dsu; di++){
            var buf = d[di].split(",");
            item[tdi] = item[tdi] + buf[tdi] + ',';  
        }  
        //---------------------------------- 
    }
    for(var ti = 0; ti < tdsu; ti++){
        // console.log('out(' + ti + ')' + item[ti]);
    }    
    
    // HTTP PUT SENSOR DATA --------------------
    var fs = require('fs');    
    //fs.writeFileSync('bonelog2.csv', data);                   // Write Measurement data      
    var http = require('http'), url = require('url'), util = require('util');
    var urlStr;
        urlStr = 'http://www.choimoni.net/udata/bone001/mdata.csv';     // Store Data
        urlStr = 'http://www.choimoni.net/udata/bone001/mdata.html';    // Html data
        urlStr = 'http://www.choimoni.net/udata/bone001/policy.csv';    // Policy data
    var u = url.parse(urlStr);                                  //console.log(u);     
    var client = http.createClient(u.port || 80, u.hostname);   //console.log(client);

    // var request = client.request('GET', u.pathname, { host: u.hostname });@  // for GET(1/1)
    // var request = client.request('PUT', u.pathname, { host: u.hostname });    // for PUT(1/2)
    // var wrequest = request.write(htmldata, encoding='utf8');                  // for PUT(2/2)
    // request.end();                          //console.log(request);

    // HTTP GET POLICY FILE --------------------
    var pdata = fs.readFileSync('policy.csv', encoding='utf-8');    // Read Policy data
    // console.log('policy data [' + "\r\n" + pdata + ']');             // Policy data display


    // HANDLE HTTP RESPONSE --------------------
    // request.on('response', function(response){  console.log(response.statusCode);
    @// for(var i in response.headers){           //console.log(i + ": " + response.headers[i]);
      // }
      // response.setEncoding('utf8');
      // response.on('data', function(chunk){
         // util.print(chunk);
      // });
      // response.on('end', function(){            //console.log('');
      // });
    // });

    // HANDLE CONTROL POLICY --------------------------------
    var LA  = pdata.split("\n");
    var LL  = LA[0].split(",");
    var PO  = {"mode":LL[0],"rate":LL[1],"type":LL[2],"onval":LL[3],"oncond":LL[4],
        "offval":LL[5],"offcond":LL[6]};
    console.log("mode[" + PO.mode + "] rate[" + PO.rate + "(s)] type[" + PO.type +
        "] onval[" + PO.onval + "] oncond[" + PO.oncond + 
        "] offval[" + PO.offval + "] offcond[" + PO.offcond +  "]");
    // mode,rate,item,on valu,on condition,off value,off condition
    // Auto,10,node1,60,<,20,<,
    // OUTPUT CONTROL ------------------
    // select Source
    var testval = 0;
    switch(PO.type) {   // load value for evaluation
        case 'Temp':  testval = valTEMP;  break;
        case 'Humid': testval = valHUMID; break;
        case 'Light': testval = valLIGHT; break;
        default: testval = valEXT; 
    }
    console.log('Type ' + PO.type + ' /testval ' + testval);
    // 'OFF'2 345 6'ON' 
    // ON condition Check --------
    if(PO.oncond == '>') {if(testval > PO.onval ) {if(HysBar < 6) { HysBar++; }}}
    else                 {if(testval < PO.onval ) {if(HysBar < 6) { HysBar++; }}}
    // OFF condition Check -------
    if(PO.offcond== '>') {if(testval > PO.offval) {if(HysBar > 2) { HysBar--; }}}
    else                 {if(testval < PO.offval) {if(HysBar > 2) { HysBar--; }}}    
    console.log('HysBar=' + HysBar);

    if (HysBar == 6) {Photocoupler = 1;}    // ON!!!
    if (HysBar == 2) {Photocoupler = 0;}    // OFF!!!
    digitalWrite(PSWout, Photocoupler);     // Photocoupler ON/OFF
    if(Photocoupler < 1) {  console.log('Photocoupler[' + 'OFF' + ']');    }
    else {                  console.log('Photocoupler[' + 'ON ' + ']');    }

    // DISPLAY CONTROL --------------------    
    digitalWrite(ActLED, HIGH);                 // ActLed Init "On"     
    if(mode == 1) {
      digitalWrite(UsrLED1, HIGH); delay(1500); // LED1 blink 
      digitalWrite(UsrLED1, LOW);  delay(1500);
    }
    if(mode == 2) {
      digitalWrite(UsrLED2, HIGH); delay(1000); // LED2 blink 
      digitalWrite(UsrLED2, LOW);  delay(1000);
    }
    if(mode == 3) {
      digitalWrite(UsrLED3, HIGH);  delay(500); // LED3 blink 
      digitalWrite(UsrLED3, LOW);   delay(500);
    }
    digitalWrite(ActLED, LOW);                  // ActLed Init "Off"          
    
};

bb.run();
