const fileInput = document.querySelector('.file-input');
const applicantTableContainer = document.querySelector('.applicant-table');
const tableHeaders = ['Date', 'Name', 'Email Address', 'Contact Number', 'Message'];

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0]; // first file

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const csvString = e.target.result;

            // Using PapaParse library to parse the CSV data (remove empty spaces, use headers for objects)
            const parsedData = Papa.parse(csvString, {
                header: true,
                skipEmptyLines: true
            });

            // Remove duplicates by Email Address
            const uniqueApplicants = Array.from(new Map(parsedData.data.map(item => [item['Email Address'], item])).values());

            console.log('Unique Applicants:', uniqueApplicants);

            // Display the parsed table
            const table = createTable(uniqueApplicants);
            applicantTableContainer.innerHTML = '';
            applicantTableContainer.appendChild(table);

            // Post new applicants to the database
            updateTenants(uniqueApplicants);
        };
        reader.readAsText(file);
    }
});

function createTable(data) {
    const table = document.createElement('table');

    const headerRow = document.createElement('tr');
    tableHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    data.forEach(row => {
        const tableRow = document.createElement('tr');
        Object.keys(row).forEach(header => {
            const td = document.createElement('td');
            td.textContent = row[header] || '';
            tableRow.appendChild(td);
        });
        table.appendChild(tableRow);
    });

    return table;
}

function updateTenants(data) {
    // Convert to Supabase-compatible format
    const formattedData = data.map(item => ({
        name: item['Name'],
        email: item['Email Address'],
        phone: item['Contact Number'],
        message: item['Message'],
        date: item['Date'],
    }));

    // Send formatted data to the server
    fetch('https://shih-tenant-application-processing.onrender.com/api/tenants', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData), // makes formattedData into JSON notation
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`Failed to add tenants: ${res.status}`);
        }
        return res.json(); // makes the JSON into a JavaScript Object
    })
    .then(response => {
        console.log('Server Response:', response.message);
    })
    .catch(err => console.error('Error updating tenants:', err));
}
