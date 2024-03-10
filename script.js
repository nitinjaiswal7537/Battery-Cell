var sessionData = {}; // Object to store session data

// Function to preview uploaded image and generate barcode
function previewImage(event) {
    var preview = document.getElementById('preview');
    preview.src = URL.createObjectURL(event.target.files[0]);

    generateBarcode(event.target.files[0].name);
}

// Function to generate barcode from image filename
function generateBarcode(imageFileName) {

    var hashCode = hashString(imageFileName);
    var barcode = hashCode.slice(0, 10);
    var barcodeText = document.getElementById('barcodeText');
    barcodeText.textContent = "Barcode: " + barcode;


    bwipjs.toCanvas(document.getElementById('barcodeCanvas'), {
        bcid: 'code128',
        text: barcode,
        scale: 3,
        includetext: true,
        textxalign: 'center',
        textsize: 12
    });

    // Store the generated barcode
    sessionData.barcode = barcode;
}

// Simple string hashing function
function hashString(str) {
    var hash = 0;
    if (str.length == 0) {
        return hash;
    }
    for (var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

// Function to store session data
function storeSessionData() {
    sessionStorage.setItem('sessionData', JSON.stringify(sessionData));
}

// Function to retrieve session data
function retrieveSessionData() {
    var storedData = sessionStorage.getItem('sessionData');
    if (storedData) {
        sessionData = JSON.parse(storedData);
        var barcodeText = document.getElementById('barcodeText');
        barcodeText.textContent = "Barcode: " + sessionData.barcode;


        if (sessionData.barcode) {
            generateBarcode(sessionData.barcode);
        }
    }
}

// Retrieve session data on page load
retrieveSessionData();

document.getElementById('data-file').addEventListener('change', function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const contents = e.target.result;
        processData(contents);
    };

    reader.readAsText(file);
});

function processData(data) {

    const rows = data.split('\n');
    const frequencies = [];
    const impedances = [];

    // Parse CSV data
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim().split(',');
        if (row.length === 2) {
            frequencies.push(parseFloat(row[0]));
            impedances.push(parseFloat(row[1]));
        }
    }

    // Generate Bode plot
    const trace = {
        x: frequencies,
        y: impedances,
        mode: 'lines',
        type: 'scatter',
        name: 'Impedance'
    };

    const layout = {
        title: 'Bode Plot',
        xaxis: {
            title: 'Frequency (Hz)'
        },
        yaxis: {
            title: 'Impedance'
        }
    };

    const plotData = [trace];
    Plotly.newPlot('bode-plot', plotData, layout);

    // Populate example parameter values 
    document.getElementById('Rb-value').innerText = "null";


    // Calculate and display SoH
    const maxRb = 200;
    const currentRb = 100;
    const soh = (currentRb / maxRb) * 100;
    document.getElementById('soh-value').innerText = `State-of-the-Health (SoH): ${soh.toFixed(2)}%`;

    // Update visual indicator for Rb
    const rbIndicator = document.getElementById('Rb-indicator');
    const rbVisualValue = (currentRb / maxRb) * 100;
    rbIndicator.innerHTML = `<div style="width: ${rbVisualValue}%; background-color: #4CAF50;"></div>`;
}