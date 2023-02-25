const express=require('express');
const router=express.Router();
const User=require('../models/user');
const catchAsync=require('../utilities/catchAsync');
const passport=require('passport');

router.get('/register',(req,res)=>{
    res.render('users/register');
})

router.post('/register',catchAsync(async(req,res,next)=>{
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
}));

router.get('/login',(req,res)=>{
    res.render('users/login')
})

router.post('/login',passport.authenticate('local',{failureFlash: true,failureRedirect: '/login',keepSessionInfo:true}),(req,res)=>{
    const redirectUrl=req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    req.flash('success','Welcome back!');
    res.redirect(redirectUrl);
})

router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.flash('success', "Goodbye!");
    res.redirect('/campgrounds');
  });
})

module.exports=router;