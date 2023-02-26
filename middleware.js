const {campgroundSchema,reviewSchema}=require('./schemas');
const Campground=require('./models/campground');
const Review=require('./models/review');
const expressErrors=require('./utilities/expressErrors');

module.exports.isLoggedIn=(req,res,next)=>{
  const {id}=req.params;
  if(!req.isAuthenticated()){
      req.session.returnTo=(req.query._method==='DELETE' ? `/campgrounds/${id}` : req.originalUrl);
      // console.log(req.originalUrl);
      req.flash('error','You must be Signed In!');
      return res.redirect('/login');
  }
  next();
}

//VALIDATING MIDDLEWARES THAT USE JOI (SERVER SIDE VALIDATION)
module.exports.validateCampground=(req,res,next)=>{
  const {error}=campgroundSchema.validate(req.body);
  if(error){
    const mssg=error.details.map(el => el.message).join(',');
    throw new expressErrors(mssg,400);
  }
  else{
    next();
  }
}

module.exports.isAuthor=async(req,res,next)=>{
  const {id}=req.params;
  let campground=await Campground.findById(id);
  if(!campground.author.equals(req.user._id)){
    req.flash('error','Only author can edit!');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}

//VALIDATING MIDDLEWARES THAT USE JOI (SERVER SIDE VALIDATION)
module.exports.validateReview=(req,res,next)=>{
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

module.exports.isReviewAuthor=async(req,res,next)=>{
  const {id,reviewId}=req.params;
  let review=await Review.findById(reviewId);
  if(!review.author.equals(req.user._id)){
    req.flash('error','Only author can edit!');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}