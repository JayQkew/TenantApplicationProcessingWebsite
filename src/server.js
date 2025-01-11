const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const API_BASE_PATH = process.env.API_BASE_PATH || '';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','index.html'));
});

app.get(`/api/tenants`, (req, res) => {
    const filePath = path.join(__dirname, 'tenants.json');
    fs.readFile(filePath, (err, data) => {
        if(err){
            console.log('Error reading tenants.json:', err);
            return res.status(500).json({error: 'Failed to read tenants.json'});
        }

        const tenants = JSON.parse(data);
        res.json(tenants);
    });
});

app.post(`/api/tenants`, (req, res) => {
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

app.listen(PORT, ()=>{
    console.log(`Server is listening on port ${PORT}`)
});