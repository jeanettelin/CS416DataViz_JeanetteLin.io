// JavaScript code for creating the geographical bubble chart (using D3.js version 7)
function createBubbleChart() {
  // ... (previous bubble chart code)
}

// Function to switch to the bubble chart
function showBubbleChart() {
  // Remove existing chart and description
  d3.select("#chart").selectAll("*").remove();
  d3.select("#description").selectAll("*").remove();

  // Create and show the bubble chart
  createBubbleChart();

  // Add descriptive text
  var description = d3.select("#description")
    .append("div")
    .style("margin", "20px")
    .style("text-align", "left");

  description.append("h3")
    .text("Geographical Bubble Chart");

  description.append("p")
    .text("The geographical bubble chart displays the number of medals received by each country in the Summer Olympics.");

  description.append("p")
    .text("The size of the bubbles represents the number of medals, and the bubbles are placed on the map according to the country's geographical location.");

  description.append("p")
    .text("Click the \"Next\" button again to return to the bar chart.");
}
