const fileInput = document.getElementById('xlsx-file-input');

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0]; // csv file

    // process the data to something more readable
    //      remove repeating applications (check names, emails, numbers)
    //      display a new formatted table
    if(file){
        const reader = new FileReader();
        reader.onload = (e) => {
            const csvString = e.target.result;
            const parsedData = parseCSV(csvString);

            console.log(parsedData);
        }
        reader.readAsText(file);
    }
});

function parseCSV(csvString){
    const lines = csvString.split('\n');
    const filteredLines = lines.filter(line => line.trim() !== '');
    return filteredLines.map(line => line.split(','));
}