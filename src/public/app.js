const fileInput = document.querySelector('#file-input');
const applicantTableContainer = document.querySelector('.applicant-table');
const tableHeaders = ['Date', 'Name', 'Email Address', 'Contact Number', 'Message'];
let applicants = [];

const displayRowSelector = document.getElementById('table-row-selector');
const displayRowNumbers = [0, 5, 10, 20, 50, 100]; //0 = display all
let currentPage = 1;
let applicantPages; //2D array with applicants on the same page being in the same inner array

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
            applicants = uniqueApplicants;

            console.log('Unique Applicants:', uniqueApplicants);

            rearrangeArray(0);

            // Display the parsed table
            createTable(1);

            // Post new applicants to the database
            updateTenants(uniqueApplicants);
        };
        reader.readAsText(file);
    }
});

displayRowSelector.addEventListener('change', (e) => {
    // change the 2D array to match the value;
    const rowsPerPage = parseInt(e.target.value, 10);
    currentPage = 1;
    rearrangeArray(rowsPerPage);
    createTable(currentPage);
    
})

createSelection();

function createSelection(){
    displayRowNumbers.map(row => {
        const option = `<option value="${row}">${(row != 0) ? row : 'All'}</option>`
        displayRowSelector.innerHTML += option;
    })
}

function rearrangeArray(rowsPerPage) {
    if (rowsPerPage === 0) {
        // Display all applicants in a single page
        applicantPages = [applicants];
    } else {
        applicantPages = [];
        for (let i = 0; i < applicants.length; i += rowsPerPage) {
            // Slice the applicants array to create chunks
            applicantPages.push(applicants.slice(i, i + rowsPerPage));
        }
    }
    console.log('Applicant Pages:', applicantPages);
}

function createTable(pageNumber) {
    applicantTableContainer.innerHTML = '';

    const table = document.createElement('table');

    // Create the header row
    const headerRow = document.createElement('tr');
    tableHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Ensure data exists for the specified page
    const pageData = applicantPages[pageNumber - 1] || [];

    // Create rows for the data
    pageData.forEach(row => {
        const tableRow = document.createElement('tr');
        tableHeaders.forEach(header => {
            const td = document.createElement('td');
            td.textContent = row[header] || '';
            tableRow.appendChild(td);
        });
        table.appendChild(tableRow);
    });

    applicantTableContainer.appendChild(table);

    // Display pagination controls
    createPaginationControls();
}

function createPaginationControls() {
    const paginationContainer = document.getElementById('pagination-controls');
    if (!paginationContainer) return;

    const totalPages = applicantPages.length;

    paginationContainer.innerHTML = `
        <button class="prev-page" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
        <span>Page ${currentPage} of ${totalPages}</span>
        <button class="next-page" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
    `;

    // Add event listeners for navigation buttons
    paginationContainer.querySelector('.prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            createTable(currentPage);
        }
    });

    paginationContainer.querySelector('.next-page').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            createTable(currentPage);
        }
    });
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
