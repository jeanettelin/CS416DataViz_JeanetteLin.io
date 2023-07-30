d3.csv("https://raw.githubusercontent.com/jeanettelin/CS416DataViz_JeanetteLin.io/main/athleteEvents.csv").then(function(data) {
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
    .text("Top 10 Countries with the Most Medals in Summer Olympics - 2008"); // Initial title for 2008

  // Function to update the chart based on the selected year
  function updateChart(selectedYear) {
    // Filter data to get only medals for the selected year and group by country and gender
    var medalsData = d3.rollup(
      data.filter(d => d.year === selectedYear && d.medal !== ""), // Filter out rows without medals
      function(d) { return d.length; },
      function(d) { return d.noc; },
      function(d) { return d.sex; }
    );

    // Convert the rollup map to an array and calculate the total medals count for each country
    var medalsArray = Array.from(medalsData, ([country, genderData]) => ({
      key: country,
      totalMedals: d3.sum(genderData.values()),
      femaleCount: genderData.get("F") || 0, // Get female medal count or set to 0 if not present
    }));

    // Sort the data in descending order based on total medals count
    medalsArray.sort(function(a, b) {
      return b.totalMedals - a.totalMedals;
    });

    // Take only the top 10 countries
    medalsArray = medalsArray.slice(0, 10);

    // Remove previous bars
    chart.selectAll(".bar").remove();

    // Update scales with new data
    x.domain(medalsArray.map(function(d) { return d.key; }));
    y.domain([0, d3.max(medalsArray, function(d) { return d.totalMedals; })]);

    // Create and append new bars to the chart
    var countryGroups = chart.selectAll(".country-group")
      .data(medalsArray)
      .enter()
      .append("g")
      .attr("class", "country-group")
      .attr("transform", function(d) { return "translate(" + x(d.key) + ", 0)"; });

    countryGroups.selectAll(".bar")
      .data(d => [{ medal: "male", count: d.totalMedals - d.femaleCount }, { medal: "female", count: d.femaleCount }])
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", d => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", d => chartHeight - y(d.count))
      .attr("fill", d => (d.medal === "male" ? "#0084b4" : "#e68a00"))
      .on("mouseover", function(d) {
        tooltip.style("opacity", 1);
        tooltip.html(`Medal: ${d.medal}<br>Count: ${d.count}<br>Total: ${d3.select(this.parentNode).datum().totalMedals}`)
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY - 30) + "px");
      })
      .on("mouseout", function(d) {
        tooltip.style("opacity", 0);
      });

    // Update x-axis and y-axis
    chart.select(".x-axis").call(d3.axisBottom(x));
    chart.select(".y-axis").call(d3.axisLeft(y));

    // Update chart title
    svg.select(".chart-title").text(`Top 10 Countries with the Most Medals in Summer Olympics - ${selectedYear}`);
  }

  // Initialize the chart with data for the year 2008
  updateChart(2008);

  // Year slider event listener
  var yearSlider = document.getElementById("yearSlider");
  var selectedYearDisplay = document.getElementById("selectedYear");

  yearSlider.addEventListener("input", function() {
    var selectedYear = parseInt(yearSlider.value);
    selectedYearDisplay.textContent = selectedYear;
    updateChart(selectedYear);
  });
});
