const mongoose = require("mongoose");
const User = require("./User");
const schema = mongoose.Schema;

const listingSchema = new schema({
  title: {
    type: String,
    require: true,
  },
  description: String,
  image: {
    url: {
      type: String,

      default: "https://unsplash.com/photos/people-on-beach-during-daytime-eSRtxPd9q1c",
      // set:(v)=>
      //     v===""? "https://unsplash.com/photos/people-on-beach-during-daytime-eSRtxPd9q1c"
      // : v,
    }
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: schema.Types.ObjectId,
      ref: "Review"


    }
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
