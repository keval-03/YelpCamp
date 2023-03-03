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
const mongoSanitize = require('express-mongo-sanitize');
const helmet=require('helmet');
const User=require('./models/user');
const MongoStore = require('connect-mongo');
// const dbUrl=process.env.DB_UR;
const dbUrl=process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';
const campgroundRoutes=require('./routes/campgrounds');
const reviewRoutes=require('./routes/reviews');
const usersRoutes=require('./routes/users');

//Mongoose Connect
mongoose.set('strictQuery', false);
main().catch(err => console.log(err));
async function main(){
  await mongoose.connect(dbUrl);
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
app.use(mongoSanitize());
app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
//This is the array that needs added to
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dvhjwcdsj/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    }),
    helmet.crossOriginEmbedderPolicy({
      policy: 'credentialless'
    })
);

//SESSION
const secret=process.env.SECRET || 'thisshouldbesecret!';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on('error',function(e){
  console.log('SESSION STORE ERROR',e)
})

const configureSession={
  store,
  name: 'session',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie:{
    httpOnly: true,
    // secure: true, cookies can be configured over https only
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

const port=process.env.PORT || 3000;
app.listen(port,()=> {
    console.log(`server running on port ${port}`);
});