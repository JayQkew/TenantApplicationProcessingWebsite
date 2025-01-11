const fileInput = document.getElementById('xlsx-file-input');
const applicantTableContainer = document.getElementById('applicant-table');
const tableHeaders = ['Date','Name','Email Address','Contact Number','Message'];
const BASE_URL = window.location.origin + (process.env.API_BASE_PATH || '');

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0]; // csv file

    // process the data to something more readable
    //      remove repeating applications (check names, emails, numbers)
    //      display a new formatted table

    if(file){
        const reader = new FileReader();
        reader.onload = (e) => {
            const csvString = e.target.result;
            // using PapaParse library
            const parsedData = Papa.parse(csvString, {
                header: true, // Extract headers
                skipEmptyLines: true, // Ignore empty lines
            });

            const uniqueApplicants = Array.from(new Map(parsedData.data.map(item => [item['Email Address'], item])).values());

            console.log(uniqueApplicants);
            // update the tenant.json with new tenants
            
            fetch(`${BASE_URL}/api/tenants`)
                .then(res => res.json())
                .then(data => updateTenants(uniqueApplicants))

            const table = createTable(uniqueApplicants);
            applicantTableContainer.innerHTML = '';
            applicantTableContainer.appendChild(table);
            
        }
        reader.readAsText(file);
    }
});

function createTable(data){
    const table = document.createElement('table')

    const headerRow = document.createElement('tr')
    tableHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    data.forEach( row =>{
        const tableRow = document.createElement('tr');
        Object.keys(data[0]).forEach(header =>{
            const td = document.createElement('td');
            td.textContent = row[header] || '';
            tableRow.appendChild(td);
        });
        table.appendChild(tableRow);
    })

    return table;
}

function updateTenants(data){
    fetch(`${BASE_URL}/api/tenants`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(response => console.log(response.message))
        .catch(err => console.error('Error updateing users:', err));
}