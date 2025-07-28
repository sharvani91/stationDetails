// routes/stationRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const StationMap = require('../models/StationMap');

const router = express.Router();

const uploadPath = './uploads/stationMaps';
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

// Use memory storage, not disk storage:
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/stations/:stationId/map
router.post('/:stationId/map', upload.single('mapImage'), async (req, res) => {
  try {
    const { stationId } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const stationMap = new StationMap({
      stationName: stationId,
      zoneName: req.body.zone_name,
      image: req.file.buffer,
      contentType: req.file.mimetype
    });

    await stationMap.save();
    res.json({ message: 'Image stored in DB', id: stationMap._id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// GET /api/stations/map/:id to fetch image
router.get('/map/:id', async (req, res) => {
  try {
    const map = await StationMap.findById(req.params.id);
    if (!map) return res.status(404).json({ error: 'Not found' });
    res.contentType(map.contentType);
    res.send(map.image);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fetch failed' });
  }
});

module.exports = router;