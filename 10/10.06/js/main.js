/*
 *    main.js
 *    Mastering Data Visualization with D3.js
 *    10.6 - D3 Brushes
 */

let lineChart;
let donutChart1;
let donutChart2;
let timeline;

let filteredData = {};
let donutData = [];

const color = d3.scaleOrdinal(d3.schemePastel1);

// time parser for x-scale
const parseTime = d3.timeParse("%d/%m/%Y");
const formatTime = d3.timeFormat("%d/%m/%Y");

$("#coin-select").on("change", () => updateCharts());
$("#var-select").on("change", () => updateCharts());

$("#date-slider").slider({
  range: true,
  min: parseTime("12/5/2013").getTime(),
  max: parseTime("31/10/2017").getTime(),
  step: 1000 * 60 * 60 * 24, // one day
  values: [
    parseTime("12/5/2013").getTime(), 
    parseTime("31/10/2017").getTime()
  ],
  slide: (event, ui) => {
    const dates = ui.values.map(val=> new Date(val));
    const xVals = dates.map(date => timeline.x(date));
    
    timeline.brushComponent.call(timeline.brush.move,xVals);
  },
});

d3.json("data/coins.json").then((data) => {
  Object.keys(data).forEach((coin) => {
    filteredData[coin] = data[coin]
      .filter((coin) => {
        const dataExists = coin["24h_vol"] && coin.market_cap && coin.price_usd;
        return dataExists;
      })
      .map((coin) => {
        coin["24h_vol"] = Number(coin["24h_vol"]);
        coin.market_cap = Number(coin.market_cap);
        coin.price_usd = Number(coin.price_usd);
        coin.date = parseTime(coin.date);
        return coin;
      });
    donutData.push({
      coin: coin,
      data: filteredData[coin].slice(-1)[0],
    });
  });

  lineChart1 = new LineChart("#line-area");
  donutChart1 = new DonutChart("#donut-area1", "24h_vol");
  donutChart2 = new DonutChart("#donut-area2", "market_cap");
  timeline = new TimeLine("#timeline-area");
});

function brushed(event) {
  const selection = event.selection || timeline.x.range();
  const newValues = selection.map(timeline.x.invert);

  $("#date-slider")
    .slider("values", 0, newValues[0])
    .slider("values", 1, newValues[1]);
  $("#dateLabel1").text(formatTime(newValues[0]));
  $("#dateLabel2").text(formatTime(newValues[1]));

  lineChart1.wrangleData();
}

function arcClicked(event,arc) {
  d3.select("#coin-select").property("value", arc.data.coin);
  updateCharts();
}

function updateCharts() {
  lineChart1.wrangleData();
  donutChart1.wrangleData();
  donutChart2.wrangleData();
  timeline.wrangleData();
}
