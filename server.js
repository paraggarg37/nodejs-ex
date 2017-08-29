//  OpenShift sample Node application
var express = require('express'),
    fs = require('fs'),
    app = express(),
    eps = require('ejs'),
    morgan = require('morgan');
var url = require('url');
var cors = require('cors')
var shopifyHelper = require("./app/shopify_helper");

Object.assign = require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))
app.use(express.static('public'));
app.use(cors())

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
    var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
        mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
        mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
        mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
        mongoPassword = process.env[mongoServiceName + '_PASSWORD']
    mongoUser = process.env[mongoServiceName + '_USER'];

    if (mongoHost && mongoPort && mongoDatabase) {
        mongoURLLabel = mongoURL = 'mongodb://';
        if (mongoUser && mongoPassword) {
            mongoURL += mongoUser + ':' + mongoPassword + '@';
        }
        // Provide UI label that excludes user id and pw
        mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
        mongoURL += mongoHost + ':' + mongoPort + '/' + mongoDatabase;

    }
} else {
    mongoURL = 'mongodb://localhost:27017/purrx';
}
var db = null,
    dbDetails = new Object();

var initDb = function (callback) {
    if (mongoURL == null) return;

    var mongodb = require('mongodb');
    if (mongodb == null) return;

    mongodb.connect(mongoURL, function (err, conn) {
        if (err) {
            callback(err);
            return;
        }

        db = conn;
        dbDetails.databaseName = db.databaseName;
        dbDetails.url = mongoURLLabel;
        dbDetails.type = 'MongoDB';

        shopifyHelper.init(db);
        console.log('Connected to MongoDB at: %s', mongoURL);
    });
};


/*app.get('/', function (req, res) {
 // try to initialize the db on every request if it's not already
 // initialized.
 if (!db) {
 initDb(function(err){});
 }
 if (db) {
 var col = db.collection('counts');
 // Create a document with request IP and current time of request
 col.insert({ip: req.ip, date: Date.now()});
 col.count(function(err, count){
 res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
 });
 } else {
 res.render('index.html', { pageCountMessage : null});
 }
 });*/

app.get('/pagecount', function (req, res) {
    // try to initialize the db on every request if it's not already
    // initialized.
    if (!db) {
        initDb(function (err) {
        });
    }
    if (db) {
        db.collection('counts').count(function (err, count) {
            res.send('{ pageCount: ' + count + '}');
        });
    } else {
        res.send('{ pageCount: -1 }');
    }
});

app.get("/getUrl", function (req, res) {
    var name = req.param('name');
    res.send({"url": shopifyHelper.getUrl(name)});
})

app.get("/shopify_redirect", function (req, res) {
    var code = req.param('code');
    var shop = req.param('shop');
    shop = shopifyHelper.getName(shop);
    shopifyHelper.saveAccessToken(code, shop, shopifyHelper.getCallback(function () {
        res.redirect('/#/home/' + shop)
    }, function () {
        res.redirect('/');
    }));

});

app.get('/shop/categories', function (req, res) {
    console.log("called categories");
    shopifyHelper.getCategoriesTemplate(shopifyHelper.getCallback(function (data) {
        res.writeHead(200, {'Content-Type': 'application/liquid'});
        res.end(data);
    }, function (err) {
        res.send(err);
    }))
})

app.get('/token/:name', function (req, res) {
    db.collection("shops").findOne({"shop":req.params.name},{},function (err,result) {
        if(result == null){
            res.send("null");
        }else{
            res.send(re)
        }
    })
})

app.get("/shop/:name/categories", function (req, res) {
    var name = req.params.name;
    console.log("getting categories for " + name);
    shopifyHelper.getCategories(name, shopifyHelper.getCallback(function (data) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(data);
    }, function (err) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(err);
    }))
})


app.get('/shop/:name/proxy/:href(*)', function (req, res) {
    var query = "";
    var url_parts = req.url.split("?");
    if (url_parts.length > 1) {
        query = "?" + url_parts[1];
    }

    var path = "/" + req.params.href + query;
    var name = req.params.name;


    console.log(path);
    shopifyHelper.proxyGet(name, path, shopifyHelper.getCallback(function (data) {
        res.send(data);
    }, function (err) {
        res.send(err);
    }));

});

app.get("/shop/:name", function (req, res) {

    console.log("shop name " + req.params.name);
    shopifyHelper.getShopData(req.params.name, shopifyHelper.getCallback(function (data) {
        res.send(data);
    }, function (err) {
        res.send(err);
    }))
})


// error handling
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something bad happened!');
});

initDb(function (err) {
    console.log('Error connecting to Mongo. Message:\n' + err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app;
