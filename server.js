const http = require('http')
const fs = require('fs')
const { parse } = require('querystring');

const server = http.createServer((req, res) => {
     
    if(req.method === 'GET' && req.url === '/add')
	{   
		res.writeHead(200, {'Content-Type' : 'text/html'});
		fs.readFile('./http-form.html', 'UTF-8', (err, data) => {
			if(err) throw err;
			res.write(data);
			res.end();
		});
    } 
    else if(req.method === 'POST')
    {  
        collectRequestData(req, result => {
            console.log(result.firstname);
            res.end(`Welcome ${result.firstname}`);
            var MongoClient = require('mongodb').MongoClient;
            var url = "mongodb://localhost:27017/";
            MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("basicdb");
            var myobj = { firstname: result.firstname, lastname: result.lastname, email: result.email};
            dbo.collection("registration").insertOne(myobj, function(err, res) {
                if (err) throw err;
                console.log("1 document inserted");
                db.close();
            });
            });
            });
        
    }
   else if(req.method === 'GET' && req.url === '/list')
	{ 
        var MongoClient = require('mongodb').MongoClient;
        var url = "mongodb://localhost:27017/";
        MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var data = {};
          var dbo = db.db("basicdb");
          dbo.collection("registration").find({}).toArray(function(err, content) {
            if (err) throw err;
            data = content;
            console.log(data);
            res.writeHead(200, {'Content-Type' : 'application/json'});
            res.end(JSON.stringify(data ));
            
            db.close();
          });
        }); 
         
		
    }  
    else if(req.method === 'GET' && req.url === '/listing')
	{ 
        res.writeHead(200, {'Content-Type' : 'text/html'});
		fs.readFile('./index.html', 'UTF-8', (err, data) => {
			if(err) throw err;
			res.write(data);
			res.end();
		}); 
    }
    else if(req.method === 'GET' && req.url.match(/\/update\/id\/\w+/))

	{ 
        const id = req.url.split('/')[3]
        const fname = req.url.split('/')[4]
        const lname = req.url.split('/')[5]
        const email = req.url.split('/')[6]
        var MongoClient = require('mongodb').MongoClient;
        var url = "mongodb://127.0.0.1:27017/";

        MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("basicdb");
        var myquery = { email:email };
        var newvalues = { $set: {firstname: fname, lastname: lname,email:email } };
        dbo.collection("registration").updateOne(myquery, newvalues, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
            db.close();
        });
        });
    }
        
    else if(req.method === 'GET' && req.url.match(/\/delete\/id\/\w+/))

	{ 
        const id = req.url.split('/')[3]
        var MongoClient = require('mongodb').MongoClient;
        var url = "mongodb://localhost:27017/";

        MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("basicdb");
        var myquery = {email: id };
        dbo.collection("registration").deleteOne(myquery, function(err, obj) {
            if (err) throw err;
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ message: "delete sucessfully" }))
            console.log("1 document deleted");
            db.close();
        });
        });
    }
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'Routes Not Found' }))
    }
})
function collectRequestData(request, callback) {
    const FORM_URLENCODED = 'application/x-www-form-urlencoded';
    if(request.headers['content-type'] === FORM_URLENCODED) {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            callback(parse(body));
        });
    }
    else {
        callback(null);
    }
}
const PORT =  process.env.PORT || 5000

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

module.exports = server;
