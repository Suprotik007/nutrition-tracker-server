const express = require('express');
const router = express.Router();
const { getDb } = require('../db'); 

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const foodsCollection = db.collection('addedFoods');
    const foods = await foodsCollection.find({}).toArray();
    res.json(foods);
  } catch (err) {
    console.error('Failed to get foods', err);
    res.status(500).json({ error: 'Failed to get foods' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { foodName, amount } = req.body;

    if (!foodName || !amount) {
      return res.status(400).json({ error: 'foodName and amount are required' });
    }

    const newFood = { foodName, amount: Number(amount), createdAt: new Date() };
    const db = getDb();
    const foodsCollection = db.collection('addedFoods');

    const result = await foodsCollection.insertOne(newFood);


    const insertedFood = await foodsCollection.findOne({ _id: result.insertedId });

    res.status(201).json(insertedFood);
  } catch (err) {
    console.error('Failed to add food', err);
    res.status(500).json({ error: 'Failed to add food' });
  }
});

module.exports = router;
