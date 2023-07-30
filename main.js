// JavaScript code for creating the bar chart (using D3.js version 7)
d3.csv("https://raw.githubusercontent.com/jeanettelin/CS416DataViz_JeanetteLin.io/main/athleteEvents.csv").then(function(data) {
  // Filter data to get only gold medals and group by country
  var goldMedalsData = d3.rollup(
    data,
    function(d) { return d3.sum(d, function(d) { return d.Medal === "Gold" ? 1 : 0; }); },
    function(d) { return d.NOC; }
  );

  // Convert the rollup map to an array
  goldMedalsData = Array.from(goldMedalsData, ([key, value]) => ({ key, value }));

  // Sort the data in descending order based on gold medals count
  goldMedalsData.sort(function(a, b) {
    return b.value - a.value;
  });

  // Take only the top 10 countries
  goldMedalsData = goldMedalsData.slice(0, 10);

  // Set up the SVG container
  var svgWidth = 800; // Adjust the width here
  var svgHeight = 500; // Adjust the height here
  var margin = { top: 80, right: 20, bottom: 50, left: 60 }; // Increase the top margin
  var chartWidth = svgWidth - margin.left - margin.right;
  var chartHeight = svgHeight - margin.top - margin.bottom;

  var svg = d3.select("#chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  var chart = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Set up scales
  var x = d3.scaleBand()
    .range([0, chartWidth])
    .padding(0.2)
    .domain(goldMedalsData.map(function(d) { return d.key; }));

  var y = d3.scaleLinear()
    .range([chartHeight, 0])
    .domain([0, d3.max(goldMedalsData, function(d) { return d.value; })]);

  // Create and append bars to the chart
  chart.selectAll(".bar")
    .data(goldMedalsData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return x(d.key); })
    .attr("y", function(d) { return y(d.value); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return chartHeight - y(d.value); })
    .attr("fill", "gold");

  // Append x-axis
  chart.append("g")
    .attr("transform", "translate(0," + chartHeight + ")")
    .call(d3.axisBottom(x));

  // Append y-axis
  chart.append("g")
    .call(d3.axisLeft(y));

  // Add chart title
  svg.append("text")
    .attr("x", svgWidth / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .text("Top 10 Countries with the Most Gold Medals in Summer Olympics");
});
