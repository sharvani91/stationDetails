const connectToMongo = require('./db')
const express = require('express');
const cors = require('cors');
// const multer = require('multer');
const path = require('path');
const stationRoutes = require('./routes/stationRoutes');
const zoneRoutes = require('./routes/zoneRoutes');


const app = express()
const PORT = 5000

connectToMongo();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/stations', stationRoutes);
app.use('/api/zones', zoneRoutes);

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/stationMaps')
//     },
//     filename: (req, file, cb) => {
//         cb(null,file.fieldname + "_" + Date.now()+path.extname(file.originalname))
//     }
// })
// const upload = multer({
//     storage: storage
// })

// app.post('/upload',upload.single('file'), (req,res)=> {
//     console.log(req.file)
// })
app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`)
})