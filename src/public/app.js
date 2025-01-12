const fileInput = document.getElementById('xlsx-file-input');
const applicantTableContainer = document.getElementById('applicant-table');
const tableHeaders = ['Date', 'Name', 'Email Address', 'Contact Number', 'Message'];

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0]; // csv file

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const csvString = e.target.result;

            // Using PapaParse library to parse the CSV data
            const parsedData = Papa.parse(csvString, {
                header: true, // Extract headers
                skipEmptyLines: true, // Ignore empty lines
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
        date: item['Date'], // Assuming 'Date' is also in the dataset
    }));

    // Iterate over the tenants to check for duplicates based on email
    formattedData.forEach(async (tenant) => {
        try {
            // Check if the tenant already exists by email in Supabase
            const { data: existingTenant, error } = await supabase
                .from('tenants')
                .select('*')
                .eq('email', tenant.email)
                .single();  // Get a single record based on the email

            if (error) {
                console.error('Error checking existing tenant:', error);
                return;
            }

            if (existingTenant) {
                console.log('Tenant already exists:', tenant.email);
            } else {
                // If the tenant does not exist, post the new tenant to the server
                fetch('/api/tenants', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify([tenant]),  // Send only the current tenant
                })
                    .then(res => {
                        if (!res.ok) {
                            throw new Error(`Failed to add tenant: ${res.status}`);
                        }
                        return res.json();
                    })
                    .then(response => {
                        console.log('Server Response:', response.message);
                    })
                    .catch(err => console.error('Error updating tenant:', err));
            }
        } catch (err) {
            console.error('Error processing tenant:', err);
        }
    });
}

