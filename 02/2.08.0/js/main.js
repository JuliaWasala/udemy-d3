/*
*    main.js
*    Mastering Data Visualization with D3.js
*    2.8 - Activity: Your first visualization!
*/

const svg = d3.select("#chart-area").append("svg")
        .attr("width", 500)
        .attr("height", 500)

d3.json("data/buildings.json").then((data) => {
	data.forEach((d) => {
		d.height=Number(d.height)

        const circles = svg.selectAll("circle")
            .data(data)

        circles.enter().append("rect")
            .attr("x", (d, i) => (i * 50) + 50)
            .attr("y", 20)
            .attr("width", 40)
            .attr("height", (d) => d.height)
            .attr("fill", "grey")
        })
}).catch(error => {console.log(error)})
