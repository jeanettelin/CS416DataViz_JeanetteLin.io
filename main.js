d3.csv("https://raw.githubusercontent.com/jeanettelin/CS416DataViz_JeanetteLin.io/main/athleteEvents.csv").then(function(data) {
  // Function to update the chart based on the selected year
  function updateChart(selectedYear) {
    // Filter data to get only gold medals for the selected year and group by country
    var goldMedalsData = d3.rollup(
      data.filter(d => d.Year === selectedYear && d.Medal === "Gold"),
      function(d) { return d.length; },
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

    // Remove previous bars
    chart.selectAll(".bar").remove();

    // Create and append new bars to the chart
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

    // Update x-axis and y-axis
    chart.select(".x-axis").call(d3.axisBottom(x));
    chart.select(".y-axis").call(d3.axisLeft(y));

    // Update chart title
    svg.select(".chart-title").text("Top 10 Countries with the Most Gold Medals in Summer Olympics - " + selectedYear);
  }

  // Set up the SVG container
  var svgWidth = 800;
  var svgHeight = 500;
  var margin = { top: 80, right: 20, bottom: 50, left: 60 };
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
    .padding(0.2);

  var y = d3.scaleLinear()
    .range([chartHeight, 0]);

  // Append x-axis
  chart.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + chartHeight + ")");

  // Append y-axis
  chart.append("g")
    .attr("class", "y-axis");

  // Add chart title
  svg.append("text")
    .attr("class", "chart-title")
    .attr("x", svgWidth / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .text("Top 10 Countries with the Most Gold Medals in Summer Olympics - 2008");

  // Year slider event listener
  var yearSlider = document.getElementById("yearSlider");
  var selectedYearDisplay = document.getElementById("selectedYear");

  yearSlider.addEventListener("input", function() {
    var selectedYear = parseInt(yearSlider.value);
    selectedYearDisplay.textContent = selectedYear;
    updateChart(selectedYear);
  });

  // Initialize the chart with data for the year 2008
