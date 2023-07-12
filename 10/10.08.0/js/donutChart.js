/*
*    donutChart.js
*    Mastering Data Visualization with D3.js
*    Project 4 - FreedomCorp Dashboard
*/

class DonutChart {
	constructor(_parentElement) {
		this.parentElement = _parentElement

		this.initVis()
	}

	initVis() {
		this.MARGIN = { LEFT: 40, RIGHT: 100, TOP: 40, BOTTOM: 10 };
		this.WIDTH = 350 - this.MARGIN.LEFT - this.MARGIN.RIGHT;
    this.HEIGHT = 140 - this.MARGIN.TOP - this.MARGIN.BOTTOM;
    this.RADIUS = Math.min(this.WIDTH, this.HEIGHT) / 2;
		
		this.svg = d3.select(this.parentElement).append("svg")
			.attr("width", this.WIDTH + this.MARGIN.LEFT + this.MARGIN.RIGHT)
			.attr("height", this.HEIGHT + this.MARGIN.TOP + this.MARGIN.BOTTOM);
		
		this.g = this.svg.append("g")
      .attr("transform", `translate(${this.MARGIN.LEFT + (this.WIDTH / 2) - this.MARGIN.RIGHT / 2},
        ${this.MARGIN.TOP + (this.HEIGHT / 2)})`);
    
    this.pie = d3.pie()
      .padAngle(0.03)
      .value((d) => d.count)
      .sort(null);
    
    this.arc = d3.arc()
      .innerRadius(this.RADIUS - 15)
      .outerRadius(this.RADIUS);

    this.g.append("text")
      .attr("y", -60)
      .attr("x", -50)
      .attr("font-size", "12px")
      .attr("text-anchor", "start")
      .text("Company size");

    this.color = d3.scaleOrdinal(d3.schemeAccent);
		this.wrangleData();
	}

	wrangleData() {

    const sizeNest = d3
      .nest()
      .key((d) => d.company_size)
      .entries(calls);

    this.filteredData = sizeNest.map((size) => {
      return {
        value: size['key'],
        count: size.values.length,
      };
    });


		this.updateVis();
	}

	updateVis() {

    this.t = d3.transition().duration(750);

    this.path = this.g.selectAll("path")
      .data(this.pie(this.filteredData));
    
    this.path.transition(this.t).attrTween("d", this.arcTween.bind(this));

    // ENTER new elements in the array.
    this.path
      .enter()
      .append("path")
      .attr("fill", (d) => this.color(d.data.value))
      .transition(this.t)
        .attrTween("d", this.arcTween.bind(this));
  
      this.addLegend();
  }

  addLegend() {
    this.legend = this.g
      .append("g")
      .attr("transform", `translate(100,-20)`);

    this.legendArray = [
      { label: "Small", color:this.color("small")},
      { label: "Medium", color:this.color("medium")},
      { label: "Large", color:this.color("large")},];

    this.legendRow = this.legend.selectAll(".legendCol")
      .data(this.legendArray)
      .enter()
        .append("g")
        .attr("transform", (d,i) => `translate(0,${i * 20})`);

      this.legendRow
        .append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill",d => d.color);

      this.legendRow
        .append("text")
        .attr("x", 20)
        .attr("y", 10)
        .attr("text-anchor", "start")
        .text(d => d.label);
  }

  arcTween(d,j,n) {
      const i = d3.interpolate(n[j]._current, d);
      this._current = i(0);
      return (t) => this.arc(i(t));
    }
}
