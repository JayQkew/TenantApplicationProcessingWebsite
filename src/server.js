const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})

app.get('/api/tenants', (req, res) => {
    const filePath = path.join(__dirname, 'tenants.json');
    fs.readFile(filePath, (err, data) => {
        if(err){
            console.log('Error reading tenants.json:', err);
            return res.status(500).json({error: 'Failed to read tenants.json'});
        }

        const users = JSON.parse(data);
        res.json(users);
    })
})

app.post('/api/tenants', (req, res) => {
    const filePath = path.join(__dirname, 'tenants.json');
    const updatedTenants = req.body;

    fs.writeFile(filePath, JSON.stringify(updatedTenants, null, 2), 'utf8', err => {
        if (err) {
            console.error('Error writing to tenants.json:', err);
            return res.status(500).json({ error: 'Failed to update tenants.json' });
        }
        res.json({ message: 'Tenants updated successfully', tenants: updatedTenants });
    });
});

app.listen(8080, ()=>{
    console.log('Server is listening on port 8080')
})