const express = require('express');
const { getDb } = require('../db');
const router = express.Router();

router.post('/bmi', async (req, res) => {
  try {
    const db = getDb();
    const bmiCollection = db.collection('bmiRecords');

    const {
      email,
      gender,
      age,
      height,
      weight,
      bmi,
      category,
    } = req.body;

    if (
      !email ||
      !gender ||
      !age ||
      !height ||
      !weight ||
      !bmi ||
      !category
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const existing = await bmiCollection.findOne({
      email,
      recordedAt: { $gte: today, $lt: tomorrow },
    });

    if (existing) {
      await bmiCollection.updateOne(
        { _id: existing._id },
        {
          $set: {
            gender,
            age,
            height,
            weight,
            bmi,
            category,
            updatedAt: new Date(),
          },
        }
      );

      return res.status(200).json({ message: 'BMI updated successfully' });
    }

    const newRecord = {
      email,
      gender,
      age,
      height,
      weight,
      bmi,
      category,
      recordedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await bmiCollection.insertOne(newRecord);

    res.status(201).json({
      message: 'BMI saved successfully',
      data: newRecord,
    });
  } catch (error) {
    console.error('BMI POST error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
