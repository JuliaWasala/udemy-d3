/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/

const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 }
const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM

const svg = d3.select("#chart-area").append("svg")
  .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
  .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

const g = svg.append("g")
  .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

let year=0

// SCALES
const x = d3.scaleLog()
      .base(10)
	  .domain([142,150000])
      .range([0, WIDTH])
const y = d3.scaleLinear()
  .domain([0, 90])
  .range([HEIGHT, 0])
const area = d3.scaleLinear()
  .domain([2000, 1400000000])
  .range([25*Math.PI,1500*Math.PI])
const color=d3.scaleOrdinal(d3.schemePastel1)

// LABELS
const xLabel=g.append("text")
  .attr("x", WIDTH / 2)
  .attr("y", HEIGHT + 50)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("GDP per Capita ($)")

const yLabel = g.append("text")
	.attr("y", -40)
	.attr("x", -170)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.text("Life Expectancy (Years)")

const timeLabel = g.append("text")
    .attr("x", WIDTH -80)
    .attr("y", HEIGHT -50)
	.attr("font-size", "50px")
	.attr("opacity", "0.4")
	.attr("text-anchor", "middle")
	.text("1800")


const xAxisCall = d3.axisBottom(x)
  .tickValues([400, 4000, 40000])
  .tickFormat(d3.format("$"));
g.append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0, ${HEIGHT})`)
  .call(xAxisCall)

const yAxisCall = d3.axisLeft(y)
g.append("g")
  .attr("class", "y axis")
  .call(yAxisCall)


d3.json("data/data.json").then(data => {

  const formattedData = data.map(year => {
	return year["countries"].filter(country => {
		const dataExists = (country.income && country.life_exp)
		return dataExists
		}).map(country => {
			country.income=Number(country.income)
			country.life_exp=Number(country.life_exp)
			country.population=Number(country.population)
			return country
		})
	})

  d3.interval(() => {
	if (year < 2015-1800) year +=1
    else year = 0
    update(formattedData[year])
  }, 100)

  update(formattedData[0])
})
  
function update(data) {
  const t = d3.transition()
    .duration(100)

  const circles = g.selectAll("circle")
    .data(data, d => d.country)

  circles.exit().remove()
  
  circles.enter().append("circle")
    .attr("fill", d => color(d.continent))
    .merge(circles)
    .transition(t)
      .attr("cx", (d) => x(d.income))
      .attr("cy", d => y(d.life_exp))
	  .attr("r", d => Math.sqrt(area(d.population) / Math.PI))
  
  timeLabel.text(year+1800)
}