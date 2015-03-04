/**
 * Created by zhangjun on 2015/3/4.
 */
var express = require('express');
var orm = require('orm');
var app = express();
var opts = {
    host: '115.28.26.220',
    port: '3306',
    user: 'blobby',
    protocol: "mysql",
    password: '57umtSMG4Fyv5ary',
    database: 'blob_vault',
    query: {
        pool: true
    }
};
app.use(orm.express(opts, {
    define: function (db, models, next) {
        models.person = db.define('person', {
            id: {type: 'text'},
            name: {type: 'text'}
        });
        db.sync();
        next();
    }
}));
app.listen(8080);

app.get("/", function (req, res) {
    // req.models is a reference to models used above in define()
    req.models.person.find({}, function (err, data) {
        if (err) throw err;
        res.send(JSON.stringify(data));
    });
});
app.get("/insert", function (req, res) {
    var create = {
        id: Math.floor(Math.random() * 99999),
        name: "test" + Math.floor(Math.random() * 99999)
    };
    req.models.person.create(create, function (err, results) {
        if (err) res.send(err) ;
        res.send('insert ok');
    })
});
app.get("/update",function(req,res){
    var update = {
        name: "test" + Math.floor(Math.random() * 99999)
    };
    req.models.person.find({id:79099},function(err,data){
        if (err) res.send(err) ;
        data[0].name = update.name;
        data[0].save(function (err) {
            if(err)res.send(err) ;
            res.send('update ok');
        });
    })
});