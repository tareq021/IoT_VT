var http = require("http");
const express = require("express");
const MongoClient = require("mongodb").MongoClient;
// const mongoose = require('mongoose');

var str = "";
var url = 'mongodb://vtdata:vtdata@ds147069.mlab.com:47069/vt';
var app = express();

app.get("/getData", function (req, res) {
    //Database operation starts here
    MongoClient.connect(url, function (err, dataBase) {

        var cursorpoint = dataBase.collection("gpsdatas").find();

        cursorpoint.each(function (err, item) {

            if (item != null) {
                // str = JSON.stringify(item);
                str = JSON.stringify(item);
                // console.log(str);
            }
        });
        console.log(str);
    });
})

var server = app.listen(3000, function () { })