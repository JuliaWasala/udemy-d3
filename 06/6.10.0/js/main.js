/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 3 - CoinStats
*/
		
const MARGIN = { LEFT: 50, RIGHT: 100, TOP: 50, BOTTOM: 100 }
const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM

let filteredData

const svg = d3.select("#chart-area").append("svg")
  .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
  .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

const g = svg.append("g")
  .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

// time parser for x-scale
const parseTime = d3.timeParse("%d/%m/%Y")
const formatTime = d3.timeFormat("%d/%m/%Y")
// for tooltip
const bisectDate = d3.bisector(d => d.date).left

// add the line for the first time
g.append("path")
	.attr("class", "line")
	.attr("fill", "none")
	.attr("stroke", "grey")
	.attr("stroke-width", "3px")


// scales
const x = d3.scaleTime().range([0, WIDTH])
const y = d3.scaleLinear().range([HEIGHT, 0])

// axis generators
const xAxisCall = d3.axisBottom()
const yAxisCall = d3.axisLeft()
	.ticks(6)
	.tickFormat(d => `${parseInt(d / 1000)}k`)

// axis groups
const xAxis = g.append("g")
	.attr("class", "x axis")
	.attr("transform", `translate(0, ${HEIGHT})`)
const yAxis = g.append("g")
	.attr("class", "y axis")
    
// axis labels
const xLabel = g.append("text")
	.attr("class", "x axisLabel")
	.attr("y", HEIGHT + 50)
	.attr("x", WIDTH / 2)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("Time")
const yLabel = g.append("text")
	.attr("class", "axis-title")
	.attr("transform", "rotate(-90)")
	.attr("y", 6)
	.attr("dy", ".71em")
	.style("text-anchor", "end")
	.attr("fill", "#5D6971")
	.text("Market Cap ($)")

d3.json("data/coins.json").then(data => {
	filteredData = {}
	Object.keys(data).forEach(coin => {
		filteredData[coin] = data[coin].filter(coin => {
			const dataExists = (coin["24h_vol"] && coin.market_cap && coin.price_usd)
			return dataExists
		}).map(coin => {
			coin["24h_vol"] = Number(coin["24h_vol"])
			coin.market_cap = Number(coin.market_cap)
			coin.price_usd = Number(coin.price_usd)
			coin.date = parseTime(coin.date)
			return coin
		})
	})

	update()
	
}) 

$("#coin-select").on("change", update)

$("#var-select").on("change", update)

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
})



function update() {
	const t = d3.transition().duration(1000)

	const current_coin = $("#coin-select").val()
	const value = $("#var-select").val()
	const sliderValues = $("#date-slider").slider("values")

	const dataTimeFiltered = filteredData[current_coin]
		.filter(d => { 
			return ((d.date >= sliderValues[0]) && (d.date <= sliderValues[1])) 
		})
	// filter data by date

	// set scale domains
	x.domain(d3.extent(dataTimeFiltered, d => d.date))
	y.domain([
		d3.min(dataTimeFiltered, d => d[value]) / 1.005,
		d3.max(dataTimeFiltered, d => d[value]) * 1.005
	])

	const formatSi = d3.format(".2s")
	function formatAbbreviation(x) {
		const s = formatSi(x)
		switch (s[s.length - 1]) {
			case "G": return s.slice(0, -1) + "B"
			case "k": return s.slice(0, -1) + "K"
		}
		return s
	}
	// generate axes once scales have been set
	xAxisCall.scale(x)
	xAxis.transition(t).call(xAxisCall)
	yAxisCall.scale(y)
	yAxis.transition(t).call(yAxisCall.tickFormat(formatAbbreviation))

	// clear old tooltips
	d3.select(".focus").remove()
	d3.select(".overlay").remove()

	/******************************** Tooltip Code ********************************/

	const focus = g.append("g")
		.attr("class", "focus")
		.style("display", "none")

	focus.append("line")
		.attr("class", "x-hover-line hover-line")
		.attr("y1", 0)
		.attr("y2", HEIGHT)

	focus.append("line")
		.attr("class", "y-hover-line hover-line")
		.attr("x1", 0)
		.attr("x2", WIDTH)

	focus.append("circle")
		.attr("r", 7.5)

	focus.append("text")
		.attr("x", 15)
		.attr("dy", ".31em")

	g.append("rect")
		.attr("class", "overlay")
		.attr("width", WIDTH)
		.attr("height", HEIGHT)
		.on("mouseover", () => focus.style("display", null))
		.on("mouseout", () => focus.style("display", "none"))
		.on("mousemove", mousemove)

	function mousemove() {
		const x0 = x.invert(d3.mouse(this)[0])
		const i = bisectDate(dataTimeFiltered, x0, 1)
		const d0 = dataTimeFiltered[i - 1]
		const d1 = dataTimeFiltered[i]
		const d = x0 - d0[value] > d1[value] - x0 ? d1 : d0
		focus.attr("transform", `translate(${x(d.date)}, ${y(d[value])})`)
		focus.select("text").text(d[value])
		focus.select(".x-hover-line").attr("y2", HEIGHT - y(d[value]))
		focus.select(".y-hover-line").attr("x2", -x(d.date))
	}

	/******************************** Tooltip Code ********************************/
	// line path generator
	const line = d3.line()
		.x(d => x(d.date))
		.y(d => y(d[value]))

	// add line to chart
	g.select(".line")
		.transition(t)
		.attr("d", line(dataTimeFiltered))

	// update ylabel
	const newText = (value === "price_usd") ? "Price (USD)" 
		: ((value === "market_cap") ? "Market Capitalization (USD)"
			: "24 Hour Trading Volume (USD)")
	yLabel.text(newText)
}