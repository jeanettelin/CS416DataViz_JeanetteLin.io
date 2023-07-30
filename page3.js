 d3.csv("https://raw.githubusercontent.com/jeanettelin/CS416DataViz_JeanetteLin.io/main/athEvents.csv").then(function(data) {
      // Prepare data for time series line chart
      var timeSeriesData = d3.rollup(
        data,
        function(d) { return d3.sum(d, function(d) { return 1; }); },
        function(d) { return d.Year; },
        function(d) { return d.Sex; }
      );

      var timeSeriesArray = [];
      timeSeriesData.forEach(function(value, key) {
        var entry = { year: key, female: 0, male: 0, countries: {} };
        value.forEach(function(genderValue, genderKey) {
          if (genderKey === "F") {
            entry.female = genderValue;
          } else if (genderKey === "M") {
            entry.male = genderValue;
          }
        });

        // Group data by country for each year
        var countryData = d3.group(data.filter(d => d.Year === key), d => d.NOC);

        // Calculate the number of female contestants for each country
        var femaleContestantsByCountry = new Map();
        countryData.forEach(function(contestants, country) {
          var femaleCount = contestants.filter(d => d.Sex === "F").length;
          var maleCount = contestants.filter(d => d.Sex === "M").length;
          var totalContestants = contestants.length;
          var proportionFemale = femaleCount / totalContestants;
          var proportionMale = maleCount / totalContestants;
          entry.countries[country] = { female: femaleCount, male: maleCount, total: totalContestants, proportionFemale: proportionFemale, proportionMale: proportionMale };
        });

        timeSeriesArray.push(entry);
      });

      // Sort the data based on the year
      timeSeriesArray.sort(function(a, b) {
        return parseInt(a.year) - parseInt(b.year);
      });

      // Set up the SVG container
      var svgWidth = 800; // Adjust the width here
      var svgHeight = 500; // Adjust the height here
      var margin = { top: 80, right: 20, bottom: 70, left: 60 }; // Increase the top margin
      var chartWidth = svgWidth - margin.left - margin.right;
      var chartHeight = svgHeight - margin.top - margin.bottom;

      var svg = d3.select("#chart-container")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

      var chart = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Set up scales
      var x = d3.scaleLinear()
        .range([0, chartWidth])
        .domain(d3.extent(timeSeriesArray, function(d) { return parseInt(d.year); }));

      var y = d3.scaleLinear()
        .range([chartHeight, 0])
        .domain([0, 1]);

      // Define colors for lines
      var colors = {
        femaleCombined: "#FF1493", // Darker pink
        maleCombined: "#1E90FF",   // Darker blue
        femaleCountry: "#9370DB",  // Darker purple
        maleCountry: "#228B22"     // Forest green
      };

      // Prepare the line functions
      var lineFemaleCombined = d3.line()
        .x(function(d) { return x(parseInt(d.year)); })
        .y(function(d) { return y(d.female / (d.female + d.male)); });

      var lineMaleCombined = d3.line()
        .x(function(d) { return x(parseInt(d.year)); })
        .y(function(d) { return y(d.male / (d.female + d.male)); });

      var lineFemaleCountry = d3.line()
        .x(function(d) { return x(parseInt(d.year)); })
        .y(function(d) { return y(d.countries[selectedCountry]?.female / (d.countries[selectedCountry]?.total || 1)); });

      var lineMaleCountry = d3.line()
        .x(function(d) { return x(parseInt(d.year)); })
        .y(function(d) { return y(d.countries[selectedCountry]?.male / (d.countries[selectedCountry]?.total || 1)); });

      // Append combined female line to the chart (initially at y=0)
      var femaleCombinedLine = chart.append("path")
        .datum(timeSeriesArray)
        .attr("fill", "none")
        .attr("stroke", colors.femaleCombined)
        .attr("stroke-width", 3) // Adjust line thickness
        .attr("d", lineFemaleCombined);

      // Append combined male line to the chart (initially at y=0)
      var maleCombinedLine = chart.append("path")
        .datum(timeSeriesArray)
        .attr("fill", "none")
        .attr("stroke", colors.maleCombined)
        .attr("stroke-width", 3) // Adjust line thickness
        .attr("d", lineMaleCombined);

      // Initialize selected country
      var selectedCountry = "All";

      // Append country female line to the chart (initially at y=0)
      var femaleCountryLine = chart.append("path")
        .datum(timeSeriesArray)
        .attr("fill", "none")
        .attr("stroke", colors.femaleCountry)
        .attr("stroke-width", 3) // Adjust line thickness
        .style("opacity", 0) // Initially hidden
        .attr("d", lineFemaleCountry);

      // Append country male line to the chart (initially at y=0)
      var maleCountryLine = chart.append("path")
        .datum(timeSeriesArray)
        .attr("fill", "none")
        .attr("stroke", colors.maleCountry)
        .attr("stroke-width", 3) // Adjust line thickness
        .style("opacity", 0) // Initially hidden
        .attr("d", lineMaleCountry);

      // Append x-axis
      chart.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(d3.axisBottom(x).ticks(timeSeriesArray.length).tickFormat(d3.format("d")));

      // Append y-axis
      var yAxis = chart.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y).tickFormat(d3.format(".0%")));

      // Add tooltip functionality
      var tooltip = d3.select("#tooltip");

      // Append circles for pink line (Percent of All Female)
      chart.selectAll(".data-point-female")
        .data(timeSeriesArray)
        .enter()
        .append("circle")
        .attr("class", "data-point-female")
        .attr("cx", function(d) { return x(parseInt(d.year)); })
        .attr("cy", function(d) { return y(d.female / (d.female + d.male)); })
        .attr("r", 5)
        .attr("fill", colors.femaleCombined)
        .style("pointer-events", "all")
        .on("mouseover", function(event, d) {
          var countryWithMostWomen = Object.entries(d.countries).reduce(function(a, b) {
            return a[1].proportionFemale > b[1].proportionFemale ? a : b;
          });

          tooltip.style("display", "block")
            .style("left", event.pageX + "px")
            .style("top", event.pageY - 60 + "px")
            .html(
              `<strong>${d.year}</strong><br>Female Contestants: ${d.female}<br>Male Contestants: ${d.male}` +
              `<br>Proportion of Women: ${(d.female / (d.female + d.male) * 100).toFixed(1)}%` +
              `<br>Country with Most Women: ${countryWithMostWomen[0]}<br>Proportion of Women in that Country: ${(countryWithMostWomen[1].proportionFemale * 100).toFixed(1)}%`
            );
        })
        .on("mouseout", function() {
          tooltip.style("display", "none");
        });

      // Append circles for blue line (Percent of All Male)
      chart.selectAll(".data-point-male")
        .data(timeSeriesArray)
        .enter()
        .append("circle")
        .attr("class", "data-point-male")
        .attr("cx", function(d) { return x(parseInt(d.year)); })
        .attr("cy", function(d) { return y(d.male / (d.female + d.male)); })
        .attr("r", 5)
        .attr("fill", colors.maleCombined)
        .style("pointer-events", "all")
        .on("mouseover", function(event, d) {
          var countryWithMostMen = Object.entries(d.countries).reduce(function(a, b) {
            return a[1].proportionMale > b[1].proportionMale ? a : b;
          });

          tooltip.style("display", "block")
            .style("left", event.pageX + "px")
            .style("top", event.pageY - 60 + "px")
            .html(
              `<strong>${d.year}</strong><br>Female Contestants: ${d.female}<br>Male Contestants: ${d.male}` +
              `<br>Proportion of Men: ${(d.male / (d.female + d.male) * 100).toFixed(1)}%`
            );
        })
        .on("mouseout", function() {
          tooltip.style("display", "none");
        });

      // Append circles for purple line (Percent of Female of Selected Country)
      chart.selectAll(".data-point-female-country")
        .data(timeSeriesArray)
        .enter()
        .append("circle")
        .attr("class", "data-point-female-country")
        .attr("cx", function(d) { return x(parseInt(d.year)); })
        .attr("cy", function(d) { return y(d.countries[selectedCountry]?.female / (d.countries[selectedCountry]?.total || 1)); })
        .attr("r", 5)
        .attr("fill", colors.femaleCountry)
        .style("pointer-events", "all")
        .on("mouseover", function(event, d) {
          tooltip.style("display", "block")
            .style("left", event.pageX + "px")
            .style("top", event.pageY - 60 + "px")
            .html(
              `<strong>${d.year}</strong><br>Percent of Female: ${(d.countries[selectedCountry]?.proportionFemale * 100).toFixed(1)}%`
            );
        })
        .on("mouseout", function() {
          tooltip.style("display", "none");
        });

      // Append circles for green line (Percent of Male of Selected Country)
      chart.selectAll(".data-point-male-country")
        .data(timeSeriesArray)
        .enter()
        .append("circle")
        .attr("class", "data-point-male-country")
        .attr("cx", function(d) { return x(parseInt(d.year)); })
        .attr("cy", function(d) { return y(d.countries[selectedCountry]?.male / (d.countries[selectedCountry]?.total || 1)); })
        .attr("r", 5)
        .attr("fill", colors.maleCountry)
        .style("pointer-events", "all")
        .on("mouseover", function(event, d) {
          tooltip.style("display", "block")
            .style("left", event.pageX + "px")
            .style("top", event.pageY - 60 + "px")
            .html(
              `<strong>${d.year}</strong><br>Percent of Male: ${(d.countries[selectedCountry]?.proportionMale * 100).toFixed(1)}%`
            );
        })
        .on("mouseout", function() {
          tooltip.style("display", "none");
        });

      // Initialize country filter options
      var countryFilterOptions = Array.from(new Set(data.map(d => d.NOC)));
      countryFilterOptions.unshift("All");

      // Update country filter select options
      var countryFilterSelect = d3.select("#country-filter");
      countryFilterSelect.selectAll("option")
        .data(countryFilterOptions)
        .enter()
        .append("option")
        .attr("value", function(d) { return d; })
        .text(function(d) { return d; });

      // Update line chart based on country filter
      countryFilterSelect.on("change", function() {
        selectedCountry = this.value;
        updateLineChart(selectedCountry);
        updateLegend(selectedCountry);
      });

      // Clear filter
      d3.select("#clear-filter").on("click", function() {
        selectedCountry = "All";
        countryFilterSelect.property("value", "All");
        updateLineChart("All");
        updateLegend("All");
      });

      // Call the update functions with the default selected country
      countryFilterSelect.property("value", "All").dispatch("change");
      d3.select("#clear-filter").dispatch("click");


    // Update function to toggle male data points visibility
    function toggleMaleDataPoints() {
      var maleDataPointsOpacity = maleCountryLine.style("opacity");
      if (maleDataPointsOpacity == 0) {
        maleCountryLine.style("opacity", 0.7);
        chart.selectAll(".data-point-male-country").style("opacity", 1);
      } else {
        maleCountryLine.style("opacity", 0);
        chart.selectAll(".data-point-male-country").style("opacity", 0);
      }
    }

    // Attach event listener to the "Toggle Male Data Points" button
    d3.select("#toggle-male-data-points").on("click", toggleMaleDataPoints);

    // Function to update line chart based on country filter
    function updateLineChart(selectedCountry) {
      var filteredData = timeSeriesArray;
      if (selectedCountry !== "All") {
        filteredData = timeSeriesArray.filter(function(d) {
          return d.countries[selectedCountry];
        });
      }

      y.domain([0, 1]);

      // Update purple line (Percent of Female of Selected Country)
      femaleCountryLine.datum(filteredData)
        .style("opacity", selectedCountry !== "All" ? 0.7 : 0) // Adjust opacity
        .transition()
        .duration(1000)
        .attr("d", lineFemaleCountry);

      // Update green line (Percent of Male of Selected Country)
      maleCountryLine.datum(filteredData)
        .style("opacity", selectedCountry !== "All" ? 0.7 : 0) // Adjust opacity
        .transition()
        .duration(1000)
        .attr("d", lineMaleCountry);

      // Update y-axis
      yAxis.transition()
        .duration(1000)
        .call(d3.axisLeft(y).tickFormat(d3.format(".0%")));

      // Update combined female data points
      chart.selectAll(".data-point-female")
        .data(filteredData, function(d) { return d.year; })
        .transition()
        .duration(1000)
        .attr("cx", function(d) { return x(parseInt(d.year)); })
        .attr("cy", function(d) { return y(d.female / (d.female + d.male)); });

      // Update purple data points (Percent of Female of Selected Country)
      chart.selectAll(".data-point-female-country")
        .data(filteredData, function(d) { return d.year; })
        .join(
          function(enter) {
            return enter.append("circle")
              .attr("class", "data-point-female-country")
              .attr("r", 5)
              .attr("fill", colors.femaleCountry)
              .style("pointer-events", "all")
              .style("opacity", selectedCountry !== "All" ? 1 : 0)
              .attr("cx", function(d) { return x(parseInt(d.year)); })
              .attr("cy", function(d) { return y(d.countries[selectedCountry]?.female / (d.countries[selectedCountry]?.total || 1)); })
              .on("mouseover", function(event, d) {
                tooltip.style("display", "block")
                  .style("left", event.pageX + "px")
                  .style("top", event.pageY - 60 + "px")
                  .html(
                    `<strong>${d.year}</strong><br>Female Contestants: ${d.countries[selectedCountry]?.female || 0}` +
                    `<br>Proportion of Women: ${(d.countries[selectedCountry]?.proportionFemale * 100 || 0).toFixed(1)}%`
                  );
              })
              .on("mouseout", function() {
                tooltip.style("display", "none");
              });
          },
          function(update) {
            return update.style("opacity", selectedCountry !== "All" ? 1 : 0)
              .attr("cx", function(d) { return x(parseInt(d.year)); })
              .attr("cy", function(d) { return y(d.countries[selectedCountry]?.female / (d.countries[selectedCountry]?.total || 1)); });
          },
          function(exit) {
            return exit.remove();
          }
        );

      // Update combined male data points
      chart.selectAll(".data-point-male")
        .data(filteredData, function(d) { return d.year; })
        .transition()
        .duration(1000)
        .attr("cx", function(d) { return x(parseInt(d.year)); })
        .attr("cy", function(d) { return y(d.male / (d.female + d.male)); });

      // Update green data points (Percent of Male of Selected Country)
      chart.selectAll(".data-point-male-country")
        .data(filteredData, function(d) { return d.year; })
        .join(
          function(enter) {
            return enter.append("circle")
              .attr("class", "data-point-male-country")
              .attr("r", 5)
              .attr("fill", colors.maleCountry)
              .style("pointer-events", "all")
              .style("opacity", selectedCountry !== "All" ? 1 : 0)
              .attr("cx", function(d) { return x(parseInt(d.year)); })
              .attr("cy", function(d) { return y(d.countries[selectedCountry]?.male / (d.countries[selectedCountry]?.total || 1)); })
              .on("mouseover", function(event, d) {
                tooltip.style("display", "block")
                  .style("left", event.pageX + "px")
                  .style("top", event.pageY - 60 + "px")
                  .html(
                    `<strong>${d.year}</strong><br>Male Contestants: ${d.countries[selectedCountry]?.male || 0}` +
                    `<br>Proportion of Men: ${(d.countries[selectedCountry]?.proportionMale * 100 || 0).toFixed(1)}%`
                  );
              })
              .on("mouseout", function() {
                tooltip.style("display", "none");
              });
          },
          function(update) {
            return update.style("opacity", selectedCountry !== "All" ? 1 : 0)
              .attr("cx", function(d) { return x(parseInt(d.year)); })
              .attr("cy", function(d) { return y(d.countries[selectedCountry]?.male / (d.countries[selectedCountry]?.total || 1)); });
          },
          function(exit) {
            return exit.remove();
          }
        );
    }

    // Function to update legend based on country filter
  function updateLegend(selectedCountry) {
    // Select the legend container
    var legendContainer = d3.select("#legend-container");

    // Remove any existing legends
    legendContainer.selectAll("*").remove();

    // Define the legend data
    var legendData = [
      { color: colors.femaleCombined, label: "Percent of All Female" },
      { color: colors.maleCombined, label: "Percent of All Male" },
      { color: colors.femaleCountry, label: `Percent of Female of ${selectedCountry === "All" ? "All Countries" : selectedCountry}` },
      { color: colors.maleCountry, label: `Percent of Male of ${selectedCountry === "All" ? "All Countries" : selectedCountry}` }
    ];

    // Create the legend items
    var legendItems = legendContainer.selectAll(".legend-item")
      .data(legendData)
      .enter()
      .append("div")
      .attr("class", "legend-item")
      .style("display", "flex")
      .style("align-items", "center")
      .style("margin-right", "20px");

    // Append legend icons (colored squares)
    legendItems.append("div")
      .style("width", "12px")
      .style("height", "12px")
      .style("background-color", d => d.color)
      .style("margin-right", "8px");

    // Append legend labels
    legendItems.append("div")
      .text(d => d.label);
  }

  // Call the updateLegend function with the default selected country
  updateLegend("All");


function navigateToPage1() {
    window.location.href = "page1.html";
}

// Function to navigate to page 2
function navigateToPage2() {
    window.location.href = "page2.html";
}

// Function to navigate to page 3
function navigateToPage3() {
    window.location.href = "page3.html";
}

// Function to navigate pages based on direction
function navigatePages(direction) {
    var currentPage = window.location.href;
    if (direction === -1 && currentPage.includes("page2.html")) {
        // Navigate back from page 2 to page 1
        window.location.href = "page1.html";
    } 
    else if (direction === -1 && currentPage.includes("page3.html")) {
        // Navigate back from page 3 to page 2
        window.location.href = "page2.html";
    }
        else if (direction === 1 && currentPage.includes("page1.html")) {
        // Navigate from page 1 to page 2
        window.location.href = "page2.html";
    } else if (direction === 1 && currentPage.includes("page2.html")) {
        // Navigate from page 2 to page 3
        window.location.href = "page3.html";
    }
}

// Attach event listeners to the page navigation buttons
document.getElementById("page1-button").addEventListener("click", navigateToPage1);
document.getElementById("page2-button").addEventListener("click", navigateToPage2);
document.getElementById("page3-button").addEventListener("click", navigateToPage3);
document.getElementById("previous-button").addEventListener("click", function () { navigatePages(-1); });
document.getElementById("next-button").addEventListener("click", function () { navigatePages(1); });

});