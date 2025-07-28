const mongoose = require('mongoose');
const mongoURI = "mongodb+srv://admin:admin@db.9olmd9z.mongodb.net/?retryWrites=true&w=majority&appName=db"

const connectToMongo = () => {
    mongoose.connect(mongoURI).then(()=>{console.log("Connected to MongoDB succesfully.");
    }).catch((e)=>{console.log(e.message);
    })
}

module.exports = connectToMongo;