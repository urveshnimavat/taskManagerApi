const express = require('express');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
const jwt = require('jsonwebtoken');
// require('dotenv').config()
// const port = process.env.PORT
const key = require('../config/key');

const app = express();

app.use(express.json());
app.use(taskRouter);
app.use(userRouter);


app.listen(key.PORT, ()=>{
    console.log(`server is running on ${key.PORT}`);
})

