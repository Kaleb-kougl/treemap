const HTTP = new XMLHttpRequest();
const URL = ("https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json");
const URL2 = ("https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json");
HTTP.open("GET", URL2);
HTTP.send();

let dataset;

HTTP.onreadystatechange = function(){
    if (this.readyState == 4 && this.status == 200) {
        dataset = JSON.parse(HTTP.responseText);
        console.log(dataset);
        d3Commands();
    } else {
        console.log("something went wrong");
    }
}

function d3Commands() {
  // console.log(dataset);

  const HEIGHT = 600;
  const WIDTH = 1250;

  let color = d3.scaleOrdinal(d3.schemePaired);

   // SVG
  const svg = d3.select('body')
   .append('svg')
   .attr('height', HEIGHT + 'px')
   .attr('width', WIDTH + 'px');
  //  treemaplayout

  let treemap = d3.treemap()
    .size([WIDTH, HEIGHT])
    // .paddingOuter(15)

  //  gets root node
  let rootNode = d3.hierarchy(dataset)
  rootNode.sum(function(d) {
    return d.value;
  })
  .sort(function(a, b) { return b.height - a.height || b.value - a.value; });

  function enteringTreemap(d) {

    treemap.tile(d3.treemapSquarify.ratio(d))
    treemap(rootNode)

    let nodes = d3.select(this)
      .append('g')
      .attr('transform', 'translate(0, 20)')
      .selectAll('g')
      .data(rootNode.descendants())
      .enter()
      .append('g')
      .attr('transform', function(d) {return 'translate(' + [d.x0, d.y0] + ')'})
  
    nodes
      .append('rect')
      .attr('width', function(d) { return d.x1 - d.x0; })
      .attr('height', function(d) { return d.y1 - d.y0; })
      .attr('fill', function(d) { 
        // if (d.children !== null) {
        //   console.log(color(d.parent.name)); 
        // }
        return d.children ? null : color(d.parent.data.name) 
      });

  
    nodes
      .append('text')
      .attr('dx', 4)
      .attr('dy', 14)
      .text(function(d) {
        return d.data.name;
      })
  }

  treemaps = d3.select('body')
  .selectAll('svg')
  .each(enteringTreemap)

}