/**
 * Created by zhangjun on 2015/3/4.
 */
var express = require('express');
var orm = require('orm');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var mysql = require('mysql');
var app = express();
var client = mysql.createPool({
    user: 'blobby',
    password: '57umtSMG4Fyv5ary',
    port: 3306,
    host:'115.28.26.220',
    database: 'blob_vault'
});
if(cluster.isMaster){
    for(var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
}else{
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
    app.listen(8081);

    app.get("/", function (req, res) {
        // req.models is a reference to models used above in define()
        req.models.person.find({id:Math.floor(Math.random() * 99999)}).limit(1).run(function(err,data){
            if (err) {
                res.send(err) ;
            }else{
                res.send(JSON.stringify(data));
            }
        })
    });
    app.get("/insert", function (req, res) {
        var create = {
            id: Math.floor(Math.random() * 99999),
            name: "test" + Math.floor(Math.random() * 99999)
        };
        req.models.person.create(create, function (err, results) {
            if (err) {
                res.send(err) ;
            }else{
                res.send('insert ok');
            }
        })
    });
    app.get("/insertTest", function (req, res) {
    var i = 0;
        function insert(id){
            if(id>=100000){
                res.send('insert ok');
                return;
            }
            var name= "test" + Math.floor(Math.random() * 99999);
            var sql = "insert into person(id,name) values ("+id+",'"+name+"');";
            client.query(sql,function(err,result){
                if (err) {
                    res.send(err) ;
                }else{
                    i++;
                    insert(i);
                }
            })
        }
        insert(i);
    });

    app.get("/update",function(req,res){
        var update = {
            name: "test" + Math.floor(Math.random() * 99999)
        };
        req.models.person.find({id:Math.floor(Math.random() * 10000)},function(err,data){
            if (err) res.send(err) ;
            //if(data.length=0 || typeof data[0].name ==='undefined'){
            //    console.log(data);
            //    res.send('update ok');
            //}else{
                data[0].name = update.name;
                data[0].save(function (err) {
                    if(err){
                        res.send(err) ;
                    }else{
                        res.send('update ok');
                    }
                });
            //}
        })
    });
    app.get('/mysql',function(req,res){
        var sql = "select * from person where id = "+Math.floor(Math.random() * 99999)+" limit 1;";
        client.query(sql,function(err,result){
            if (err) {
                res.send(err) ;
            }else{
                res.send(JSON.stringify(result));
            }
        })
    });
    app.get('/mysqlInsert',function(req,res){
        var name = "test" + Math.floor(Math.random() * 99999);
        var sql = "insert into person(id,name) values ("+Math.floor(Math.random() * 99999)+",'"+name+"');";
        client.query(sql,function(err,result){
            if (err) {
                res.send(err) ;
            }else{
                res.send('insert ok');
            }
        })
    })
    app.get('/mysqlUpdate',function(req,res){
        var name = "test" + Math.floor(Math.random() * 99999);
        var sql = "update person set name = '"+name+"' where id = "+Math.floor(Math.random() * 10000)+";";
        client.query(sql,function(err,result){
            if (err) {
                res.send(err) ;
            }else{
                res.send('update ok');
            }
        })
    })
}

