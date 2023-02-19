const express=require('express');
const mongoose=require('mongoose');
const Campground=require('./models/campground');
const ejsMate=require('ejs-mate');
const methodOverride=require('method-override');
const expressErrors=require('./utilities/expressErrors');
const catchAsync=require('./utilities/catchAsync');
const {campgroundSchema}=require('./schemas');

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

const app=express();
const path=require('path');

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))

const validateCampground=(req,res,next)=>{
  const {error}=campgroundSchema.validate(req.body);
  if(error){
    const mssg=error.details.map(el => el.message).join(',');
    throw new expressErrors(mssg,400);
  }
  else{
    next();
  }
}

app.get('/',(req,res)=>{
    res.render('home')
})

app.get('/campgrounds',catchAsync(async (req,res)=>{
  const campgrounds=await Campground.find({});
  res.render('campgrounds/index',{campgrounds});
}));

app.get('/campgrounds/new',(req,res)=>{
  res.render('campgrounds/new');
})

app.post('/campgrounds',validateCampground,catchAsync(async (req,res,next)=>{
  // if(!req.body.campground) throw new expressErrors('INVALID DATA',500);

  const campground=new Campground(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
}))

app.put('/campgrounds/:id',validateCampground,catchAsync(async (req,res)=>{
  const {id}=req.params;
  const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground});
  res.redirect(`/campgrounds/${campground._id}`);
}))

app.get('/campgrounds/:id',catchAsync(async (req,res)=>{
  const {id}=req.params;
  const camp=await Campground.findById(id);
  res.render('campgrounds/show',{camp});
}));

app.get('/campgrounds/:id/edit',catchAsync(async(req,res)=>{
  const camp=await Campground.findById(req.params.id);
  res.render('campgrounds/edit',{camp});
}));

app.delete('/campgrounds/:id',catchAsync(async(req,res)=>{
  const {id}=req.params;
  const camp=await Campground.findByIdAndDelete(id);
  res.redirect('/campgrounds');
}));

app.all('*',(req,res,next)=>{
  next(new expressErrors('Page not Found!!',404))
})

app.use((err,req,res,next)=>{
  const {status=500}=err;
  if(!err.message) err.message='Something Went Wrong!!';
  res.status(status).render('error',{err});
  // res.send('ERROR!!');
})

app.listen(3000,()=> {
    console.log('LISTENING TO PORT 3000!!');
});