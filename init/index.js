const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

Mongo_url = "mongodb://127.0.0.1:27017/wanderlust";
main().then(() => {
    console.log("Connect to DB");
}).catch(err => {
    console.log(err);
});


async function main() {
    mongoose.connect(Mongo_url);
};
const initDb = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({ ...obj, owner: "67337784af1d72859207c8a8" }));
    await Listing.insertMany(initData.data);

    console.log("data was initialized");


}
initDb();