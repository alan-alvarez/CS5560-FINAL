// Set up
var express  = require('express');
var app      = express();                               // create our app w/ express
var mongoose = require('mongoose');                     // mongoose for mongodb
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var cors = require('cors');
 
// Configuration
mongoose.connect('mongodb://localhost/finalproject');
 
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());
app.use(cors());
 
app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});
 
// Models
var Share = mongoose.model('Share', {
    shareticker: String,
	sharenumbers: Number,
	sharebuyprice: Number,
	user: String
});


 
// Routes
 
    // Get shares
    app.get('/api/shares', function(req, res) {
 
        console.log("fetching shares");
 
        // use mongoose to get all shares in the database
        Share.find(function(err, shares) {
 
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)
 
            res.json(shares); // return all shares in JSON format
        });
    });
 
    // create share and send back all shares after creation
    app.post('/api/share', function(req, res) {
 
        console.log("creating share");
 
        // create a share, information comes from request from Ionic
        Share.create({
            shareticker : req.body.shareticker,
            sharenumbers : req.body.sharenumbers,
            sharebuyprice: req.body.sharebuyprice,
			user : '',
            done : false
        }, function(err, share) {
            if (err)
                res.send(err);
 
            // get and return all the shares after you create another
            Share.find(function(err, shares) {
                if (err)
                    res.send(err)
                res.json(shares);
            });
        });
 
    });
 
    // delete a share
    app.delete('/api/share/:share_id', function(req, res) {
        Share.remove({
            _id : req.params.share_id
        }, function(err, share) {
 
        });
    });
	
	// update a share
	app.put('/api/share/:share_id', function(req,res) {
        Share.findOneAndUpdate({
            _id : req.params.share_id
        }, function(err, share) {
 
        });
    });
	
	
	
	
	
	// get value of a share
	//this is used to grab current value of share via Alpha Vantage Stock API
    app.get('/api/share/value/:id', function(req, res) {
		//find one share object
		Share.findOne({ _id: req.params.id }, (err, item) => {
			if (err) { return console.error(err); }
			//if one was found, use API to get stock info 
			//item is share object 
			//used WEBSERVICES project as example from class 
			var json;
			var endpoint = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=' + item.shareticker + '&interval=1min&apikey=2FVBXO0JXXWQBUSV';
			var request = require("request");
			
			var metadata;
			var time;
			var stockinfo;
			var currentClosePrice;
			
			request.get(endpoint, (error, response, body) => {
				json = JSON.parse(body); //this is the entire response 
				metadata = json['Meta Data'];
				console.log('about to check share price for ' + item.shareticker + '...');
				if (metadata != null) {
					time = metadata['3. Last Refreshed'];
					stockinfo = json['Time Series (1min)'][time];
					currentClosePrice = stockinfo['4. close']; //closing price of stock i.e. latest price
					
					console.log('Current close value for ticker ' + item.shareticker + ': $' +currentClosePrice);
					res.status(200).json({ 'currentvalue':currentClosePrice }); //SPACE CHARACTERS MAKE A HUGE DIFFERENCE!!! 'currentvalue' != 'currentvalue '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
				}
				else { //error handling, the share does not exist 
					console.log("Share Ticker " + item.shareticker + " does not exist in API!");
					res.status(200).json(null); //return null if no entry exists
				}
				
				
			});
		});
	});
	
 
 
// listen (start app with node server.js) ======================================
app.listen(8080);
console.log("App listening on port 8080");