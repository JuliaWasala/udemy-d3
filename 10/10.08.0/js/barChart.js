/*
 *    barChart.js
 *    Source: https://bl.ocks.org/mbostock/3885304
 *    Mastering Data Visualization with D3.js
 *    FreedomCorp Dashboard
 */

class BarChart {
  constructor(_parentElement, _variable) {
    this.parentElement = _parentElement;
    this.variable = _variable;

    this.initVis();
  }

  initVis() {
    this.MARGIN = { LEFT: 60, RIGHT: 50, TOP: 30, BOTTOM: 30 };
    this.WIDTH = 350 - this.MARGIN.LEFT - this.MARGIN.RIGHT;
    this.HEIGHT = 130 - this.MARGIN.TOP - this.MARGIN.BOTTOM;

    this.svg = d3
      .select(this.parentElement)
      .append("svg")
      .attr("width", this.WIDTH + this.MARGIN.LEFT + this.MARGIN.RIGHT)
      .attr("height", this.HEIGHT + this.MARGIN.TOP + this.MARGIN.BOTTOM);
    this.g = this.svg
      .append("g")
      .attr(
        "transform",
        `translate(${this.MARGIN.LEFT},${
          this.MARGIN.TOP
        })`
      );

    // axes
    this.x = d3.scaleBand().rangeRound([0, this.WIDTH]).padding(0.1);
    this.y = d3.scaleLinear().rangeRound([this.HEIGHT, 0]);

    this.yAxisCall = d3.axisLeft().ticks(4);
    this.xAxisCall = d3
      .axisBottom();
    this.xAxis = this.g
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0,${this.HEIGHT})`);
    this.yAxis = this.g.append("g").attr("class", "axis axis--y");

    this.yLabel = this.variable === "units_sold" ? "Units sold per call" : (this.variable == "call_revenue" ? "Average call revenue (USD)" : "Average call duration (seconds)");
    
    this.g
      .append("text")
      .attr("y", -15)
      .attr("x", -50)
      .attr("font-size", "12px")
      .attr("text-anchor", "start")
      .text(this.yLabel);

    this.color = d3.scaleOrdinal(d3.schemeAccent);

    this.wrangleData();
  }

  wrangleData() {
    const categoryNest = d3
      .nest()
      .key((d) => d.category)
      .entries(calls);

    this.filteredData = categoryNest.map((category) => {
      return {
        value: category["key"],
        count:
          this.variable === "units_sold"
            ? this.get_sum(category.values)
            : this.get_mean(category.values),
      };
    });

    this.updateVis();
  }

  get_sum = (arr) =>
    arr.reduce((acc, n) => {
      acc += n[this.variable];
      return acc;
    }, 0);

  get_mean = (arr) => this.get_sum(arr) / arr.length;

  
  updateVis() {
    this.t = d3.transition().duration(1000);

    this.x.domain(
      this.filteredData.map((d) => d.value)
    );
    // TODO update val
    this.y.domain([
      0,
      d3.max(this.filteredData, d=>d.count),
    ]);

    this.xAxisCall.scale(this.x);
    this.xAxis.transition().duration(500).call(this.xAxisCall);

    this.yAxisCall.scale(this.y);
    this.yAxis.transition().duration(500).call(this.yAxisCall);

    this.rects = this.g.selectAll("rect").data(this.filteredData, d=>d.value);

    this.rects.exit()
      .attr("class", "exit")
      .transition(this.t)
        .attr("height", 0)
        .attr("y", this.HEIGHT)
        .style("fill-opacity", "0.1")
        .remove();

    this.rects
      .attr("class","update")
      .transition(this.t)
        .attr("y", d=>this.y(d.count))
        .attr("height", d=>this.HEIGHT - this.y(d.count))
        .attr("x", d=>this.x(d.value))
        .attr("width", this.x.bandwidth);

    this.rects
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d=> this.x(d.value))
      .attr("y", d=>this.y(d.count))
      .attr("width", this.x.bandwidth())
      .attr("height", d=> this.HEIGHT - this.y(d.count))
      .attr("fill", (d) => this.color(d.value));
  }
}
