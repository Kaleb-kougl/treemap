const HTTP = new XMLHttpRequest();
const URL = ("https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json");
const URL2 = ("https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json");
HTTP.open("GET", URL2);
HTTP.send();

let dataset;

HTTP.onreadystatechange = function(){
    if (this.readyState == 4 && this.status == 200) {
        dataset = JSON.parse(HTTP.responseText);
        // console.log(dataset);
        // console.log(window.screen.availHeight);
        // console.log(window.screen.availWidth);
        d3Commands();
    } else {
        console.log("something went wrong");
    }
}

function d3Commands() {
  // console.log(dataset);

  const HEIGHT = window.screen.availHeight < 400 ? 500 : window.screen.availHeight;
  const WIDTH = window.screen.availWidth;
  const PADDING = {
    top: 50,
    bottom: 100,
    right: 0,
    left: 0,
  }

  let color = d3.scaleOrdinal(d3.schemePaired);

   // SVG
  const svg = d3.select('body')
   .append('svg')
   .attr('height', HEIGHT + 'px')
   .attr('width', WIDTH + 'px');

   // TITLE
  svg.append('text')
  .attr("y", (15))
  .attr("x", (WIDTH / 2))
  .style("text-anchor", "middle")
  .attr('id', "title")
  .attr('font-size', '14pt')
  .attr('font-weight', 'bold')
  .text("Movie Sales");

  // DESCRIPTION
  svg.append('text')
    .attr("y", (35))
    .attr("x", (WIDTH / 2))
    .style("text-anchor", "middle")
    .attr('id', "description")
    .text("Top 100 Highest Grossing Movies Grouped By Genre");

  // tooltip 
  const tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .attr('id', 'tooltip')
    .attr('data-name', '')
    .attr('data-category', '')
    .attr('data-value', '')
    .attr('opacity', 0);
  
   //  treemaplayout
  let treemap = d3.treemap()
    .size([(WIDTH - PADDING.left - PADDING.right), (HEIGHT - PADDING.top - PADDING.bottom)])

  //  gets root node
  let rootNode = d3.hierarchy(dataset)
  rootNode.sum(function(d) {
    return d.value;
  })
  .sort(function(a, b) { return b.height - a.height || b.value - a.value; });

  function enteringTreemap(d) {
    // How to tile the treemap
    treemap.tile(d3.treemapSquarify.ratio(d))
    treemap(rootNode)

    // add nodes to svg
    let nodes = d3.select(this)
      .append('g')
      .attr('transform', 'translate(0,' + PADDING.top + ')')
      .selectAll('g')
      .data(rootNode.descendants())
      .enter()
      .append('g')
      .attr('transform', function(d) {return 'translate(' + [d.x0, d.y0] + ')'})
  
      // adding rects to nodes
    nodes
      .append('rect')
      .attr('width', function(d) { return d.x1 - d.x0; })
      .attr('height', function(d) { return d.y1 - d.y0; })
      .attr('class', function(d) {
        if (d.height === 0) {
          return 'tile'
        }
      })
      .attr('data-name', (d) => {
        if (d.height === 0) {
          return d.data.name;
        }
      })
      .attr('data-category', function(d) {
        if (d.height === 0) {
          return d.data.category;
        }
      })
      .attr('data-value', function(d) {
        if (d.height === 0) {
          return d.data.value;
        }
      })
      .attr('fill', function(d) { 
        // console.log(d);
        return d.children ? null : color(d.parent.data.name) 
      })
      .on('mouseover', function(d, i) {
        tooltip.transition()
          .duration(0)
          .attr('data-name', (d, i) => this.getAttribute('data-name'))
          .attr('data-category', (d, i) => this.getAttribute('data-category'))
          .attr('data-value', (d, i) => this.getAttribute('data-value'))
          .style('opacity', 0.9);
        tooltip.html(`Name: ${this.getAttribute('data-name')}<br>
        Category: ${this.getAttribute('data-category')}<br>
        Value: ${this.getAttribute('data-value')}`)
          .style('left', (d3.event.pageX) + 10 + 'px')
          .style('top', (d3.event.pageY) + 'px')
      })
      .on('mouseout', function(d, i) {
        tooltip.transition()
          .duration(200)
          .attr('data-year', '')
          .style('opacity', 0);
      });

      // adding text to nodes
    nodes
      .append('text')
      .attr('dx', 4)
      .attr('dy', 14)
      .text(function(d) {
        return d.data.name;
      })
  }

  const LEGEND_RECT_HEIGHT = 20;
  const LEGEND_RECT_WIDTH = 20;
  const LEGEND_PADDING_SCALE= 5;

  // Legends
  let legend = svg.append("g")
    .attr("class", "legend")
    .attr('id', 'legend')
    .attr("transform","translate(0, 0)")
    .style("font-size","12px")
    .selectAll('g')
    .data([
      {category: "Action"},
      {category: "Drama"},
      {category: "Adventure"},
      {category: "Family"},
      {category: "Animation"},
      {category: "Comedy"},
      {category: "Biography"},
    ])
    .enter().append('g');

  legend.append('rect')
    .attr('y', (d, i) => HEIGHT - PADDING.bottom + LEGEND_RECT_HEIGHT)
    .attr('x', (d, i) => i * LEGEND_RECT_WIDTH * LEGEND_PADDING_SCALE)
    .attr('height', LEGEND_RECT_HEIGHT)
    .attr('class', 'legend-item')
    .attr('width', LEGEND_RECT_WIDTH)
    .attr('fill', (d, i) => color(d.category))
    .attr('stroke-width', 1.5)
    .attr('stroke', 'black');

  legend.append('text')
    .attr('y', (d, i) => HEIGHT - PADDING.bottom + LEGEND_RECT_HEIGHT + (LEGEND_RECT_HEIGHT / 1.3))
    .attr('x', (d, i) => (i * LEGEND_RECT_WIDTH * LEGEND_PADDING_SCALE) + LEGEND_RECT_WIDTH)
    .style('fill', 'black')
    .attr('weight', 'bold')
    .attr('font-size', '12pt')
    .text((d, i) => d.category);

  treemaps = d3.select('body')
  .selectAll('svg')
  .each(enteringTreemap)
}