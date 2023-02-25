const express=require('express');
const router=express.Router();

const Campground=require('../models/campground');

const expressErrors=require('../utilities/expressErrors');
const catchAsync=require('../utilities/catchAsync');

const {campgroundSchema}=require('../schemas');
const {isLoggedIn}=require('../middleware');

//VALIDATING MIDDLEWARES THAT USE JOI (SERVER SIDE VALIDATION)
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

router.get('/',catchAsync(async (req,res)=>{
  const campgrounds=await Campground.find({});
  res.render('campgrounds/index',{campgrounds});
}));

router.get('/new',isLoggedIn,(req,res)=>{
  
  res.render('campgrounds/new');
})

router.get('/:id',isLoggedIn,catchAsync(async (req,res)=>{
  const {id}=req.params;
  const camp=await Campground.findById(id).populate('reviews');
  if(!camp){
    req.flash('error','Campground not found!');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/show',{camp});
}));

router.post('/',isLoggedIn,validateCampground,catchAsync(async (req,res,next)=>{
  // if(!req.body.campground) throw new expressErrors('INVALID DATA',500);

  const campground=new Campground(req.body.campground);
  await campground.save();
  req.flash('success','Successfully made a new campground!!');
  res.redirect(`/campgrounds/${campground._id}`);
}))

router.get('/:id/edit',isLoggedIn,catchAsync(async(req,res)=>{
  const camp=await Campground.findById(req.params.id);
  if(!camp){
    req.flash('error','Campground not found!');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/edit',{camp});
}));

router.put('/:id',isLoggedIn,validateCampground,catchAsync(async (req,res)=>{
  const {id}=req.params;
  const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground});
  req.flash('success','Successfully updated campground!!');
  res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:id',isLoggedIn,catchAsync(async(req,res)=>{
  const {id}=req.params;
  const camp=await Campground.findByIdAndDelete(id);
  req.flash('success','Successfully deleted campground!!');
  res.redirect('/campgrounds');
}));

module.exports=router;