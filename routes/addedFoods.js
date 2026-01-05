const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const axios = require('axios');
const { ObjectId } = require('mongodb');
const CALORIE_NINJAS_KEY = process.env.CALORIE_NINJAS_API_KEY;


router.get('/addFood', async (req, res) => {
  try {
    const { email } = req.query;
    const db = getDb();

    const foods = await db
      .collection('addedFoods')
      .find({ email })
      .toArray();

    res.json(foods);
  } catch (err) {
    console.error('Failed to get foods', err);
    res.status(500).json({ error: 'Failed to get foods' });
  }
});

// addFood

router.post('/addFood', async (req, res) => {
  try {
    const { foodName, amount, email, section } = req.body;

    if (!CALORIE_NINJAS_KEY) {
      return res.status(500).json({ error: 'Nutrition API key missing' });
    }

    
    const query = `${amount} ${foodName}`;

    const nutritionResponse = await axios.get(
      'https://api.calorieninjas.com/v1/nutrition',
      {
        params: { query },
        headers: {
          'X-Api-Key': CALORIE_NINJAS_KEY
        }
      }
    );

    const items = nutritionResponse.data.items;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No nutrition data found' });
    }

    const food = items[0];

    const newFood = {
      foodName,
      amount: Number(amount),
      email,
      section,
      calories: food.calories ?? 0,
      protein: food.protein_g ?? 0,
      fat: food.fat_total_g ?? 0,
      carbs: food.carbohydrates_total_g ?? 0,
      createdAt: new Date()
    };

    const db = getDb();
    const result = await db.collection('addedFoods').insertOne(newFood);

    const insertedFood = await db
      .collection('addedFoods')
      .findOne({ _id: result.insertedId });

    res.status(201).json(insertedFood);
  } catch (err) {
    console.error('Failed to add food', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to add food' });
  }
});

// delete

router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const result = await db.collection('addedFoods').deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Food not found',
      });
    }

    res.json({
      success: true,
      deletedId: id,
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete food',
    });
  }
});


// dailySummary

router.get('/daily-summary', async (req, res) => {
  try {
    const { email, date } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const baseDate = date ? new Date(date) : new Date();

    
    const startOfDay = new Date(baseDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(baseDate);
    endOfDay.setHours(23, 59, 59, 999);

    const db = getDb();

    const summary = await db.collection('addedFoods').aggregate([
      {
        $match: {
          email,
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: null,
          totalCalories: { $sum: '$calories' },
          totalProtein: { $sum: '$protein' },
          totalFat: { $sum: '$fat' },
          totalCarbs: { $sum: '$carbs' },
          itemCount: { $sum: 1 }
        }
      }
    ]).toArray();

    res.json(
      summary[0] || {
        totalCalories: 0,
        totalProtein: 0,
        totalFat: 0,
        totalCarbs: 0,
        itemCount: 0
      }
    );
  } catch (err) {
    console.error('Failed to get daily summary', err);
    res.status(500).json({ error: 'Failed to get daily summary' });
  }
});

module.exports = router;
