const mongoose = require('mongoose')
const { Schema } = mongoose;

const citySchema = new mongoose.Schema({
  cityName:{
    type:String,
    required:true,
    unique : true,
  },
  cityCirclesId:[{ type: Schema.Types.ObjectId, ref: 'circles' }],
  cityAlertsId:[{ type: Schema.Types.ObjectId, ref: 'alerts' }],
  cityEventsId:[{ type: Schema.Types.ObjectId, ref: 'events' }],
})

const cities = mongoose.model("cities",citySchema)
module.exports=cities
