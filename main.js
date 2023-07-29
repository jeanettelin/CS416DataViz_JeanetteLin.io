// Path to the local CSV file (assuming it's in the same directory as main.js and index.html)
const dataUrl = 'athleteEvents.csv';

// Function to load the data using D3 and create the bar chart
function createBarChart() {
  d3.csv(dataUrl).then(data => {
    // Convert the 'Year' and 'Sport' columns to appropriate data types
    data.forEach(d => {
      d.Year = +d.Year; // Convert to number
    });

    // Calculate the count of athletes per sport
    const sportsData = d3.rollups(data, v => v.length, d => d.Sport);

    // Sort the data by the number of athletes in descending order
    sportsData.sort((a, b) => b[1] - a[1]);

    // ... Rest of the code remains unchanged ...
    // ... Same as the previous version of main.js ...
  }).catch(error => {
    console.error('Error loading data:', error);
  });
}

// Call the function to create the bar chart when the page loads
createBarChart();
