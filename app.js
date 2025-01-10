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
            // using PapaParse library
            const parsedData = Papa.parse(csvString, {
                header: true, // Extract headers
                skipEmptyLines: true, // Ignore empty lines
            });

            const uniqueApplicants = Array.from(new Map(parsedData.data.map(item => [item['Email Address'], item])).values());

            console.log(uniqueApplicants);
        }
        reader.readAsText(file);
    }
});