const fileInput = document.getElementById('xlsx-file-input');

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];

    if(file){
        console.log(`Name: ${file.name}`);
        console.log(`Type: ${file.type}`)
    }
})