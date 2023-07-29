const dataUrl = 'athleteEvents.csv';


function createBarChart() {
  const dataUrl = 'athleteEvents.csv';
  d3.csv(dataUrl).then(data => {
    console.log(data.slice(0, 5)); // Log the first 5 rows of the data

    // Convert the 'Year' and 'Sport' columns to appropriate data types
    data.forEach(d => {
      d.Year = +d.Year; // Convert to number
    });

    // Calculate the count of athletes per sport using d3.group
    const sportsData = Array.from(d3.group(data, d => d.Sport), ([key, value]) => ({ key, value: value.length }));

    // Sort the data by the number of athletes in descending order
    sportsData.sort((a, b) => b.value - a.value);

    // ... Rest of the code remains unchanged ...
    // ... Same as the previous version of main.js ...
  }).catch(error => {
    console.error('Error loading data:', error);
  });
}

// Call the function to create the bar chart when the page loads
createBarChart();
