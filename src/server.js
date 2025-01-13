const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const app = express();

const PORT = process.env.PORT || 8080;

// Supabase setup
const supabaseUrl = 'https://uhgkseqdeeyfpwoqfjhd.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
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
  const newTenants = req.body;

  console.log(newTenants);

  try {
      // Step 1: Fetch all existing tenants from the database
      const { data: existingTenants, error: fetchError } = await supabase
          .from('tenants')
          .select('email'); // Only fetch emails to compare

      if (fetchError) {
          console.error('Error fetching existing tenants:', fetchError);
          return res.status(500).json({ error: 'Failed to fetch existing tenants' });
      }

      // Step 2: Filter the incoming tenants to find the new ones
      const existingEmails = existingTenants.map(tenant => tenant.email);
      const newTenants = newTenants.filter(tenant => !existingEmails.includes(tenant.email));

      console.log('New Tenants:', newTenants);

      // Step 3: Insert new tenants into the database
      if (newTenants.length > 0) {
          const { error: insertError } = await supabase
            .from('tenants')
            .insert(newTenants);

          if (insertError) {
              console.error('Error adding tenants:', insertError);
              return res.status(500).json({ error: 'Failed to add tenants' });
          }

          res.json({ message: 'New tenants added successfully' });
      } else {
          res.json({ message: 'No new tenants to add' });
      }

  } catch (err) {
      console.error('Unexpected error adding tenants:', err);
      res.status(500).json({ error: 'Unexpected error adding tenants' });
  }
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
