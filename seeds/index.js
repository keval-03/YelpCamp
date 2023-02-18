const axios=require('axios');
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

async function seedImg() {
  try {
    const resp = await axios.get('https://api.unsplash.com/photos/random', {
      params: {
        client_id: '3kalQtJo6jMNJaHa-OK1oEeRuCmpVB63wX-YxBG8taU',
        collections: 1114848,
      },
    })
    return resp.data.urls.small
  } catch (err) {
    console.error(err)
  }
}

const seedDB=async()=>{
    await Campground.deleteMany({});
    for(let i=0;i<3;i++){
        const rand1000=Math.floor(Math.random()*1000);
        const price=Math.floor(Math.random()*20)+10;
        const camp=new Campground({
            location:`${cities[rand1000].city}, ${cities[rand1000].state}`,
            image: await seedImg(),
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price
    });

      await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
});