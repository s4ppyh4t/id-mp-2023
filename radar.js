let country_filter = ["Australia"];
            let colors = ["red", "green"];
            

			function addValue() {
				if (country_filter.length > 1) {
					country_filter.shift();
				};
				var input = document.getElementById("valueInput");
				var value = input.value;
				country_filter.unshift(value);
				disable_choice(value, "#valueInput2");
				DrawData(country_filter);
				// console.log(country_filter);
			}

            function addValue2() {
                if (country_filter.length > 1) {
                    country_filter.pop();
                };
                var input = document.getElementById("valueInput2");
                var value = input.value;
                country_filter.push(value);
				disable_choice(value, "#valueInput");
                DrawData(country_filter);
                // console.log(country_filter);
            }


            // now, to generate the number of TICKS
            function tickGen(min, max, num) {
                        let ticks = [];
                        let tick_val = (max - min) / (num - 1);
                        // console.log(tick_val);
                        
                        for (let i = 0; i < num; i++) {
                            ticks.push(Math.round(tick_val * i, 3));        // Round it up 
                        }
                        
                        return ticks;
                        
                    }

            function DrawData() {
            // test data injection
                inject_data("./conformed_spider_2.csv").then((data)=> {
                    // -=============== fill the options in the drop-down -----------
					// ====================================================----------
					fill_options(data);
					
					
					// ---------------- THE FEATURES ------------------------
                    // get a list of features (should be the same every time). This will be used for the spider chart
                    let cat_features = Object.keys(data[0]);
                    // remove the first two keys "Country" and "Year", you'll have the categories
                    cat_features.splice(0, 1);
                    

                    // ------------------- THE DATA ------------------------
                    // ---------------- THE FILTER -------------------------
                    // filter by provided metrics
                    //please also write unmatched condition for these ones as well
                    let byCountry_data = [];
                    for (var i = 0; i < country_filter.length; i++) {
                        let this_country = data.filter( function(a) { return a["Country"] === country_filter[i] } )[0]
                        // delete this_country["Country"];                          // again, trim the first category
                        byCountry_data.push(this_country);  // only the first one heeh
                    }

                    console.table(byCountry_data);
                    
                    // ---------------------------------------------------------------------------
                    // ------------- THE MAXIMUM VALUE OF ALL HAHAHAHAHAHAHHA --------------------
                    // ---------------------------------------------------------------------------

                    // I use reduce() function to take out the maximum value of number of Internally Displaced People (IDP) at all-time period
                    var max_val = cat_features.reduce( function(max, feature) {

                        let max_here = d3.max(byCountry_data, (d) => d[feature]);
                        if (max_here > max) { return max_here;}
                        else { return max;}
                    }, 0)
                    
                    // console.log(max_val);   // make sure I got that right


                    // -------------------------------------------------------
                    // ---------- LET'S START DRAWING AHAHAHHAHA -------------
                    // -------------------------------------------------------
                    
                    // svg moment?
                    let width = 600;
                    let height = 500;
                    let svg = d3.select("#viz")
                                .attr("width", width)
                                .attr("height", height);
                    let radarScale = d3.scaleLinear()
                                        .domain([0, 1])
                                        .range([0, 200])
                                        .clamp(false);
                    // console.log(max_val);
                    

                    // use the maximum value generated above to generate the number of ticks
                    // let ticks = tickGen(0, max_val, 5);

                    let ticks = [0, 0.25, 0.50, 0.75, 1.00];

                    // console.log(ticks); // I GOT THE TICKS

                    // Again, the update non update double
                    if (country_filter.length > 1) {
                        svg.selectAll(".grid-circle")
                        .data(ticks)
                        .enter()
                        .append("circle")
                        .attr("class", "grid-circle")

                        svg.selectAll(".grid-circle")
                        .transition()
                        .attr("cx", width / 2)
                        .attr("cy", height / 2)
                        .attr("fill", "none")
                        .attr("stroke", "gray")
                        .attr("r", (d) => radarScale(d));
                        
                        // let's add the ticklabels
                        svg.selectAll(".ticklabel")
                        .data(ticks)
                        .enter()
                        .append("text")
                        .attr("class", "ticklabel")
                        

                        svg.selectAll(".ticklabel")
                        .transition()
                        .attr("text-anchor", "left")
                        .attr("opacity", "0.2")
                        .attr("x", (d) => width / 2 + radarScale(d) + 8)
                        .attr("y", height / 2)
                        .text((d) => d.toString());

                    } else {

                        svg.selectAll(".grid-circle")
                        .data(ticks)
                        .enter()
                        .append("circle")
                        .attr("class", "grid-circle")
                        .attr("cx", width / 2)
                        .attr("cy", height / 2)
                        .attr("fill", "none")
                        .attr("stroke", "gray")
                        .attr("r", (d) => radarScale(d));
                        
                        // let's add the ticklabels
                        svg.selectAll(".ticklabel")
                        .data(ticks)
                        .enter()
                        .append("text")
                        .attr("class", "ticklabel")
                        .attr("text-anchor", "left")
                        .attr("opacity", "0.2")
                        .attr("x", (d) => width / 2 + radarScale(d) + 8)
                        .attr("y", height / 2)
                        .text((d) => d.toString());
                    }
                    
                    function angToCoor(angle, value){
                        let x = Math.cos(angle) * radarScale(value);
                        let y = Math.sin(angle) * radarScale(value);
                        return [width / 2 + x, height / 2 - y];
                    }


                    // creating the grids
                    let featureData = cat_features.map((f, i) => {
                        let angle = (Math.PI / 2) - (2 * Math.PI * i / cat_features.length);
                        return {
                            "name": f,
                            "angle": angle,
                            "coord": angToCoor(angle, 1),
                            "label_coord": angToCoor(angle, 1.05)
                        };
                    });
                    

                    // draw axis time
                    svg.selectAll("line")
                        .data(featureData)
                        .enter()
                        .append("line")
                        .attr("x1", width / 2)
                        .attr("y1", height / 2)
                        .attr("x2", d => d.coord[0])
                        .attr("y2", d => d.coord[1])
                        .attr("stroke","black");
            
                    // draw axis label based on whether it is
                    if (country_filter.length > 1) {        // update
                        svg.selectAll(".axislabel")
                        .transition()
                        .attr("text-anchor", "middle")
                        .attr("x", d => d.label_coord[0])
                        .attr("y", d => d.label_coord[1])
                        .text(d => d.name)
                        .style("font-weight", "bold")
                        .style("font-size", "20px");
                    }
                    else {          // new
                    // double as updates
                    svg.selectAll(".axislabel")
                        .data(featureData)
                        .enter()
                        .append("text")
                        .attr("text-anchor", "middle")
                        .attr("x", d => d.label_coord[0])
                        .attr("y", d => d.label_coord[1])
                        .text(d => d.name)
                        .style("font-weight", "bold")
                        .style("font-size", "20px");
                    };

                    let line = d3.line();
                    
                    
                    // console.log(cat_features);
                    
                    

                    function getPathCoordinates(data_point){
                        let coordinates = [];
                        for (var i = 0; i < cat_features.length; i++){
                            let ft_name = cat_features[i];
                            let angle = (Math.PI / 2) - (2 * Math.PI * i / cat_features.length);
                            coordinates.push(angToCoor(angle, data_point[ft_name]));
                        }
                        coordinates.push(coordinates[0]);
                        return coordinates;
                    }

                    // console.log(byCountry_data);
                    
                    if (country_filter.length > 1) {
                        
                        svg.selectAll("path")
                            .data(byCountry_data)
                            .enter()
                            .append("path")
                            
                            svg.selectAll("path")
                            .datum(d => getPathCoordinates(d))
                            .transition()
                            .attr("d", line)
                            .attr("stroke-width", 3)
                            .attr("stroke", (_, i) => colors[i])
                            .attr("fill", (_, i) => colors[i])
                            .attr("fill-opacity", 0.25)
                            .attr("stroke-opacity", 1);
                        
                        svg.selectAll(".legends")
                            .data(byCountry_data)
                            .enter()
                            .append("text")
                            .attr("class", "legends")

                        svg.selectAll(".legends")
                            .transition()
                            .attr("x", 10)
                            .attr("y", (_, i) => 30*(i+1))
                            .attr("fill",(_, i) => colors[i])
                            .text((d, i) => country_filter[i])
                            .attr("font-size","24px");
                    } else {

                        svg.selectAll("path")
                            .data(byCountry_data)
                            .enter()
                            .append("path")
                            .datum(d => getPathCoordinates(d))
                            .transition()
                            .attr("d", line)
                            .attr("stroke-width", 3)
                            .attr("stroke", (_, i) => colors[i])
                            .attr("fill", (_, i) => colors[i])
                            .attr("fill-opacity", 0.25)
                            .attr("stroke-opacity", 1);
                        
                            svg.selectAll(".legends")
                            .data(byCountry_data)
                            .enter()
                            .append("text")
                            .attr("class", "legends")
                            .transition()
                            .attr("x", 10)
                            .attr("y", (_, i) => 30*(i+1))
                            .attr("fill",(_, i) => colors[i])
                            .text((d, i) => country_filter[i])
                            .attr("font-size","24px");
                    }    
                        
                });
                
                // the whole section is based on a tutorial from 
                // https://yangdanny97.github.io/blog/2019/03/01/D3-Spider-Chart



            }
            
           