const User=require('../models/user');

module.exports.renderRegister=(req,res)=>{
    res.render('users/register');
}

module.exports.createUser=async(req,res,next)=>{
    try{
        const {username,email,password}=req.body;
        let user=new User({email,username});
        user=await User.register(user,password);
        req.login(user,err=>{
            if(err) return next(err);
            req.flash('success','Welcome to Yelp Camp!');
            res.redirect('/campgrounds')
        })
    }
    catch(e){
        req.flash('error',e.message);
        res.redirect('/register');
    }
}

module.exports.renderLogin=(req,res)=>{
    res.render('users/login')
}

module.exports.login=(req,res)=>{
    const redirectUrl=req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    req.flash('success','Welcome back!');
    res.redirect(redirectUrl);
}

module.exports.logout=(req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.flash('success', "Goodbye!");
    res.redirect('/campgrounds');
  });
}