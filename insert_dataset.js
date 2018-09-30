const fs = require('fs');
var mongodb = require('mongodb');
const parse = require('csv-parse');

var MongoClient = mongodb.MongoClient;
// var parser = parse({delimiter: ','}, function(err, data){
//   console.log(data);
// });
// fs.createReadStream(__dirname+'/OP_DTL_OWNRSHP_PGYR2016_P06292018.csv').pipe(parser);
function insert_data(collection, callback) {
    var csvData = [];
    var i = 0
    fs.createReadStream(__dirname + '/OP_DTL_OWNRSHP_PGYR2016_P06292018.csv')
        .pipe(parse({ delimiter: ',' }))
        .on('data', function (csvrow) {
            var FirstName = csvrow[2];
            var LastName = csvrow[4];
            var MiddleName = csvrow[3];
            var address = csvrow[6] + "," + csvrow[7] + "," + csvrow[8] + "," + csvrow[9] + ","
                + csvrow[10] + "," + csvrow[11];
            console.log(++i);
            //do something with csvrow
            collection.insertOne({
                FirstName: FirstName.toLowerCase(),
                MiddleName: MiddleName.toLowerCase(),
                LastName: LastName.toLowerCase(),
                Address: address
            });
        })
        .on('end', function () {
            //do something wiht csvData
            callback();
        });
}

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
        insert_data(db.collection("Physician"), function() {
            client.close();
        })
        // console.log(db)


    }
});
