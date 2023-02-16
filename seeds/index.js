
const mongoose=require('mongoose');
const campground = require('../models/campground');
const Campground=require('../models/campground');
const cities=require('./cities');
const {places, descriptors}=require('./seedHelpers');

mongoose.set('strictQuery', false);

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
  
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const db=mongoose.connection;
db.on('error',console.error.bind(console, 'connection error: '));
db.once('open',()=>{
  console.log('Database Connected!');
})

const sample= array => array[Math.floor(Math.random()*array.length)];

const seedDB=async()=>{
    await Campground.deleteMany({});
    for(let i=0;i<50;i++){
        const rand1000=Math.floor(Math.random()*1000);
        const camp=new Campground({
            location:`${cities[rand1000].city}, ${cities[rand1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`
    });

        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
});