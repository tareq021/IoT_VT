const mqtt = require('mqtt');
var broker = 'mqtt://test.mosquitto.org';
//var broker='mqtt://broker.hivemq.com';
const client = mqtt.connect(broker);

var sensorData = "";
var dataToDb = ""

// MQTT Subscribe
client.subscribe('GPSData')

client.on('message', function (topic, dataFromSensor) {

    sensorData = JSON.parse(dataFromSensor);
    dataToDb = processData(sensorData);
    console.log(JSON.stringify(dataToDb, null, 2));
    // console.log(JSON.stringify(sensorData, null, 2));
    // console.log(JSON.stringify(sensorData, null, 2));
});

function processData(sensorData) {

    var finalData = {

            "deviceID": sensorData.GPGGA.sensorId,
            "deviceTime": sensorData.GPGGA.time,
            "deviceDate": sensorData.GPGGA.date,
            "latitude": sensorData.GPGGA.latitude,
            "longitude": sensorData.GPGGA.longitude,
            "fix": sensorData.GPGGA.fix,
            "satellites": sensorData.GPGGA.satellites,
            "altitude": sensorData.GPGGA.altitude,
            "deviceSpeed": sensorData.GPRMC.speed,
            "devicecourse": sensorData.GPRMC.course,
            "deviceVariation": sensorData.GPRMC.variation,
    }
    return finalData;
}
