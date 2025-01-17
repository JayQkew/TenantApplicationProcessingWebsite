const applicantTableContainer = document.querySelector('.applicant-table');
const applicantInfo = ['Name', 'Date', 'Email Address', 'Contact Number', 'Message'];

const displayRowSelector = document.getElementById('table-row-selector');
const displayRowNumbers = [10, 20, 50, 100, 0]; //0 = display all

createSelection();
createApplicantInfo();

function createSelection(){
    displayRowNumbers.map(row => {
        const option = `<option value="${row}">${(row != 0) ? row : 'All'}</option>`
        displayRowSelector.innerHTML += option;
    })
}

function createApplicantInfo(){
    const applicantInfoPage = document.querySelector('.specific-applicant')

    applicantInfo.map(info => {
        const formattedInfo = info.toLowerCase().replace(/\s+/g, '-');
        const infoElement = `
            <div class="applicant-${formattedInfo} applicant-data-container">
                <span class="data-type">
                    ${info} :
                </span>
                <span class="data-${formattedInfo} data-values">
                </span>
            </div>`;
        applicantInfoPage.innerHTML += infoElement;
    })

    const noteSection = `
        <div class="applicant-note applicant-data-container">
            <span class="data-type">
                Note:
            </span>
            <div class="note-container">
                <textarea id="note-input" rows="4" placeholder="Write a note..."></textarea>
                <button class="save-note-button">Save Note</button>
            </div>
        </div>`;
    applicantInfoPage.innerHTML += noteSection;

    // Attach event listener to save note button
    const saveNoteButton = applicantInfoPage.querySelector('.save-note-button');
    saveNoteButton.addEventListener('click', () => saveApplicantNote(applicant['Email Address']));

}
