$(document).ready(function() {
    getSensorData();
});

function getSensorData() {

    $.ajax({
        url: 'https://api.mlab.com/api/1/databases/vt/collections/gpsdatas?apiKey=JmS3cz8gYVCSSQvWP2_nvof67mndnJov'
    }).done(function(data) {
        var output = "";
        $.each(data, function(key, data) {
            output += '<tr>';
            output += '<td>' + data.deviceID + '</td>';
            output += '<td>' + data.deviceDate + '</td>';
            output += '<td>' + data.deviceTime + '</td>';
            output += '<td>' + data.receiveDate + '</td>';
            output += '<td>' + data.receiveTime + '</td>';
            output += '<td>' + data.latitude + '</td>';
            output += '<td>' + data.longitude + '</td>';
            output += '<td>' + data.fix + '</td>';
            output += '<td>' + data.satellites + '</td>';
            output += '<td>' + data.altitude + '</td>';
            output += '<td>' + data.deviceSpeed + '</td>';
            output += '<td>' + data.devicecourse + '</td>';
            output += '<td>' + data.deviceVariation + '</td>';
            output += '</tr>';
        });
        $('#sensordata').html(output);
    });
}