/**
 * Server application - contains all server config and api endpoints
 *
 * @author Pim Meijer
 */
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const db = require("./utils/databaseHelper");
const cryptoHelper = require("./utils/cryptoHelper");
const corsConfig = require("./utils/corsConfigHelper");
const app = express();

//logger lib  - 'short' is basic logging info
app.use(morgan("short"));

//init mysql connectionpool
const connectionPool = db.init();

//parsing request bodies from json to javascript objects
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//CORS config - Cross Origin Requests
app.use(corsConfig);

// ------ ROUTES - add all api endpoints here ------
const httpOkCode = 200;
const badRequestCode = 400;
const authorizationErrCode = 401;

app.post("/user/login", (req, res) => {
    const username = req.body.username;

    //TODO: We shouldn't save a password unencrypted!! Improve this by using cryptoHelper :)
    const password = req.body.password;

    db.handleQuery(connectionPool, {
        query: "SELECT user_id, username, password FROM user WHERE username = ? AND password = ?",
        values: [username, password]
    }, (data) => {
        if (data.length === 1) {
            //return just the username for now, never send password back!
            res.status(httpOkCode).json({"username": data[0].username, "user_id": data[0].user_id});
        } else {
            //wrong username
            res.status(authorizationErrCode).json({reason: "Wrong username or password"});
        }

    }, (err) => res.status(badRequestCode).json({reason: err}));
});

//dummy data example - rooms
app.post("/room_example", (req, res) => {

    db.handleQuery(connectionPool, {
            query: "SELECT id, surface FROM room_example WHERE id = ?",
            values: [req.body.id]
        }, (data) => {
            //just give all data back as json
            res.status(httpOkCode).json(data);
        }, (err) => res.status(badRequestCode).json({reason: err})
    );

});

//Gebruiker toevoegen aan DB
app.post("/register", (req, res) => {

    db.handleQuery(connectionPool, {
            query: "INSERT INTO user(username, emailaddress, password) VALUES (?, ?, ?)",
            values: [req.body.username, req.body.emailaddress, req.body.password]
        }, (data) => {
            if(data.insertId) {
                res.status(httpOkCode).json({id: data.insertId});
            } else {
                res.status(badRequestCode).json({reason: "Something went wrong, no record inserted"})
            }
        }, (err) => res.status(badRequestCode).json({reason: err})
    );
});

//Contact toevoegen aan DB
app.post("/contact", (req, res) => {

    db.handleQuery(connectionPool, {
        query: "INSERT INTO contact(firstname, surname, address, emailaddress, phonenumber) VALUES (?, ?, ?, ?, ?)",
        values: [req.body.firstname, req.body.surname, req.body.address, req.body.emailaddress, req.body.phonenumber]
    }, (data) => {
            if(data.insertId) {
                res.status(httpOkCode).json({id: data.insertId});
            } else {
                res.status(badRequestCode).json({reason: "Something went wrong, no record inserted"})
            }
        }, (err) => res.status(badRequestCode).json({reason: err})
    );
});
// Groep toevoegen aan DB

app.post("/group", (req, res) => {
    db.handleQuery(connectionPool, {
        query: "INSERT INTO pad_bsc_8_dev.`group` (name, user_id) VALUES (?,?)",
        values: [req.body.name, req.body.user_id]
    }, (data) => {
            if (data.insertId) {
                res.status(httpOkCode).json({id: data.insertId});
            } else {
                res.status(badRequestCode).json({reason: "Something went wrong, no record inserted"})
            }
        }, (err) => res.status(badRequestCode).json({reason: err})
    );
    });






//------- END ROUTES -------

module.exports = app;

