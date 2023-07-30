d3.csv("https://raw.githubusercontent.com/jeanettelin/CS416DataViz_JeanetteLin.io/main/athEvents.csv").then(function(data) {
      var data = data.filter(function(d) {
        return parseInt(d.Year) <= 1948;
      });

      var timeSeriesData = d3.rollup(
        data,
        function (d) {
          return d3.sum(d, function (d) {
            return 1;
          });
        },
        function (d) {
          return d.Year;
        },
        function (d) {
          return d.Sex;
        }
      );

      var timeSeriesArray = [];
      timeSeriesData.forEach(function (value, key) {
        var entry = { year: key, female: 0, male: 0, countries: {} };
        value.forEach(function (genderValue, genderKey) {
          if (genderKey === "F") {
            entry.female = genderValue;
          } else if (genderKey === "M") {
            entry.male = genderValue;
          }
        });

        var countryData = d3.group(data.filter(d => d.Year === key), d => d.NOC);

        var femaleContestantsByCountry = new Map();
        countryData.forEach(function (contestants, country) {
          var femaleCount = contestants.filter(d => d.Sex === "F").length;
          var maleCount = contestants.filter(d => d.Sex === "M").length;
          var totalContestants = contestants.length;
          var proportionFemale = femaleCount / totalContestants;
          var proportionMale = maleCount / totalContestants;
          entry.countries[country] = { female: femaleCount, male: maleCount, total: totalContestants, proportionFemale: proportionFemale, proportionMale: proportionMale };
        });

        timeSeriesArray.push(entry);
      });

      timeSeriesArray.sort(function (a, b) {
        return parseInt(a.year) - parseInt(b.year);
      });

      var svgWidth = 900; 
      var svgHeight = 500; 
      var margin = { top: 80, right: 20, bottom: 70, left: 60 }; 
      var chartWidth = svgWidth - margin.left - margin.right;
      var chartHeight = svgHeight - margin.top - margin.bottom;

      var svg = d3.select("#chart-container")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

      var chart = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var x = d3.scaleLinear()
        .range([0, chartWidth])
        .domain(d3.extent(timeSeriesArray, function (d) { return parseInt(d.year); }));

      var y = d3.scaleLinear()
        .range([chartHeight, 0])
        .domain([0, 1]);

      var colors = {
        femaleCombined: "#FF1493", 
        maleCombined: "#1E90FF",   
        femaleCountry: "#9370DB",  
        maleCountry: "#228B22"     
      };

      var lineFemaleCombined = d3.line()
        .x(function (d) { return x(parseInt(d.year)); })
        .y(function (d) { return y(d.female / (d.female + d.male)); });

      var lineMaleCombined = d3.line()
        .x(function (d) { return x(parseInt(d.year)); })
        .y(function (d) { return y(d.male / (d.female + d.male)); });

      var lineFemaleCountry = d3.line()
        .x(function (d) { return x(parseInt(d.year)); })
        .y(function (d) { return y(d.countries[selectedCountry]?.female / (d.countries[selectedCountry]?.total || 1)); });

      var lineMaleCountry = d3.line()
        .x(function (d) { return x(parseInt(d.year)); })
        .y(function (d) { return y(d.countries[selectedCountry]?.male / (d.countries[selectedCountry]?.total || 1)); });

      var femaleCombinedLine = chart.append("path")
        .datum(timeSeriesArray)
        .attr("fill", "none")
        .attr("stroke", colors.femaleCombined)
        .attr("stroke-width", 3) 
        .attr("d", lineFemaleCombined);

  var lastDataPoint = timeSeriesArray[timeSeriesArray.length - 1];
      var xPos = x(parseInt(lastDataPoint.year));
      var yPos = y(lastDataPoint.female / (lastDataPoint.female + lastDataPoint.male));
      
      var labelBox = chart.append("rect")
        .attr("class", "data-label-box")
        .attr("x", xPos - 250) 
        .attr("y", yPos - 25) 
        .attr("width", 260) 
        .attr("height", 20) 
        .attr("fill", "white")
        .attr("stroke", colors.femaleCombined)
        .attr("stroke-width", 2);
      
      var dataLabel = chart.append("text")
        .attr("class", "data-label")
        .attr("x", xPos-120) 
        .attr("y", yPos - 10) 
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .text("Female ratio is only 10% after 40 years");


  var funfact = timeSeriesArray[timeSeriesArray.length - 3];
   
     


  var ww2fact = timeSeriesArray[timeSeriesArray.length - 1];
      var xPos = x(parseInt(ww2fact.year));
      var yPos = y(ww2fact.male / (ww2fact.female + ww2fact.male));
      var labelBoxfun = chart.append("rect")
        .attr("class", "data-label-box")
        .attr("x", xPos - 360) 
        .attr("y", yPos + 16) 
        .attr("width", 375) 
        .attr("height", 20) 
        .attr("fill", "white")
        .attr("stroke", colors.maleCombined)
        .attr("stroke-width", 2);
      
      var dataLabelww2 = chart.append("text")
        .attr("class", "data-label")
        .attr("x", xPos-170) 
        .attr("y", yPos + 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .text("1939 - 1945: Pause in Olympic Games due to World War 2");



var maleCombinedLine = chart.append("path")
.datum(timeSeriesArray)
.attr("fill", "none")
.attr("stroke", colors.maleCombined)
.attr("stroke-width", 3) 
.attr("d", lineMaleCombined);

chart.append("g")
.attr("class", "x-axis")
.attr("transform", "translate(0," + chartHeight + ")")
.call(d3.axisBottom(x).ticks(timeSeriesArray.length).tickFormat(d3.format("d")));

var yAxis = chart.append("g")
.attr("class", "y-axis")
.call(d3.axisLeft(y).tickFormat(d3.format(".0%")));

var tooltip = d3.select("#tooltip");

chart.selectAll(".data-point-female")
.data(timeSeriesArray)
.enter()
.append("circle")
.attr("class", "data-point-female")
.attr("cx", function (d) { return x(parseInt(d.year)); })
.attr("cy", function (d) { return y(d.female / (d.female + d.male)); })
.attr("r", 5)
.attr("fill", colors.femaleCombined)
.style("pointer-events", "all")
.on("mouseover", function (event, d) {
var countryWithMostWomen = Object.entries(d.countries).reduce(function (a, b) {
  return a[1].proportionFemale > b[1].proportionFemale ? a : b;
});

tooltip.style("display", "block")
.style("left", event.pageX + "px")
.style("top", event.pageY - 60 + "px")
.html(
  `<strong>${d.year}</strong><br>Female Contestants: ${d.female}<br>Male Contestants: ${d.male}` +
  `<br>Proportion of Women: ${(d.female / (d.female + d.male) * 100).toFixed(1)}%` 
);
})
.on("mouseout", function () {
tooltip.style("display", "none");
});

chart.selectAll(".data-point-male")
.data(timeSeriesArray)
.enter()
.append("circle")
.attr("class", "data-point-male")
.attr("cx", function (d) { return x(parseInt(d.year)); })
.attr("cy", function (d) { return y(d.male / (d.female + d.male)); })
.attr("r", 5)
.attr("fill", colors.maleCombined)
.style("pointer-events", "all")
.on("mouseover", function (event, d) {
var countryWithMostMen = Object.entries(d.countries).reduce(function (a, b) {
  return a[1].proportionMale > b[1].proportionMale ? a : b;
});

tooltip.style("display", "block")
.style("left", event.pageX + "px")
.style("top", event.pageY - 60 + "px")
.html(
  `<strong>${d.year}</strong><br>Female Olympians: ${d.female}<br>Male Olympians: ${d.male}` +
  `<br>Proportion of Men: ${(d.male / (d.female + d.male) * 100).toFixed(1)}%`
);
})
.on("mouseout", function () {
tooltip.style("display", "none");
});


var countryFilterOptions = Array.from(new Set(data.map(d => d.NOC)));
countryFilterOptions.unshift("All");

var countryFilterSelect = d3.select("#country-filter");
countryFilterSelect.selectAll("option")
.data(countryFilterOptions)
.enter()
.append("option")
.attr("value", function (d) { return d; })
.text(function (d) { return d; });

countryFilterSelect.on("change", function () {
selectedCountry = this.value;
updateLineChart(selectedCountry);
updateLegend(selectedCountry);
});

d3.select("#clear-filter").on("click", function () {
selectedCountry = "All";
countryFilterSelect.property("value", "All");
updateLineChart("All");
updateLegend("All");
});

countryFilterSelect.property("value", "All").dispatch("change");
d3.select("#clear-filter").dispatch("click");

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

d3.select("#toggle-male-data-points").on("click", toggleMaleDataPoints);

function updateLineChart(selectedCountry) {
var filteredData = timeSeriesArray;
if (selectedCountry !== "All") {
  filteredData = timeSeriesArray.filter(function (d) {
    return d.countries[selectedCountry];
  });
}

y.domain([0, 1]);


yAxis.transition()
  .duration(1000)
  .call(d3.axisLeft(y).tickFormat(d3.format(".0%")));

chart.selectAll(".data-point-female")
  .data(filteredData, function (d) { return d.year; })
  .transition()
  .duration(1000)
  .attr("cx", function (d) { return x(parseInt(d.year)); })
  .attr("cy", function (d) { return y(d.female / (d.female + d.male)); })
  .style("opacity", selectedCountry === "All" ? 1 : 0);

femaleCombinedLine.transition()
    .duration(1000)
    .attr("d", lineFemaleCombined);

chart.selectAll(".data-point-male")
  .data(filteredData, function (d) { return d.year; })
  .transition()
  .duration(1000)
  .attr("cx", function (d) { return x(parseInt(d.year)); })
  .attr("cy", function (d) { return y(d.male / (d.female + d.male)); })
  .style("opacity", selectedCountry === "All" ? 1 : 0);

maleCombinedLine.transition()
    .duration(1000)
    .attr("d", lineMaleCombined);

chart.selectAll(".data-point-male-country")
  .data(filteredData, function (d) { return d.year; })
  .join(
    function (enter) {
      return enter.append("circle")
        .attr("class", "data-point-male-country")
        .attr("r", 5)
        .attr("fill", colors.maleCountry)
        .style("pointer-events", "all")
        .style("opacity", selectedCountry !== "All" ? 1 : 0)
        .attr("cx", function (d) { return x(parseInt(d.year)); })
        .attr("cy", function (d) { return y(d.countries[selectedCountry]?.male / (d.countries[selectedCountry]?.total || 1)); })
        .on("mouseover", function (event, d) {
          tooltip.style("display", "block")
            .style("left", event.pageX + "px")
            .style("top", event.pageY - 60 + "px")
            .html(
              `<strong>${d.year}</strong><br>Male Contestants: ${d.countries[selectedCountry]?.male || 0}` +
              `<br>Proportion of Men: ${(d.countries[selectedCountry]?.proportionMale * 100 || 0).toFixed(1)}%`
            );
        })
        .on("mouseout", function () {
          tooltip.style("display", "none");
        });
    },
    function (update) {
      return update.style("opacity", selectedCountry !== "All" ? 1 : 0)
        .attr("cx", function (d) { return x(parseInt(d.year)); })
        .attr("cy", function (d) { return y(d.countries[selectedCountry]?.male / (d.countries[selectedCountry]?.total || 1)); });
    },
    function (exit) {
      return exit.remove();
    }
  );
}

var legendData = [
{ color: colors.femaleCombined, label: "Percent of All Female" },
{ color: colors.maleCombined, label: "Percent of All Male" },
];

function updateLegend() {
var legend = d3.select("#legend");

var legendItems = legend.selectAll(".legend-item")
.data(legendData);

var enterLegendItems = legendItems.enter()
.append("g")
.attr("class", "legend-item")
.attr("transform", function (d, i) {
  return "translate(" + (i * 130) + ", 0)";
});


enterLegendItems.append("div")
.style("width", "12px")
.style("height", "12px")
.style("background-color", d => d.color)
.style("margin-right", "8px");

legendItems.append("div")
.text(d => d.label);

enterLegendItems.append("text")
.attr("x", 40)
.attr("y", 25)
.attr("font-size", "14")
.attr("fill", "black")
.text(function (d) { return d.label; });

legendItems.exit().remove();
}

updateLegend();

function navigateToPage1() {
    window.location.href = "index.html";
}

function navigateToPage2() {
    window.location.href = "page2.html";
}

function navigateToPage3() {
    window.location.href = "page3.html";
}

function navigatePages(direction) {
    var currentPage = window.location.href;
    if (direction === -1 && currentPage.includes("page2.html")) {
        window.location.href = "index.html";
    } else if (direction === 1 && currentPage.includes("index.html")) {
        window.location.href = "page2.html";
    } else if (direction === 1 && currentPage.includes("page2.html")) {
        window.location.href = "page3.html";
    }
}

document.getElementById("page1-button").addEventListener("click", navigateToPage1);
document.getElementById("page2-button").addEventListener("click", navigateToPage2);
document.getElementById("page3-button").addEventListener("click", navigateToPage3);
document.getElementById("previous-button").addEventListener("click", function () { navigatePages(-1); });
document.getElementById("next-button").addEventListener("click", function () { navigatePages(1); });

});
