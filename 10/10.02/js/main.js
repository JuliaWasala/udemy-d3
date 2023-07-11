/*
*    main.js
*    Mastering Data Visualization with D3.js
*    10.2 - File Separation
*/
/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 3 - CoinStats
*/
		
let lineChart1;
let lineChart2;
let lineChart3;
let lineChart4;
let lineChart5;

let filteredData;

// time parser for x-scale
const parseTime = d3.timeParse("%d/%m/%Y");
const formatTime = d3.timeFormat("%d/%m/%Y");

// $("#coin-select").on("change", () => lineChart.wrangleData())

$("#var-select").on("change", () => lineChart.wrangleData());

$("#date-slider").slider({
	range: true,
	min: parseTime("12/5/2013").getTime(),
	max: parseTime("31/10/2017").getTime(),
	step: 1000 * 60 * 60 * 24, // one day
	values: [parseTime("12/5/2013").getTime(), parseTime("31/10/2017").getTime()],
	slide: (event, ui) => {
		$("#dateLabel1").text(formatTime(new Date(ui.values[0])))
		$("#dateLabel2").text(formatTime(new Date(ui.values[1])))
		update()
	}
});
    
d3.json("data/coins.json").then(data => {
	filteredData = {};
	Object.keys(data).forEach(coin => {
		filteredData[coin] = data[coin].filter(coin => {
			const dataExists = (coin["24h_vol"] && coin.market_cap && coin.price_usd);
			return dataExists;
		}).map(coin => {
			coin["24h_vol"] = Number(coin["24h_vol"]);
			coin.market_cap = Number(coin.market_cap);
			coin.price_usd = Number(coin.price_usd);
			coin.date = parseTime(coin.date);
			return coin;
		})
	});
	lineChart1 = new LineChart("#chart-area-1", "bitcoin");
	lineChart2 = new LineChart("#chart-area-2", "ethereum");
	lineChart3 = new LineChart("#chart-area-3", "bitcoin_cash");
	lineChart4 = new LineChart("#chart-area-4", "litecoin");
	lineChart5 = new LineChart("#chart-area-5", "ripple");
	
	
}) 

function updateCharts() {
	lineChart1.wrangleData();
	lineChart2.wrangleData();
	lineChart3.wrangleData();
	lineChart4.wrangleData();
	lineChart5.wrangleData();
}