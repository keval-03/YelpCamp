if(process.env.NODE_ENV!=="production"){
    require('dotenv').config();
}

const express=require('express');
const mongoose=require('mongoose');
const session=require('express-session')
const ejsMate=require('ejs-mate');
const methodOverride=require('method-override');
const expressErrors=require('./utilities/expressErrors');
const flash=require('connect-flash');
const passport=require('passport');
const localStrategy=require('passport-local');

const User=require('./models/user');

const campgroundRoutes=require('./routes/campgrounds');
const reviewRoutes=require('./routes/reviews');
const usersRoutes=require('./routes/users');

mongoose.set('strictQuery', false);
main().catch(err => console.log(err));
async function main(){
  await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
const db=mongoose.connection;
db.on('error',console.error.bind(console, 'connection error: '));
db.once('open',()=>{
  console.log('Database Connected!');
});

const app=express();
const path=require('path');

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,'public')))
app.use(flash());

//SESSION
const configureSession={
  secret: 'thisshouldbesecret!',
  resave: false,
  saveUninitialized: true,
  cookie:{
    expires: Date.now()+(1000*60*60*24*7),
    maxAge: 1000*60*60*24*7
  }
}
app.use(session(configureSession));

//PASSPORT
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//LOCALS
app.use((req,res,next)=>{
  res.locals.currentUser=req.user;
  res.locals.success=req.flash('success');
  res.locals.error=req.flash('error');
  next();
});

//ROUTES
app.use('/',usersRoutes);
app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes);

app.get('/',(req,res)=>{
    res.render('home')
})

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