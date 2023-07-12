/*
 *    main.js
 *    Mastering Data Visualization with D3.js
 *    Project 4 - FreedomCorp Dashboard
 */
let stackedAreaChart;
let donutChart;
let barChart1;
let barChart2;
let barChart3;
let timeLine;

let calls;
let fullCalls;

let sliderValues = [new Date(2016, 0, 1), new Date(2016, 11, 31)];

// TODO check date format
const parseDate = d3.timeParse("%d/%m/%Y");
const formatDate = d3.timeFormat("%d/%m/%Y");

const color = d3.scaleOrdinal(d3.schemePastel1);

d3.select("#var-select").on("change", () => {
  stackedAreaChart.wrangleData();
  timeLine.wrangleData();
});

d3.json("data/calls.json").then((data) => {
  data.forEach((d) => {
    d.date = parseDate(d.date);
    d.units_sold = Number(d.units_sold);
    d.call_revenue = Number(d.call_revenue);
    d.call_duration = Number(d.call_duration);
  });

  calls = data;
  fullCalls = data;

  // for bar chart:
  // units sold per call, per electronics

  // timeline static data:
  // sum of stacked data

  stackedAreaChart = new StackedAreaChart("#stacked-area");
  donutChart = new DonutChart("#company-size");
  barChart1 = new BarChart("#units-sold", "units_sold");
  barChart2 = new BarChart("#revenue", "call_revenue");
  barChart3 = new BarChart("#call-duration", "call_duration");
  timeLine = new Timeline("#timeline");
});

function brushed() {
  // TODO reset if brush is deleted
  const selection = d3.event.selection || timeLine.x.range();
  sliderValues = selection.map(timeLine.x.invert);

  calls = fullCalls.filter((d) => {
    return d.date >= sliderValues[0] && d.date <= sliderValues[1];
  });

  updateCharts();
}

function updateCharts() {
  stackedAreaChart.wrangleData();
  donutChart.wrangleData();
  barChart1.wrangleData();
  barChart2.wrangleData();
  barChart3.wrangleData();
}
