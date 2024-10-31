
// setup

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const router = require('./Router/router')
require('./DB/connection')
const Server = express()

//

Server.use(cors())
Server.use(express.json())
Server.use(router)
Server.use('/uploads',express.static('./uploads'))
const PORT = 3000


Server.listen(PORT,()=>{
  console.log(`Steps Away Server started running at PORT: ${PORT}`);

})

Server.get('/',(req,res)=>{
  res.status(200).send(`
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f0f0f0;">
      <h2 style="text-align: center; color: #138762;">
        Steps Away server started running & waiting for the client request!!!
      </h2>
    </div>
  `);
  })