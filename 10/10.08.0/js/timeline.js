/*
 *    timeline.js
 *    Mastering Data Visualization with D3.js
 *    Project 4 - FreedomCorp Dashboard
 */

class Timeline {
  constructor(_parentElement) {
    this.parentElement = _parentElement;

    this.initVis();
  }

  initVis() {
    this.MARGIN = { LEFT: 40, RIGHT: 30, TOP: 0, BOTTOM: 30 };
    this.WIDTH = 800 - this.MARGIN.LEFT - this.MARGIN.RIGHT;
    this.HEIGHT = 130 - this.MARGIN.TOP - this.MARGIN.BOTTOM;

    this.svg = d3
      .select(this.parentElement)
      .append("svg")
      .attr("width", this.WIDTH + this.MARGIN.LEFT + this.MARGIN.RIGHT)
      .attr("height", this.HEIGHT + this.MARGIN.TOP + this.MARGIN.BOTTOM);

    this.g = this.svg
      .append("g")
      .attr("transform", `translate(${this.MARGIN.LEFT}, ${this.MARGIN.TOP})`);

    // scales
    this.x = d3.scaleTime().range([0, this.WIDTH]);
    this.y = d3.scaleLinear().range([this.HEIGHT, 0]);

    // x-axis
    this.xAxisCall = d3.axisBottom().ticks(4);
    this.xAxis = this.g
      .append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0, ${this.HEIGHT})`);

    this.areaPath = this.g.append("path").attr("fill", "#ccc");

    // initialize brush component
    this.brush = d3
      .brushX()
      .handleSize(10)
      .extent([
        [0, 0],
        [this.WIDTH, this.HEIGHT],
      ])
    	.on("brush end", brushed);

    // append brush component
    this.brushComponent = this.g
      .append("g")
      .attr("class", "brush")
      .call(this.brush);

    this.wrangleData();
  }

  wrangleData() {
    this.variable = $("#var-select").val();

    this.dayNest = d3
      .nest()
      .key((d) => formatDate(d.date))
      .entries(calls);

    // calculate daily totals of this.variable, and keep date

    this.dataFiltered = this.dayNest.map((day) => {
      return day.values.reduce(
        (acc, cur) => {
          acc.date = formatDate(cur.date);
          acc.total += cur[this.variable];
          return acc;
        },
        { total: 0 }
      );
    });

    this.updateVis();
  }

  updateVis() {
    this.t = d3.transition().duration(1000);

    // update scales
    this.x.domain(d3.extent(this.dataFiltered, (d) => parseDate(d.date)));
    this.y.domain([
      0,
      d3.max(this.dataFiltered, (d) => d.total) * 1.005,
    ]);

    // update axes
    this.xAxisCall.scale(this.x);
    this.xAxis.transition(this.t).call(this.xAxisCall);

    // area path generator
    this.area = d3
      .area()
      .x((d) => this.x(parseDate(d.date)))
      .y0(this.HEIGHT)
      .y1((d) => this.y(d.total));

    this.areaPath.data([this.dataFiltered]).attr("d", this.area);
  }
}
