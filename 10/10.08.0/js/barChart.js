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
    let vis = this;

    vis.MARGIN = { TOP: 20, RIGHT: 30, BOTTOM: 30, LEFT: 40 };
    vis.WIDTH = 250 - vis.MARGIN.LEFT - vis.MARGIN.RIGHT;
    vis.HEIGHT = 130 - vis.MARGIN.TOP - vis.MARGIN.BOTTOM;

    vis.svg = d3
      .select(vis.parentElement)
      .append("svg")
      .attr("width", vis.WIDTH + vis.MARGIN.LEFT + vis.MARGIN.RIGHT)
      .attr("height", vis.HEIGHT + vis.MARGIN.TOP + vis.MARGIN.BOTTOM);
    vis.g = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.MARGIN.LEFT + vis.WIDTH / 2},${
          vis.MARGIN.TOP + vis.HEIGHT / 2
        })`
      );

    // axes
    vis.x = d3.scaleBand().rangeRound([0, vis.WIDTH]).padding(0.1);
    vis.y = d3.scaleLinear().rangeRound([vis.HEIGHT, 0]);

    vis.g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0,${vis.HEIGHT})`)
      .call(d3.axisBottom(vis.x));

    vis.g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(vis.y).ticks(10, "%"))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Frequency");


    vis.wrangleData();
  }

  wrangleData() {
    let vis = this;

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    vis.x.domain(
      data.map(function (d) {
        return d.letter;
      })
    );
    // TODO update val
    vis.y.domain([
      0,
      d3.max(data, function (d) {
        return d.frequency;
      }),
    ]);

    vis.g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", function (d) {
        return vis.x(d.letter);
      })
      .attr("y", function (d) {
        return vis.y(d.frequency);
      })
      .attr("width", vis.x.bandwidth())
      .attr("height", function (d) {
        return vis.HEIGHT - vis.y(d.frequency);
      });
  }

}

