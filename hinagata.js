//-------------------------------------------------------------------
// 雛形
// アナログ端子の電圧値を出力します。
//-------------------------------------------------------------------
var bb = require('bonescript');

var AIN3 = bone.P9_38;                          // Analog pin3

setup = function() {
    var date = new Date();    
    console.log(date);    
    console.log('Start!!');                     // Start!
};

loop = function() {    
    var mVAIN3 = analogRead(AIN3)*2*1000;       // Amp(x1/2), V to mV 
        mVAIN3 = Math.round(mVAIN3*100)/100;    // xxxx.xx
    console.log('  ' + mVAIN3 + '(mV)');        // Display   
    
    //var serialPort = require("serialport").SerialPort;
    //var serial = new serialPort("/dev/ttyO1", { baudrate : 9600} );
    //serial.write("test");

    delay(200);                                 // Interval 200ms
};

bb.run();

