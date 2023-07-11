/*
*    lineChart.js
*    Mastering Data Visualization with D3.js
*    10.6 - D3 Brushes
*/

class LineChart {
	formatSi = d3.format(".2s");

	constructor(_parentElement) {
		const vis = this;
		vis.parentElement = _parentElement;
		vis.initVis();
	}

	initVis() {
		const vis = this;
		vis.MARGIN = { LEFT: 100, RIGHT: 100, TOP: 50, BOTTOM: 100 };
		vis.WIDTH = 800 -vis.MARGIN.LEFT -vis.MARGIN.RIGHT;
		vis.HEIGHT = 350 -vis.MARGIN.TOP -vis.MARGIN.BOTTOM;

		vis.svg = d3.select(vis.parentElement).append("svg")
		.attr("width",vis.WIDTH +vis.MARGIN.LEFT +vis.MARGIN.RIGHT)
		.attr("height",vis.HEIGHT +vis.MARGIN.TOP +vis.MARGIN.BOTTOM);

		vis.g =vis.svg.append("g")
		.attr("transform", `translate(${vis.MARGIN.LEFT}, ${vis.MARGIN.TOP})`);


		// for tooltip
		vis.bisectDate = d3.bisector(d => d.date).left;

		// add the line for the first time
		vis.g.append("path")
			.attr("class", "line")
			.attr("fill", "none")
			.attr("stroke", "grey")
			.attr("stroke-width", "3px");

		// axis labels
		vis.xLabel = vis.g.append("text")
			.attr("class", "x axisLabel")
			.attr("y",vis.HEIGHT + 50)
			.attr("x",vis.WIDTH / 2)
			.attr("font-size", "20px")
			.attr("text-anchor", "middle")
			.text(vis.coin);

		// scales
		vis.x = d3.scaleTime().range([0,vis.WIDTH]);
		vis.y = d3.scaleLinear().range([vis.HEIGHT, 0]);

		// axis generators
		vis.xAxisCall = d3.axisBottom()
			.ticks(3);
		vis.yAxisCall = d3.axisLeft()
			.ticks(6)
			.tickFormat(d => `${parseInt(d / 1000)}k`);

		// axis groups
		vis.xAxis = vis.g.append("g")
			.attr("class", "x axis")
			.attr("transform", `translate(0, ${vis.HEIGHT})`);
		vis.yAxis = vis.g.append("g")
			.attr("class", "y axis");

		this.wrangleData();
	}

	wrangleData() {
		const vis = this;
		vis.value = $("#var-select").val();
		vis.coin = $("#coin-select").val();

		vis.sliderValues = $("#date-slider").slider("values");
		vis.dataTimeFiltered = filteredData[vis.coin]
			.filter(d => { 
				return ((d.date >= vis.sliderValues[0]) && (d.date <= vis.sliderValues[1])) 
			});
		// filter data by date

		vis.updateVis();
	}

	updateVis() {
		const vis = this;
		vis.t = d3.transition().duration(1000);

		// set scale domains
		vis.x.domain(d3.extent(vis.dataTimeFiltered, d => d.date));
		vis.y.domain([
			d3.min(vis.dataTimeFiltered, d => d[vis.value]) / 1.005,
			d3.max(vis.dataTimeFiltered, d => d[vis.value]) * 1.005
		]);
		
		// generate axes once scales have been set
		vis.xAxisCall.scale(vis.x);
		vis.xAxis.transition(vis.t).call(vis.xAxisCall);
		vis.yAxisCall.scale(vis.y);
		vis.yAxis.transition(vis.t).call(vis.yAxisCall.tickFormat(formatAbbreviation));

		// clear old tooltips
		d3.select(".focus").remove();
		d3.select(".overlay").remove();

		/******************************** Tooltip Code ********************************/

		vis.focus = vis.g.append("g")
			.attr("class", "focus")
			.style("display", "none");

		vis.focus.append("line")
			.attr("class", "x-hover-line hover-line")
			.attr("y1", 0)
			.attr("y2",vis.HEIGHT);

		vis.focus.append("line")
			.attr("class", "y-hover-line hover-line")
			.attr("x1", 0)
			.attr("x2",vis.WIDTH);

		vis.focus.append("circle")
			.attr("r", 7.5);

		vis.focus.append("text")
			.attr("x", 15)
			.attr("dy", ".31em");

		vis.g.append("rect")
			.attr("class", "overlay")
			.attr("width",vis.WIDTH)
			.attr("height",vis.HEIGHT)
			.on("mouseover", () => vis.focus.style("display", null))
			.on("mouseout", () => vis.focus.style("display", "none"))
			.on("mousemove", mousemove);

	 	function mousemove(event){

			const x0 = vis.x.invert(d3.pointer(event)[0]);
			const i = vis.bisectDate(vis.dataTimeFiltered, x0, 1);
			const d0 = vis.dataTimeFiltered[i - 1];
			const d1 = vis.dataTimeFiltered[i];
			const d = x0 - d0[vis.value] > d1[vis.value] - x0 ? d1 : d0;
			vis.focus.attr("transform", `translate(${vis.x(d.date)}, ${vis.y(d[vis.value])})`);
			vis.focus.select("text").text(d[vis.value]);
			vis.focus.select(".x-hover-line").attr("y2",vis.HEIGHT - vis.y(d[vis.value]));
			vis.focus.select(".y-hover-line").attr("x2", -vis.x(d.date));
		};

		/******************************** Tooltip Code ********************************/
		// line path generator
		vis.line = d3.line()
			.x(d => vis.x(d.date))
			.y(d => vis.y(d[vis.value]));

		// add line to chart
		vis.g.select(".line")
		.attr("stroke", color(vis.coin))
		.transition(vis.t)
			.attr("d", vis.line(vis.dataTimeFiltered));

	function formatAbbreviation(x) {
		const s = vis.formatSi(x);
		switch (s[s.length - 1]) {
			case "G": return s.slice(0, -1) + "B"
			case "k": return s.slice(0, -1) + "K"
		}
		return s
	};
}
}
