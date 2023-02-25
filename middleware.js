module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo=req.originalUrl;
        console.log(req.originalUrl);
        req.flash('error','You must be Signed In!');
        return res.redirect('/login');
  }
  next();
}
