let country_filter = ["Australia"];
let colors = ["#e31a1c", "#33a02c"];
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
    document.getElementById("cur-country").innerHTML = value;
    d3.select('#table-country').html(value);
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
        console.table(country_filter);
        // =======================================================
        // Let's populate the details table
        inject_data("conformed_spider_value.csv").then( function(countryValue) {

            let ausData = countryValue.find(item => item.Country==="Australia")
            
            d3.select('#aus-flood').html(d3.format(',')(ausData.Flood))
            d3.select('#aus-mass').html(d3.format(',')(ausData['Mass movement']))
            d3.select('#aus-vol').html(d3.format(',')(ausData['Volcanic eruption']))
            d3.select('#aus-earth').html(d3.format(',')(ausData.Earthquake))
            d3.select('#aus-wild').html(d3.format(',')(ausData.Wildfire))
            d3.select('#aus-storm').html(d3.format(',')(ausData.Storm))
            
            if (country_filter.length > 1 && country_filter[1] != "Country") {
                let conData = countryValue.find(item => item.Country===country_filter[1])
                d3.select('#con-flood').html(d3.format(',')(conData.Flood))
                d3.select('#con-mass').html(d3.format(',')(conData['Mass movement']))
                d3.select('#con-vol').html(d3.format(',')(conData['Volcanic eruption']))
                d3.select('#con-earth').html(d3.format(',')(conData.Earthquake))
                d3.select('#con-wild').html(d3.format(',')(conData.Wildfire))
                d3.select('#con-storm').html(d3.format(',')(conData.Storm))

            } else{
                d3.select('#con-flood').html(0);
                d3.select('#con-mass').html(0);
                d3.select('#con-vol').html(0);
                d3.select('#con-earth').html(0);
                d3.select('#con-wild').html(0);
                d3.select('#con-storm').html(0);
            }
        })

        // -------------------------------------------------------
        // ---------- LET'S START DRAWING AHAHAHHAHA -------------
        // -------------------------------------------------------
        
        // svg moment?
        let width = 650;
        let height = 450;
        let svg1 = d3.select("#viz")
                     .attr("width", width)
                     .attr("height", height)
                     .attr("viewBox", `0 0 ${width} ${height}`);

        let svg = d3.select("#svg-group")
        let radarScale = d3.scaleLinear()
                            .domain([0, 1])
                            .range([0, 200])
                            .clamp(false);         
        
        // ===========================================================================
        // ===============The GRID CIRCLES --=========================================
        // ===========================================================================     
        
        let ticks = [0, 0.25, 0.50, 0.75, 1.00];
        // console.log(ticks); // I GOT THE TICKS

            svg.selectAll(".grid-circle")
            .data(ticks)
            .enter()
            .append("circle")
            .attr("class", "grid-circle")
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("r", 0)
            .append("title")
            .text("This percentage represents the percentile ranking of\na country's specific IDP compared to other countries'\nwithin the same disaster class");
            

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
            
            // ========================================================================
            // ===================== THE TICK LABELS ==================================
            svg.selectAll(".ticklabel")
            .data(ticks)
            .enter()
            .append("text")
            .attr("class", "ticklabel")
            .attr("text-anchor", "middle")
            .style("opacity", 0)
            .attr("x", (d) => width / 2 + radarScale(d) + 25)   // 25 seems to be the sweet point for anchoring the tick labels
            .attr("y", height / 2)
            .style("font-size", "1.2vw");
            
            

            svg.selectAll(".ticklabel")
            .transition()
            .delay(delay_baseline*5)
            .style("opacity", 0.5)
            .text((d) => d3.format('.0%')(d));

        
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
                "label_coord": angToCoor(angle, 1.15)
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
            .attr("class", "axislabel")
            .text(d => d.name)
            .attr("value", d => d.name)
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
            .attr("class", "axislabel")
            .attr("text-anchor", "middle")
            .attr("x", d => d.label_coord[0])
            .attr("y", d => d.label_coord[1])
            .text(d => d.name)
            .attr("value", d => d.name)
            .style("font-weight", "bold")
            .style("font-size", "20px")
            .style("opacity", 1);
        };

        
        
        // ===========================================================================
        // ====================Drawing the ACTUAL DATA RADAR path=====================
        // ===========================================================================
        
        // console.log("by country data", byCountry_data)
        // ================================================
        // use this space to sort the higher at the bottom
        if (country_filter.length > 1) {
            if ((byCountry_data[0].AvgIDP < byCountry_data[1].AvgIDP) && byCountry_data[1].Country != "Cuba") { byCountry_data.push(byCountry_data[0]); byCountry_data.shift()} else{ byCountry_data = byCountry_data};
        }
        
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


        if (country_filter.length > 1) {
            
            svg.selectAll(".data-path")
                .data(byCountry_data)
                .enter()
                .append("path")
                .attr("class", "data-path")
                
                svg.selectAll(".data-path")
                .datum(d => getPathCoordinates(d))
                .transition()
                .attr("id", (d, i) => "path" + i)
                .attr("d", line)
                .attr("stroke-width", 3)
                .attr("stroke", (_,i) => { if (byCountry_data[0].Country == "Australia") { return colors[i]} else {return  colors[Math.abs(i-1)]}} )
                .attr("fill", (_, i) => { if (byCountry_data[0].Country == "Australia") { return colors[i]} else {return  colors[Math.abs(i-1)]}})
                .style("fill-opacity", 0.1)
                .style("stroke-opacity", 1)
                .attr("value", (_, i) => byCountry_data[i].Country);
                
                
                
            } else {
                
            svg.selectAll(".data-path")
                .data(byCountry_data)
                .enter()
                .append("path")
                .attr("class", "data-path") 
                .datum(d => getPathCoordinates(d))
                .transition(0.5)
                .attr("id", (d, i) => "path" + i)
                .attr("d", line)
                .attr("stroke-width", 3)
                .attr("stroke", (d, i) => { if (byCountry_data[0].Country == "Australia") { return colors[i]} else {return  colors[Math.abs(i-1)]}})
                .attr("fill", (d, i) => { if (byCountry_data[0].Country == "Australia") { return colors[i]} else {return  colors[Math.abs(i-1)]}})
                .style("fill-opacity", 0.1)
                .style("stroke-opacity", 1)
                .attr("value", (_, i) => byCountry_data[i].Country);

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
                if (i < cat_features.length ) { return "dot-0 data-dot"}
                else { return "dot-1 data-dot"}
            })
        
            svg.selectAll('.data-dot')
            .transition()
            // .delay(250)
            .attr("cx", d => d[0])
            .attr("cy", d => d[1])
            .attr("r", 5)
            .attr("fill", (d,i) => { if (byCountry_data[0].Country == "Australia") { if (i < cat_features.length) {return colors[0];} else {return colors[1]}} else { if (i < cat_features.length) {return colors[1];} else {return colors[0]}} })
            .attr("opacity", 0.5);
            
        } else {
            
            svg.selectAll(".data-dot")
            .data(getDotCoordinates())
            .enter()
            .append("circle")
            .transition()
            // .delay(250)
            .attr("class", (d,i) => {
                if (i < cat_features.length ) { return "dot-0 data-dot"}
                else { return "dot-1 data-dot"}
            })
            .attr("cx", d => d[0])
            .attr("cy", d => d[1])
            .attr("r", 5)
            .attr("fill", (d,i) => { if (i < cat_features.length) {return colors[0];} else {return colors[1]}})
            .attr("opacity", 0.5);
        }

        // ========================================================================
        // ================================== HOW ABOUT TEXTS? ====================
        // ==========(basically the percentile data value)=================
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


        if (country_filter.length > 1) {
            svg.selectAll(".data-text")
            .data(getDotCoordinates())
            .enter()
            .append('text')
            .attr("class", (d,i) => {
                
                if (i < cat_features.length ) { return "text-0 data-text"}
                else { return "text-1 data-text"}
            })
        
            svg.selectAll('.data-text')
            .transition()
            // .delay(250)
            .attr("x", d => d[0])
            .attr("y", d => d[1] - 10)
            .attr("color", (d,i) => { if (i < cat_features.length) {return colors[0];} else {return colors[1]}})
            .attr("opacity", 0)
            .style("text-anchor", "middle")
            .style("font-size", "1.2em")
            .style("font-weight", "bold")
            .text((_,i) => d3.format('.2%')(getData_ext()[i]));
            
        } else {
            
            svg.selectAll(".data-text")
            .data(getDotCoordinates())
            .enter()
            .append("text")
            .transition()
            // .delay(250)
            .attr("class", (d,i) => {
                if (i < cat_features.length ) { return "text-0 data-text"}
                else { return "text-1 data-text"}
            })
            .attr("x", d => d[0])
            .attr("y", d => d[1] - 10)
            .attr("color", (d,i) => { if (i < cat_features.length) {return colors[0];} else {return colors[1]}})
            .attr("opacity", 0)
            .style("text-anchor", "middle")
            .style("font-size", "1.2em")
            .style("font-weight", "bold")
            .text((_,i) => d3.format('.2%')(getData_ext()[i]));
        }

        // these texts will be made visible later on path hover.
        


        getData_ext();


       // ===========================================================================
       // ================Let's try to do the Tooltips===============================
       // ===========================================================================
       // Update #2: Turning tooltips
        let tooltip = d3.select("#tooltip");
        // let comp_tooltip = d3.select("#comp-tooltip");       // we don't need this anymore

        // d3.selectAll("path")        // we will now change this to "axislabel"
        d3.selectAll(".axislabel")        // our new selection for tooltip
        //   .transition()
        .on("mouseover", function(event) { 
            d3.selectAll(".grid-circle").style("opacity", 0.1); // make the spider grids less visible
            d3.selectAll(".ticklabel").style("opacity", 0.1);
            d3.selectAll(".data-path").style("opacity", 0.1);
            d3.selectAll(".data-dot").style("opacity", 0.1);
            
            d3.selectAll(".axislabel").style("opacity", 0.1);   // turn all labels less visible first
            d3.select(this).style("opacity", 1)         // Set the currently selected axis label opacity to 1 (visible)
            d3.selectAll('.cat').style('opacity', 0.1);

            tooltip.style("opacity", 1);        // make tooltip visible now

            // console.log(this);                      // check if it's retrieving the label or not
            
            populateTooltip(tooltip, this);
        })
        .on("mouseout", () => { 
                    tooltip.style("opacity", 0);               // on mouseout, hide both tooltips

                    d3.selectAll(".data-path").style("opacity", 1);                // return the spider paths to its original opacity              
                    d3.selectAll(".grid-circle").style("opacity", 1);       // also for the grid circle, the axis labels, tick labels
                    d3.selectAll(".axislabel").style("opacity", 1); 
                    d3.selectAll(".ticklabel").style("opacity", 0.5); 
                    d3.selectAll(".data-text").style("opacity", 0);         // ... for the data text to disappear off-hover and data-dot to return to half-transparent
                    d3.selectAll(".data-dot").style("opacity", 0.5);
                    d3.selectAll('.cat').style('opacity', 0.3);
                })

        .on("mousemove", function(event) {
            // Australia's tooltip
            tooltip.style("left", () => {
                return (width/2 - 52) + "px";
            }) 
            .style("bottom", (document.documentElement.clientHeight/2 - 120) + "px")
        })

        
        // Populate the tooltip texts with relevant data
        function populateTooltip(tooltip, label) {

            d3.csv("data/spider_label_description.csv").then( (data) => {
                
                tooltip.html( () => {    
                    let labelName = label.getAttribute("value");
                    let labelData = data.filter( function(b) { return b.label == labelName })[0];
                    console.log(data);
                    return `
                        <h2>${labelName}</h2>
                        <p style="text-align: justify;">${labelData.desc}</p>
                        
                    `;
                })
            })
        }

        // =================================
        // set hovering effect for the texts
        d3.selectAll(".data-path")
          .on("mouseover", function(event, d) {
            console.log(this);
            if (this.getAttribute("id") === "path0") {
                d3.selectAll(".text-0").style("opacity", 1);
                d3.selectAll("#path0").style("fill-opacity", 0.4);
                d3.selectAll("#path1").style("opacity", 0.2);
                d3.selectAll(".dot-0").style("opacity", 0.8);
                d3.selectAll(".dot-1").style("opacity", 0.1);

            } else {
                d3.selectAll(".text-1").style("opacity", 1);
                d3.selectAll("#path1").style("fill-opacity", 0.4);
                d3.selectAll("#path0").style("opacity", 0.2);
                d3.selectAll(".dot-1").style("opacity", 0.8);
                d3.selectAll(".dot-0").style("opacity", 0.1);
            } 
            // fade every other element out
            d3.selectAll(".grid-circle").style("opacity", 0.1);
            d3.selectAll(".axislabel").style("opacity", 0.1);
            d3.selectAll(".ticklabel").style("opacity", 0.1);
            d3.selectAll('.cat').style('opacity', 0.1)
            
        })
        .on("mouseout", function(event) {
            d3.selectAll(".data-text").style('opacity', 0);
            d3.selectAll(".data-path").style("opacity", 1).style("fill-opacity", 0.1);
            
            d3.selectAll(".data-dot").style("opacity", 0.5);
            d3.selectAll(".grid-circle").style("opacity", 1);
            d3.selectAll(".axislabel").style("opacity", 1);
            d3.selectAll(".ticklabel").style("opacity", 0.5);
            d3.selectAll('.cat').style('opacity', 0.3);

          })
        
        
            // Draw some identifying arcs
            const arcGen = (i) => d3.arc()
            .innerRadius(radarScale(1))
            .outerRadius(radarScale(1.06))
            .startAngle(2*i*Math.PI/3 )
            .endAngle((Math.PI + 2*i*Math.PI)/3) 

            let catColor = ["blue", "rgb(165, 97, 42)", "orange"];
            let catColorDark = ["#000066", "rgb(124, 70, 31)", "#cc6600"];
            
            let catGroup = svg.insert('g', ':first-child').attr('id', 'cat-group');

            d3.selectAll('.cat').remove();

            ["Hydrological","Geological","Meteorological"].forEach( function(val, index) {
                console.log(val);
                catGroup.append("path")
                .attr("class", "category-arc cat")
                .attr("id", `arc-${index}`)
                .attr("transform", `translate(${width/2}, ${height/2})`)
                .attr("d", arcGen(index))
                .attr("fill", catColor[index]);
                
                catGroup.append("text")
                .append("textPath")
                .attr("id", `arct-${index}`)
                .attr('class', 'category-text cat')
                .attr("href", `#arc-${index}`)
                .style('font-family', 'monospace')
                .style('font-weight', 'bold')
                .attr('text-anchor', 'middle')
                .attr('startOffset', '25%')
                .text(val)
                .attr('fill', catColorDark[index])
                .style('transform', "scale(+1,-1)");
        })
 

        // ===========================================================
        // ==============moving the whole svg around hehe=============
        // ===========================================================
        // svg.style("transform", "translate(-40px, 20px)")
        //    .style("transform", "scale(0.8) translate(10%, 10%)")
    }); // closing for data selection
    
    // the whole section is based on a tutorial from 
    // https://yangdanny97.github.io/blog/2019/03/01/D3-Spider-Chart



}
            
           