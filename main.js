// URL to the CSV file on GitHub
const dataUrl = 'https://raw.githubusercontent.com/cosmoduende/r-olympic-games/main/datasets/athleteEvents.csv';

// Function to load the data using D3
function loadData() {
  d3.csv(dataUrl).then(data => {
    // The 'data' variable now holds your CSV data as an array of objects
    console.log(data);

    // Here you can start creating your D3 visualization using the loaded data
    // For simplicity, let's just log the first row to the console
    console.log(data[0]);
  }).catch(error => {
    console.error('Error loading data:', error);
  });
}

// Call the function to load the data when the page loads
loadData();