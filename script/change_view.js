function changeView(host, viewName) {
    d3.selectAll('.content-block')
      .style("display", "none");

    d3.selectAll('.link')
      .classed('selected', false);

    d3.select(`#${viewName}`)
      .style("display", "block");
    
    d3.select(`#${host}`).classed('selected', true);
    // d3.select(this).classed('selected', true);

}