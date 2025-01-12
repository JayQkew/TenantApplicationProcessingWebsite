const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 8080;

// Supabase setup
const supabaseUrl = 'https://uhgkseqdeeyfpwoqfjhd.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY; // Ensure SUPABASE_KEY is set in your environment variables
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get tenants from the database
app.get('/api/tenants', async (req, res) => {
    try {
        const { data, error } = await supabase.from('tenants').select('*');

        if (error) {
            console.error('Error fetching tenants:', error);
            return res.status(500).json({ error: 'Failed to fetch tenants' });
        }

        res.json(data); // Send the data as JSON
    } catch (err) {
        console.error('Unexpected error fetching tenants:', err);
        res.status(500).json({ error: 'Unexpected error fetching tenants' });
    }
});

// Add tenants to the database
app.post('/api/tenants', async (req, res) => {
    const tenants = req.body;

    try {
        const { error } = await supabase.from('tenants').insert(tenants);

        if (error) {
            console.error('Error adding tenants:', error);
            return res.status(500).json({ error: 'Failed to add tenants' });
        }

        res.json({ message: 'Tenants added successfully' });
    } catch (err) {
        console.error('Unexpected error adding tenants:', err);
        res.status(500).json({ error: 'Unexpected error adding tenants' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
