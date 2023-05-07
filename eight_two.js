function __init__() {
    
		// console.table(dataset, ["date", "number"]);	// check if dataset is loaded correctly
		barChart();
}

function barChart(dataset) {
    var w = 800;
    var h = 500;
	

	var projection = d3.geoMercator()
					   .center([145, -36.525])
					   .translate([w/2 , h/2])
					   .scale(4200);

	var path = d3.geoPath()
				 .projection(projection);

	// set up canvas
    var svg = d3.select("#viz_area")
                        .append("svg")
                        .attr("width", w)
                        .attr("height", h)
						.attr("fill", "grey");



	// dataset loading (and feeding into drawing)
	d3.csv("VIC_LGA_unemployment.csv", function(input) {
		return {
			lga_name: input.LGA,
			unemp_num: input.unemployed
		}
	}).then( function(data) {
		// console.log(data.length);
		
		// color scheme/scale set up
		var colorSch = d3.scaleQuantize()
					 .domain([
						d3.min(data, (d) => d.unemp_num),
						d3.max(data, (d) => d.unemp_num)
					 ])
					 .range(['#edf8fb','#b3cde3','#8c96c6','#8856a7','#810f7c']);
		
		// merging/joining datasets (the geo-path json file and csv datafile on LGAs' names)
		// somehow, the book's method does not work when directly editing the json passed-in object.
		// I have opt it to use .then() to feed the json (pre-edit) object to the following function
		d3.json("LGA_VIC.json").then(function(json) {	// <--- passed in "json" reference
			
			// .. then do my editing/merging here. this will affect the passed-in "json" reference above

			// merge and loop through each CSV unemployement data
			// remember that this is still within the .then() call from CSV data input, hence the use of 
			// .. the data in that section (such as "data.length")
			for (var i = 0; i < data.length; i++) {
				// LGA name grabbing
				var dataLGA = data[i].lga_name;
				// also grab the unemployment number
				var dataValue = data[i].unemp_num;

				// Now we put umemployment data into the JSON's file as different attributes for each LGA
				for (var j = 0; j < json.features.length; j++) {

					// get LGA name for look up
					var jsonLGA = json.features[j].properties["LGA_name"];

					// if match, put the data into the json's LGA object property array
					if ( dataLGA == jsonLGA ) {

						// copy time when match
						json.features[j].properties.value = dataValue;

						// stop looping
						break;
					}
				}
			}

			// now we draw the map
			var allPaths = svg.selectAll("path")
				.data(json.features)
				.enter()
				.append("path")
				.attr("d", path)
				.attr("class", "LGA_map_area")
				.style("stroke", "black") // put some borders for better visibility?
				.style("stroke-width", "0.5px")	// light strokes
				.style("fill", function(d) {
					var value = d.properties.value;

					if (value) {
						return colorSch(value);
					} // suggested by the Book 
					else {
						return "#ccc";
					}
				})
				
			allPaths.append("title")
					.text( (d) => d.properties["LGA_name"] + "\n" + d.properties.value + " unemployed" );
			
			allPaths.on("mouseover", function() {
						d3.select(this)
						.style("fill", "yellow");
						})
					.on("mouseout", function() {
						d3.select(this)
						.style("fill", function(d) {
							var value = d.properties.value;
		
							if (value) {
								return colorSch(value);
							} // suggested by the Book 
							else {
								return "#ccc";
							}
						})
					});

			d3.csv("VIC_city.csv").then(function(cityData) {
		
							// draw the circles/dots of cities/hotspots
			var cities = svg.selectAll("circle")
							.data(cityData)
							.enter()
							.append("circle")
							.attr("class", "city")
							.attr("cx", (d) => projection([d.lon,d.lat])[0])
							.attr("cy", (d) => projection([d.lon,d.lat])[1])
							.attr("r", 5)
							.style("fill", "#de2d26")
							.style("stroke", "gray")
							.style("stroke-width", 1);
					// add the titles for the cities
					cities.append("title")
						.text( (d) => d.place );
					
					// some hover properties to highlight when mouse is over
							cities.on("mouseover", function() { d3.select(this).style("fill", "yellow")})
								.on("mouseout", function() {d3.select(this).style("fill", "#de2d26")})
				});
		});
	});  
}	


window.onload = __init__;