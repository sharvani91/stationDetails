const express = require('express');
const multer = require('multer');
const ZoneMap = require('../models/ZoneMap');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload zone map
router.post('/:zoneName/map', upload.single('zoneMap'), async (req, res) => {
  try {
    const { zoneName } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const zoneMap = new ZoneMap({
      zoneName: zoneName,
      image:req.file.buffer,
      contentType: req.file.mimetype,
    });

    await zoneMap.save();
    res.status(201).json({ message: 'Zone map uploaded', id: zoneMap._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload zone map' });
  }
});

// Get zone map by zone name
router.get('/map/:zoneName', async (req, res) => {
  try {
    const zoneMap = await ZoneMap.findOne({ zoneName: req.params.zoneName });
    if (!zoneMap) return res.status(404).json({ error: 'Not found' });
    res.set('Content-Type', zoneMap.contentType);
    res.send(zoneMap.image);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch zone map' });
  }
});

module.exports = router;
