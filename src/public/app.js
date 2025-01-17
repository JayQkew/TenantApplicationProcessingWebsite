const fileInput = document.querySelector('#file-input');
const _displayRowSelector = document.getElementById('table-row-selector');

const tableHeaders = ['Name', 'Email Address', 'Contact Number'];
let applicants = [];

let currentPage = 1;
let applicantPages; //2D array with applicants on the same page being in the same inner array

getApplicantsFromDatabase();

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

            applicantsToPages(10);

            // Display the parsed table
            createTable(1);

            // Post new applicants to the database
            updateDatabase_tenants(uniqueApplicants);
        };
        reader.readAsText(file);
    }
});

_displayRowSelector.addEventListener('change', (e) => {
    // change the 2D array to match the value;
    const rowsPerPage = parseInt(e.target.value, 10);
    currentPage = 1;
    applicantsToPages(rowsPerPage);
    createTable(currentPage);

})

function getApplicantsFromDatabase() {
    fetch('https://shih-tenant-application-processing.onrender.com/api/tenants')
        .then(res => {
            if (!res.ok) {
                throw new Error(`Failed to fetch applicants: ${res.status}`);
            }
            return res.json(); // Convert response to JavaScript object
        })
        .then(data => {
            console.log('Applicants fetched from database:', data);

            // Map the fetched data to match the tableHeaders structure
            applicants = data.map(applicant => ({
                'Name': applicant.name,
                'Email Address': applicant.email,
                'Contact Number': applicant.phone,
                'Date': applicant.date,
                'Message': applicant.message,
                'Note': applicant.note
            }));

            // Paginate the applicants and render the first page
            applicantsToPages(10);
            createTable(1);
        })
        .catch(err => console.error('Error fetching applicants from database:', err));
}


function applicantsToPages(rowsPerPage) {
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
    const header = document.createElement('thead');
    const headerRow = document.createElement('tr');
    tableHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    header.appendChild(headerRow);
    table.appendChild(header);

    // Ensure data exists for the specified page
    const pageData = applicantPages[pageNumber - 1] || [];

    // Create rows for the data
    const body = document.createElement('tbody');
    pageData.forEach(row => {
        const tableRow = document.createElement('tr');
        tableHeaders.forEach(header => {
            const td = document.createElement('td');
            td.textContent = row[header] || '';
            tableRow.appendChild(td);
        });
        tableRow.addEventListener('click', () => displaySpecificApplicantInfo(row));
        body.appendChild(tableRow);
    });
    table.appendChild(body);

    applicantTableContainer.appendChild(table);

    // Display pagination controls
    createPaginationControls();
}

function createPaginationControls() {
    const paginationContainer = document.getElementById('pagination-controls');
    if (!paginationContainer) return;

    const totalPages = applicantPages.length;
    const maxVisiblePages = 3; // Number of visible pages before ellipses

    paginationContainer.innerHTML = '';

    // Previous Button
    const prevButton = document.createElement('button');
    prevButton.textContent = '<';
    prevButton.className = 'prev-page';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            createTable(currentPage);
        }
    });
    paginationContainer.appendChild(prevButton);

    // Page Buttons
    const pageButtons = document.createElement('span');
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 || // Always show first page
            i === totalPages || // Always show last page
            (i >= currentPage - Math.floor(maxVisiblePages / 2) && i <= currentPage + Math.floor(maxVisiblePages / 2))
        ) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.className = `page-button ${i === currentPage ? 'active' : ''}`;
            pageButton.addEventListener('click', () => {
                currentPage = i;
                createTable(currentPage);
            });
            pageButtons.appendChild(pageButton);
        } else if (
            (i === currentPage - Math.ceil(maxVisiblePages / 2) && i > 1) ||
            (i === currentPage + Math.ceil(maxVisiblePages / 2) && i < totalPages)
        ) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'ellipsis';
            pageButtons.appendChild(ellipsis);
        }
    }
    paginationContainer.appendChild(pageButtons);

    // Next Button
    const nextButton = document.createElement('button');
    nextButton.textContent = '>';
    nextButton.className = 'next-page';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            createTable(currentPage);
        }
    });
    paginationContainer.appendChild(nextButton);
}

function updateDatabase_tenants(data) {
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

function displaySpecificApplicantInfo(applicant) {
    const applicantInfoPage = document.querySelector('.specific-applicant');
    applicantInfoPage.innerHTML = ''; // Clear previous data

    applicantInfo.forEach(info => {
        const formattedInfo = info.toLowerCase().replace(/\s+/g, '-');
        const infoElement = `
            <div class="applicant-${formattedInfo} applicant-data-container">
                <span class="data-type">
                    ${info}:
                </span>
                <span class="data-${formattedInfo} data-values">
                    ${applicant[info] || 'N/A'}
                </span>
            </div>`;
        applicantInfoPage.innerHTML += infoElement;
    });

    const noteValue = applicant['Note'] || ''; // Use the note from applicant data or an empty string
    console.log(noteValue);

    const noteSection = `
    <div class="applicant-note applicant-data-container">
        <span class="data-type">
            Note:
        </span>
        <div class="note-container">
            <textarea id="note-input" rows="4" placeholder="Write a note...">${noteValue}</textarea>
            <button class="save-note-button">Save Note</button>
        </div>
    </div>`;
    applicantInfoPage.innerHTML += noteSection;

    // Attach event listener to save note button
    const saveNoteButton = applicantInfoPage.querySelector('.save-note-button');
    saveNoteButton.addEventListener('click', () => saveApplicantNote(applicant['Email Address']));
}

function saveApplicantNote(email) {
    const noteInput = document.querySelector('#note-input');
    const note = noteInput.value.trim();

    if (!note) {
        alert('Please write a note before saving.');
        return;
    }

    // Save the note to the database
    fetch('https://shih-tenant-application-processing.onrender.com/api/tenants/note', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, note }), // Send email and note as payload
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`Failed to save note: ${res.status}`);
        }
        return res.json();
    })
    .then(response => {
        console.log('Note saved successfully:', response.message);
        alert('Note saved successfully!');
    })
    .catch(err => console.error('Error saving note:', err));
}