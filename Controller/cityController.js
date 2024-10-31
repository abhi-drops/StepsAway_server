const cities = require('../Models/citySchema')

exports.addNewCity=async(req,res)=>{
  console.log('inside addNewCity function');
  const {cityName}=req.body;

  try {
    const existingCity = await cities.findOne({cityName})

    if (existingCity) {
      res.status(406).json("city already exist")
    }else{
      const newCity = new cities({
        cityName,
        cityCirclesId:[],
        cityAlertsId:[],
        cityEventsId:[],
      })
        await newCity.save()



        res.status(200).json(newCity)
    }

  } catch(err) {
    res.status(401).json(err)
  }

}

exports.searchCities = async (req, res) => {
  console.log('Inside searchCities function');
  const { cityName } = req.body;

  try {
    // Using regex for a partial match search (case-insensitive)
    const matchedCities = await cities.find(
      { cityName: { $regex: cityName, $options: 'i' } },
      { cityName: 1, _id: 1 }
    );

    res.status(200).json(matchedCities);
  } catch (err) {
    res.status(401).json({ error: "Error while searching for cities", details: err });
  }
};
