// JavaScript code for creating the geographical bubble chart (using D3.js version 7)
function createBubbleChart() {
  // Load CSV data and world map GeoJSON data
  Promise.all([
    d3.csv("https://raw.githubusercontent.com/jeanettelin/CS416DataViz_JeanetteLin.io/main/athleteEvents.csv"),
    d3.json("https://datahub.io/core/geo-countries/datapackage.json")
  ]).then(function(data) {
    var csvData = data[0];
    var worldGeoJSON = data[1];

    // Group data by country and calculate the number of medals received
    var medalsByCountry = d3.rollup(
      csvData,
      function(d) { return d3.sum(d, function(d) { return d.Medal === "Gold" ? 1 : 0; }); },
      function(d) { return d.NOC; }
    );

    // Convert the rollup map to an array with country code and medal count
    var countryMedalsData = Array.from(medalsByCountry, ([key, value]) => ({ code: key, medals: value }));

    // Merge the GeoJSON data with the medal count data
    worldGeoJSON.features.forEach(function(feature) {
      var countryCode = feature.properties.iso_a3;
      var countryMedals = countryMedalsData.find(function(d) { return d.code === countryCode; });
      if (countryMedals) {
        feature.medals = countryMedals.medals;
      } else {
        feature.medals = 0;
      }
    });

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

    // Set up the projection
    var projection = d3.geoNaturalEarth1()
      .fitSize([chartWidth, chartHeight], worldGeoJSON);

    var path = d3.geoPath()
      .projection(projection);

    // Set up the bubble scale
    var maxMedals = d3.max(worldGeoJSON.features, function(d) { return d.medals; });
    var bubbleScale = d3.scaleSqrt()
      .domain([0, maxMedals])
      .range([5, 30]); // Adjust the range for bubble size

    // Draw the map
    chart.selectAll(".country")
      .data(worldGeoJSON.features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("fill", "lightblue")
      .attr("stroke", "white");

    // Draw the bubbles
    chart.selectAll(".bubble")
      .data(worldGeoJSON.features)
      .enter()
      .append("circle")
      .attr("class", "bubble")
      .attr("cx", function(d) { return path.centroid(d)[0]; })
      .attr("cy", function(d) { return path.centroid(d)[1]; })
      .attr("r", function(d) { return bubbleScale(d.medals); })
      .attr("fill", "gold")
      .attr("opacity", 0.7)
      .attr("stroke", "white");
  });
}

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
