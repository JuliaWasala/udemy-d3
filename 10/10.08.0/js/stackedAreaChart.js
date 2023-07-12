/*
 *    stackedAreaChart.js
 *    Source: https://bl.ocks.org/mbostock/3885211
 *    Mastering Data Visualization with D3.js
 *    FreedomCorp Dashboard
 */

class StackedAreaChart {
  constructor(_parentElement) {
    this.parentElement = _parentElement;

    this.initVis();
  }

  initVis() {
    // TODO
    this.MARGIN = { TOP: 20, RIGHT: 30, BOTTOM: 30, LEFT: 40 };
    this.WIDTH = 800 - this.MARGIN.LEFT - this.MARGIN.RIGHT;
    this.HEIGHT = 350 - this.MARGIN.TOP - this.MARGIN.BOTTOM;

    this.svg = d3
      .select(this.parentElement).append('svg')
      .attr("width", this.WIDTH + this.MARGIN.LEFT + this.MARGIN.RIGHT)
      .attr("height", this.HEIGHT + this.MARGIN.TOP + this.MARGIN.BOTTOM);

    this.g = this.svg
      .append("g")
      .attr("transform", `translate(${this.MARGIN.LEFT}, ${this.MARGIN.TOP})`);

    // axes
    this.x = d3.scaleTime().range([0, this.WIDTH]);
    this.y = d3.scaleLinear().range([this.HEIGHT, 0]);
    this.z = d3.scaleOrdinal(d3.schemePastel1);

    this.yAxisCall = d3.axisLeft();
    this.xAxisCall = d3.axisBottom().ticks(4);
    this.xAxis = this.g
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0,${this.HEIGHT})`);
    this.yAxis = this.g.append("g").attr("class", "axis axis--y");

    this.stack = d3.stack().keys(["west", "south", "northeast", "midwest"]);

    this.area = d3
      .area()
      .x((d, i) => this.x(parseDate(d.data.date)))
      .y0((d, i) => this.y(d[0]))
      .y1((d, i) => this.y(d[1]));

    this.wrangleData();
  }

  wrangleData() {
    this.variable = $("#var-select").val();
    this.dayNest = d3
      .nest()
      .key((d) => formatDate(d.date))
      .entries(calls);

    // huh hier was ik echt nooit zelf op gekomen
    this.dataFiltered = this.dayNest.map((day) =>
      day.values.reduce(
        (acc, cur) => {
          acc.date = day.key;
          acc[cur.team] = acc[cur.team] + cur[this.variable];
          return acc;
        },
        { west: 0, south: 0, northeast: 0, midwest: 0 }
      )
    );

    this.updateVis();
  }

  updateVis() {
    this.t = d3.transition().duration(750);

    // get maximum sum of values of this.variable (y-axis) in one day
    this.maxY = d3.max(this.dataFiltered, (d) => {
      const day_totals= Object.keys(d).map(key => key !== "date" ? d[key] : 0? d[key] : 0);
      return d3.sum(day_totals);});
    // this.maxY = d3.max(this.dataFiltered, d => d3.sum(this.keys, k => d[k]));

    // update scales
    this.x.domain(d3.extent(this.dataFiltered, (d) => parseDate(d.date)));
    this.y.domain([0, this.maxY]);
    this.z.domain(["west", "south", "northeast", "midwest"]);

    // call axes
    this.xAxisCall.scale(this.x);
    this.xAxis.transition(this.t).call(this.xAxisCall);

    this.yAxisCall.scale(this.y);
    this.yAxis.transition(this.t).call(this.yAxisCall);

    this.teams = this.g
      .selectAll(".team")
      .data(this.stack(this.dataFiltered));

    // update paths
    this.teams.select(".area")
      .attr("d", this.area);

    this.teams
      .enter()
      .append("g")
      .attr("class", d => `team ${d.key}`)
      .append("path")
      .attr("class", "area")
      .transition(this.t)
      .attr("d", this.area)
      .style("fill", d=> this.z(d.key))
      .style("fill-opacity", 0.5);

    this.addLegend();
  }

  addLegend() {
    this.legend = this.g
      .append("g")
      .attr("transform", `translate(200, -15)`);

    this.legendArray = [
      { label: "Northeast", color:this.z("northeast")},
      { label: "Midwest", color:this.z("midwest")},
      { label: "South", color:this.z("south")},
      { label: "West", color:this.z("west")},];

    this.legendCol = this.legend.selectAll(".legendCol")
      .data(this.legendArray)
      .enter()
        .append("g")
        .attr("transform", (d,i) => `translate(${i * 150},0)`);

      this.legendCol
        .append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill",d => d.color);

      this.legendCol
        .append("text")
        .attr("x", 20)
        .attr("y", 10)
        .attr("text-anchor", "start")
        .text(d => d.label);
  }
}
