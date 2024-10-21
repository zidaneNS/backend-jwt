require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const logger = require('./middlewares/logEvents');
const credentials = require('./middlewares/credentials');
const verifyJwt = require('./middlewares/verifyJwt');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 3000;

connectDB();

app.use(logger);

app.use(credentials);

app.use(cors(corsOptions));

app.use(express.urlencoded({extended: false}));

app.use(express.json());

app.use(cookieParser());

app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));

// this route will be protected by jwt
app.use('/api/user', verifyJwt, require('./routes/api/user'));

mongoose.connection.on('open', () => {
    console.log('db connected');
    app.listen(PORT, () => {
        console.log(`server listening at http://localhost:${PORT}`);
    });
});