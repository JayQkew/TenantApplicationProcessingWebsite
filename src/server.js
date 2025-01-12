const express = require('express');
const path = require('path');
const fs = require('fs');
const pool = require('./db');
const app = express();
const PORT = process.env.PORT || 8080;
const BASE_URL = 'https://<your-supabase-project>.supabase.co';


app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','index.html'));
});

app.get('/api/tenants', async (req, res) => {
    try {
      // Query the database to fetch tenant data
      const result = await pool.query('SELECT * FROM tenants');
      res.json(result.rows); // Send the rows as JSON
    } catch (err) {
      console.error('Error fetching tenants:', err);
      res.status(500).json({ error: 'Failed to fetch tenants' });
    }
  });

  app.post('/api/tenants', async (req, res) => {
    const tenants = req.body;
  
    try {
      // Insert tenants into the PostgreSQL database
      for (const tenant of tenants) {
        const { name, email, phone } = tenant;
        await pool.query(
          'INSERT INTO tenants(name, email, phone) VALUES($1, $2, $3)',
          [name, email, phone]
        );
      }
  
      res.json({ message: 'Tenants added successfully' });
    } catch (err) {
      console.error('Error adding tenants:', err);
      res.status(500).json({ error: 'Failed to add tenants' });
    }
  });
  
app.listen(PORT, ()=>{
    console.log(`Server is listening on port ${PORT}`)
});