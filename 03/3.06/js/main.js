/*
*    main.js
*    Mastering Data Visualization with D3.js
*    3.6 - Band scales
*/

const svg = d3.select("#chart-area").append("svg")
  .attr("width", 400)
  .attr("height", 400)

d3.json("data/buildings.json").then(data => {
  data.forEach(d => {
    d.height = Number(d.height)
  })

  const y = d3.scaleLinear().domain([0, 828]).range([0, 400])
  const x= d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, 400])
      .paddingInner(0.3)
      .paddingOuter(0.2)

  const rects = svg.selectAll("rect")
    .data(data)
  
  rects.enter().append("rect")
    .attr("y", 0)
    .attr("x", (d) => x(d.name))
    .attr("width", x.bandwidth)
    .attr("height", d => y(d.height))
    .attr("fill", "grey")
}).catch(error => {console.log(error)})