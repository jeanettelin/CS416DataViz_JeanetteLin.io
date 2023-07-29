// URL to the CSV file on GitHub
const dataUrl = 'https://raw.githubusercontent.com/cosmoduende/r-olympic-games/main/datasets/athleteEvents.csv';

// Function to load the data using D3 and create the bar chart
function createBarChart() {
  d3.csv(dataUrl).then(data => {
    // Convert the 'Year' and 'Sport' columns to appropriate data types
    data.forEach(d => {
      d.Year = +d.Year; // Convert to number
    });

    // Calculate the count of athletes per sport
    const sportsData = d3.nest()
      .key(d => d.Sport)
      .rollup(values => values.length)
      .entries(data);

    // Sort the data by the number of athletes in descending order
    sportsData.sort((a, b) => b.value - a.value);

    // Set up the dimensions and margins for the chart
    const margin = { top: 20, right: 30, bottom: 30, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create the SVG container for the chart
    const svg = d3.select('#chart-container')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create the X and Y scales
    const xScale = d3.scaleBand()
      .domain(sportsData.map(d => d.key))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(sportsData, d => d.value)])
      .range([height, 0]);

    // Create the X and Y axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Add X and Y axes to the chart
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .selectAll('text')
      .attr('y', 10) // Adjust label position
      .attr('x', -10) // Adjust label position
      .attr('transform', 'rotate(-45)') // Rotate X axis labels for readability

    svg.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);

    // Create the bars
    svg.selectAll('.bar')
      .data(sportsData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.key))
      .attr('width', xScale.bandwidth())
      .attr('y', d => yScale(d.value))
      .attr('height', d => height - yScale(d.value));
  }).catch(error => {
    console.error('Error loading data:', error);
  });
}

// Call the function to create the bar chart when the page loads
createBarChart();
