const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const Review=require('./review')
const User=require('./user');

const imageSchema=new Schema({
    url:String,
    filename: String
});

imageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200');
});

// Can be used to display image of equal sizes in show.ejs
// imageSchema.virtual('cardImage').get(function() {   
//     return this. url.replace('/upload', '/upload/ar_4:3,c_crop'); 
// });

const CampgroundSchema=new Schema({
    title: String,
    images: [imageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

CampgroundSchema.post('findOneAndDelete',async function(doc){
    if(doc){
        await Review.deleteMany({
            _id: {$in: doc.reviews}
        })
    }
})

module.exports=mongoose.model('Campground',CampgroundSchema);