function fill_options(data) {
    let choice_list = data.map( elem => elem.Country);
    // console.log(choice_list);


    d3.select('#valueInput')
      .selectAll("option")
      .data(choice_list)
      .enter()
      .append("option")
      .attr("value", (d) => d)
      .text((d) => d);

      d3.select('#valueInput2')
      .selectAll("option")
      .data(choice_list)
      .enter()
      .append("option")
      .attr("value", (d) => d)
      .text((d) => d);
    
}

function disable_choice(choice, id) {
    console.log(id);
    d3.select(id)
        .selectAll("option")
        .attr('disabled', null)
        .filter(function(d) { return d === choice;})
        .attr('disabled', true);
}



