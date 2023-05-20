let country_filter = ["Australia"];
let colors = ["#ff073a", "green"];
let delay_baseline = 50;
            

// function addValue() {
//     if (country_filter.length > 1) {
//         country_filter.shift();
//     };
//     var input = document.getElementById("valueInput");
//     var value = input.value;
//     country_filter.unshift(value);
//     disable_choice(value, "#valueInput2");
//     DrawData(country_filter);
//     // console.log(country_filter);
// }

function addValue2() {
    var input = document.getElementById("valueInput2");
    var value = input.value;
    if (value == "") {
        console.log("none selected");
        d3.select("#path1").remove();
        d3.selectAll(".dot-1").remove();
    } else {
        if (country_filter.length > 1) {
            country_filter.pop();
        };
        country_filter.push(value);
        DrawData(country_filter);
    }
    
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
    inject_data("conformed_spider_special.csv").then((data)=> {
        // -=============== fill the options in the drop-down -----------
        // ====================================================----------
        fill_options(data);
        disable_choice("Australia", "#valueInput2");
        
        
        // ---------------- THE FEATURES ------------------------
        // get a list of features (should be the same every time). This will be used for the spider chart
        let cat_features = Object.keys(data[0]);
        // remove the first two keys "Country" and "Year", you'll have the categories
        cat_features.splice(0, 1);
        cat_features.splice(-1);
        

        // ------------------- THE DATA ------------------------
        // ---------------- THE FILTER -------------------------
        // filter by provided metrics
        //please also write unmatched condition for these ones as well
        
        let byCountry_data = [];
        for (var i = 0; i < country_filter.length; i++) {
            
            let this_country = data.filter( function(a) { return a["Country"] === country_filter[i]} )[0]
            // delete this_country["Country"];                          // again, trim the first category
            byCountry_data.push(this_country);  
        }

        console.table(byCountry_data);
        
        // ---------------------------------------------------------------------------
        // ------------- THE MAXIMUM VALUE OF ALL HAHAHAHAHAHAHHA --------------------
        // ---------------------------------------------------------------------------

        // I use reduce() function to take out the maximum value of number of Internally Displaced People (IDP) at all-time period
        // var max_val = cat_features.reduce( function(max, feature) {

        //     let max_here = d3.max(byCountry_data, (d) => d[feature]);
        //     if (max_here > max) { return max_here;}
        //     else { return max;}
        // }, 0)
        
        // console.log(max_val);   // make sure I got that right


        // -------------------------------------------------------
        // ---------- LET'S START DRAWING AHAHAHHAHA -------------
        // -------------------------------------------------------
        
        // svg moment?
        let width = 650;
        let height = 450;
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

        // ===========================================================================
        // ===============The GRID CIRCLES --=========================================
        // ===========================================================================
        // Again, the update non update double // if update goes here if new goes else
            svg.selectAll(".grid-circle")
            .data(ticks)
            .enter()
            .append("circle")
            .attr("class", "grid-circle")
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("r", 0);
            

            svg.selectAll(".grid-circle")
            .transition()
            .delay((d,i) => i*delay_baseline)
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("fill", "gray")
            .attr("fill-opacity", (d, i) => {
                return 0.2*(1/i);
            })
            .attr("stroke", "gray")
            .attr("stroke-opacity", 0.5)
            .attr("r", (d) => radarScale(d));
            
            // let's add the ticklabels
            svg.selectAll(".ticklabel")
            .data(ticks)
            .enter()
            .append("text")
            .attr("class", "ticklabel")
            .style("opacity", 0)
            .attr("x", (d) => width / 2 + radarScale(d) + 8)
            .attr("y", height / 2)
            

            svg.selectAll(".ticklabel")
            .transition()
            .delay(delay_baseline*5)
            .style("opacity", 0.2)
            .attr("text-anchor", "left")
            .text((d) => d.toString());

        
        // Convert respective angle to svg Coordinates for drawing/plotting
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
        
        // ===================================================
        // ============ AXIS TIME HHAHAHAHH ==================
        // ===================================================
        // Lines are white now hehe
        svg.selectAll("line")
            .data(featureData)
            .enter()
            .append("line")
            .attr("x1", width / 2)
            .attr("y1", height / 2)
            .attr("x2", d => d.coord[0])
            .attr("y2", d => d.coord[1])
            .attr("stroke","white")
            .attr("stroke-width","1.5px");      // line is white to create contrast?

        // ===============================================================
        // ======= draw AXIS LABEL in appropriate positions ==============
        // ===============================================================
        if (country_filter.length > 1) {        // update
            svg.selectAll(".axislabel")
            .attr("text-anchor", "middle")
            .attr("x", d => d.label_coord[0])
            .attr("y", d => d.label_coord[1])
            .text(d => d.name)
            .style("font-weight", "bold")
            .style("font-size", "20px")
            .style("opacity", 1);
        }
        else {          // new addition*
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
            .style("font-size", "20px")
            .style("opacity", 1);
        };

        // let line = d3.line();
        let line = d3.line().curve(d3.curveCatmullRom);
        
        function getPathCoordinates(data_point){
            let coordinates = [];
            for (var i = 0; i < cat_features.length; i++){
                let ft_name = cat_features[i];
                let angle = (Math.PI / 2) - (2 * Math.PI * i / cat_features.length);
                coordinates.push(angToCoor(angle, data_point[ft_name]));
            }
            coordinates.push(coordinates[0]);       // Closing the loop of the path
            return coordinates;
        }

        // ===========================================================================
        // ====================Drawing the ACTUAL DATA RADAR path=====================
        // ===========================================================================

        if (country_filter.length > 1) {
            
            svg.selectAll("path")
                .data(byCountry_data)
                .enter()
                .append("path")
                
                svg.selectAll("path")
                .attr("class", "data-path")
                .datum(d => getPathCoordinates(d))
                .transition()
                .attr("id", (d, i) => "path" + i)
                .attr("d", line)
                .attr("stroke-width", 3)
                .attr("stroke", (_, i) => colors[i])
                .attr("fill", (_, i) => colors[i])
                .attr("fill-opacity", 0.25)
                .attr("stroke-opacity", 1)
                .attr("value", (_, i) => byCountry_data[i].Country);
                
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
                .text((d, i) => { if (country_filter[i] != "None") { return country_filter[i]} else { return ""}} )
                .attr("font-size","24px");
            } else {
                
            svg.selectAll("path")
                .data(byCountry_data)
                .enter()
                .append("path")
                .datum(d => getPathCoordinates(d))
                .transition(0.5)
                .attr("class", "data-path") 
                .attr("id", (d, i) => "path" + i)
                .attr("d", line)
                .attr("stroke-width", 3)
                .attr("stroke", (_, i) => colors[i])
                .attr("fill", (_, i) => colors[i])
                .attr("fill-opacity", 0.25)
                .attr("stroke-opacity", 1)
                .attr("value", (_, i) => byCountry_data[i].Country);
            
                svg.selectAll(".legends")
                .data(byCountry_data)
                .enter()
                .append("text")
                .attr("class", "legends")
                .transition(0.5)
                .attr("x", 10)
                .attr("y", (_, i) => 30*(i+1))
                .attr("fill",(_, i) => colors[i])
                .text((d, i) => { if (country_filter[i] != "None") { return country_filter[i]} else { return ""}} )
                .attr("font-size","24px");
            }    


        // =================================================================
        // ------------------ draw the dots for visibility -----------------
        // -----------------------------------------------------------------
        function getDotCoordinates() {
            dotArray = [];
            for (var i = 0; i < byCountry_data.length; i++) {
                let dataArray = getPathCoordinates(byCountry_data[i]);
                dataArray.pop();
                dotArray.push(...dataArray);
            }
            
            // console.log(dotArray);   
            return dotArray;
        }

        // console.log(getDotCoordinates());
        if (country_filter.length > 1) {
            svg.selectAll(".data-dot")
            .data(getDotCoordinates())
            .enter()
            .append('circle')
            .attr("class", (d,i) => {
                if (i < 5 ) { return "dot-0 data-dot"}
                else { return "dot-1 data-dot"}
            })
        
            svg.selectAll('.data-dot')
            .transition()
            // .delay(250)
            .attr("cx", d => d[0])
            .attr("cy", d => d[1])
            .attr("r", 5)
            .attr("fill", (d,i) => { if (i < 5) {return colors[0];} else {return colors[1]}})
            .attr("opacity", 0.5);
            
        } else {
            
            svg.selectAll(".data-dot")
            .data(getDotCoordinates())
            .enter()
            .append("circle")
            .transition()
            // .delay(250)
            .attr("class", (d,i) => {
                if (i < 5 ) { return "dot-0 data-dot"}
                else { return "dot-1 data-dot"}
            })
            .attr("cx", d => d[0])
            .attr("cy", d => d[1])
            .attr("r", 5)
            .attr("fill", (d,i) => { if (i < 5) {return colors[0];} else {return colors[1]}})
            .attr("opacity", 0.5);
        }

        // ========================================================================
        // ================================== HOW ABOUT TEXTS? ====================
        // ========================================================================
        // Let's get some data
        function getData_ext() {
            let dat_array = [];

            byCountry_data.forEach((data, i) => {
                cat_features.forEach((cat) => {
                    dat_array.push(data[cat]);
                })
            })
            return dat_array;
        }

       // ===========================================================================
       // ================Let's try to do the Tooltips===============================
       // ===========================================================================
        let tooltip = d3.select("#tooltip");
        let comp_tooltip = d3.select("#comp-tooltip");

        d3.selectAll("path")
        //   .transition()
          .on("mouseover", function(event) { 
            if (this.getAttribute("value") === "Australia") { tooltip.style("opacity", 1);}
            else { tooltip.style("opacity", 0.2);}
            populateTooltip(tooltip, document.querySelector("#path0"));
            if (country_filter.length > 1) {
                if (this.getAttribute("value") === "Australia") { tooltip.transition().style("opacity", 1); comp_tooltip.transition().style("opacity", 0.2)}
                else { tooltip.transition().style("opacity", 0.2); comp_tooltip.transition().style("opacity", 1);}
                populateTooltip(comp_tooltip, document.querySelector("#path1"));    
            }
            d3.selectAll("path").attr("opacity", 0.2);
            this.setAttribute("opacity", 1)
        })
          .on("mouseout", () => { tooltip.transition().style("opacity", 0);comp_tooltip.transition().style("opacity", 0);d3.selectAll("path").attr("opacity", 1);d3.selectAll(".tool").attr("opacity", 1)})
          .on("mousemove", function(event) {
            tooltip.style("left", () => {
                if ( event.clientX < document.documentElement.clientWidth/2) {
                    return event.pageX - 250 + "px"
                } else { 
                    return event.pageX + 50 + "px"
                }
               }) 
               .style("bottom", (document.documentElement.clientHeight - event.pageY) + "px")
            
            comp_tooltip.style("left", () => {
                if ( event.clientX < document.documentElement.clientWidth/2) {
                    return event.pageX + 80 + "px"
                } else { 
                    return event.pageX + 380 + "px"
                }
               }) 
               .style("bottom", (document.documentElement.clientHeight - event.pageY) + "px")
            
          })

        
        // Populate the tooltip texts with relevant data
        function populateTooltip(tooltip, path) {

            inject_data("conformed_spider_value.csv").then( (data) => {
                tooltip.html( () => {
                    let pathCountry = path.getAttribute("value");

                    console.log(tooltip);
                    // Set the colors for the tooltip
                    if (path.getAttribute("id") == "path0") { console.log("the 1"); tooltip.style("color", colors[0])} else { tooltip.style("color", colors[1])}
    
                    let countryData = data.find(obj => obj.Country === pathCountry);
                    return `
                        <h2>${countryData.Country}</h2>
                        <p>unit of<em> Internally</em></p> 
                        <p><em>Displaced Population</em></p>
                        <p>----------------------------</p>
                        <table style="color: black" class="tooltip-table">
                            <thead>
                                <tr>
                                    <th>Hazard Type</th>
                                    <th>IDPs (person)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Wildfire</td> 
                                    <td>${d3.format(',')(countryData.Wildfire)}</td>
                                </tr>
                                <tr>
                                    <td>Mass movement</td> 
                                    <td>${d3.format(',')(countryData["Mass movement"])}</td>
                                </tr>
                                <tr>
                                    <td>Earthquake</td> 
                                    <td>${d3.format(',')(countryData.Earthquake)}</td>
                                </tr>
                                <tr>
                                    <td>Flood</td> 
                                    <td>${d3.format(',')(countryData.Flood)}</td>
                                </tr>
                                <tr>
                                    <td>Storm</td> 
                                    <td>${d3.format(',')(countryData.Wildfire)}</td>
                                </tr>
                            </tbody>
                        </table>
                    `;
                })
                
                // =====================================================
                // =============Always raise the smaller on top=========
                // =====================================================

                // I'm pretty proud of myself cuz of this section hahahah
                if (country_filter.length > 1) {
                    let val1 = document.querySelector("#path0").getAttribute("value");
                    let val2 = document.querySelector("#path1").getAttribute("value");
                    let countryData1 = data.find(obj => obj.Country === val1).AvgIDP;
                    let countryData2 = data.find(obj => obj.Country === val2).AvgIDP;

                    if (countryData1 < countryData2) {
                        d3.select("#path0").raise();
                    } else { d3.select("#path1").raise();}
                }
            })
        }



        

    }); // closing for data selection
    
    // the whole section is based on a tutorial from 
    // https://yangdanny97.github.io/blog/2019/03/01/D3-Spider-Chart



}
            
           