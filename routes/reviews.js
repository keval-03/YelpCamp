const express=require('express');
const router=express.Router({mergeParams: true});

const Campground=require('../models/campground');
const Review=require('../models/review');

const expressErrors=require('../utilities/expressErrors');
const catchAsync=require('../utilities/catchAsync');

const {reviewSchema}=require('../schemas.js');

//VALIDATING MIDDLEWARES THAT USE JOI (SERVER SIDE VALIDATION)
const validateReview=(req,res,next)=>{
  const {error}=reviewSchema.validate(req.body);
  if(error){
    const mssg=error.details.map(el => el.message).join(',');
    console.log(mssg)
    throw new expressErrors(mssg,400);
  }
  else{
    next();
  }
}

//REVIEW TO A CAMPGROUND
router.post('/',validateReview,catchAsync(async(req,res)=>{
  const {id}=req.params;
  const campground=await Campground.findById(id);
  const review=new Review(req.body.review);
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash('success','Created new Review!!');
  res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId',catchAsync(async(req,res)=>{
  const {id,reviewId}=req.params;
  await Campground.findByIdAndUpdate(id,{$pull : {reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);
  req.flash('success','Deleted a review!!');
  res.redirect(`/campgrounds/${id}`);
}))

module.exports=router;