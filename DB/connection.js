const mongoose = require('mongoose')
const CONNECTIONSTRING  = process.env.CONNECTIONSTRING

mongoose.connect(CONNECTIONSTRING).then(()=>{
  console.log("MongoDB Atlas successfully connected to Steps Away Server");


}).catch((err)=>{
  console.log("mongodb connection failed!!!",err);
})
