const express = require('express')
const path = require("path");
const mongodb = require('mongodb')
const fs = require('fs');
const parse = require('csv-parse');
const bodyParser = require('body-parser');
var request = require('request');

const app = express()
const port = 3000;

var MongoClient = mongodb.MongoClient;
// app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.get('/', (req, res) => res.sendFile(__dirname + '/home.html'))
app.post('/getcoordinates', get_coordinates)
app.listen(port, () => console.log(`Example app listening on port ${port}!`))


//-----connection to database-------


function get_coordinates(req, res) {
    //console.log(req.params);
    var f_name = req.body.firstname.toLowerCase();
    console.log(f_name);
    var l_name = req.body.lastname.toLowerCase();
    var m_name = req.body.middlename.toLowerCase();
    console.log(m_name + " " + l_name + " " + f_name);
    get_address(f_name, m_name, l_name, (coordinates) => res.send(coordinates));
}

function get_address(f_name, m_name, l_name, callback) {
    // -----connection to database-------
    MongoClient.connect("mongodb://ds215563.mlab.com:15563/interndb_2016", {
        auth: {
            user: 'intern_task',
            password: 'task123',
        },
        useNewUrlParser: true
    }, function (err, client) {
        if (err != null)
            console.log(err)
        else {
            var db = client.db('interndb_2016')
            // console.log(db)
            const cursor = db.collection("Physician").find(
                { FirstName: f_name, LastName: l_name, MiddleName: m_name },
                { Address: 1 }
            );
            cursor.count(function(err, count) {
                if (count == 0)
                    callback("address_not_found");
                else {
                    cursor.next(function (err, object) {
                        if (err != null) {
                            console.log(err);
                        } else {
                            call_googleapi(object.Address, callback)
                        }
                    });
                }
                client.close();
            })
            
        }
    });
}


// Lets do things async only
function call_googleapi(address, callback) {
    var coordinate;
    request('https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=AIzaSyDZnR7RjvshSGjPLTh78Tql2IQRVJHUgnc', function (error, response, body) {
        // console.log('error:', error); // Print the error if one occurred
        // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the HTML for the Google homepage.
        var data = JSON.parse(body);
        coordinate = data.results[0].geometry.location;

        callback(coordinate);
    });
}