function sankeyDraw() {
    ata = d3.csv('data/sankey-data.csv').then((data) => {
        // console.log(data);
        // console.log(data.length);
        const dimensions = Object({ height: 559, width: 900, margins: 20 });

        let sankeyData = { nodes: [], links: [] };
        
        // map out and generate a node list of distinct sources and targets
        let sourceList = data.map((d) => d.source);
        let targetList = data.map((d) => d.target);

        fullList = Array.from(new Set([...sourceList,...targetList]));
        
        let nameList = fullList.map((d) => {return {name: d}});
        
        // push data to sankeyData "nodes" array
        sankeyData.nodes.push(...nameList); // DONE

        // push each links to the sankeyData "links" array
        data.forEach((d) => {
            // ========================CODE FROM TUTORIAL===============================
            // // Here the code map out the list of nodes in sankeyData object
            // // ... into an array of just nodes ( e.g. return ["name1", "name2", "name3"]
            // // ... from { nodes: [{name: "name1"}, {name: "name2"},...], links....} )
            // const listOfNodes = sankeyData.nodes.map((n) => n.name);

            // // this list of nodes will then be brought out to
            // // cross-check, whether this list has the name of
            
            // // the source... 
            // if (!listOfNodes.includes(d.source)) {
            //     sankeyData.nodes.push({name: d.source});
            // }

            // // .. or the target's names. This basically generates an unique list of
            // // .. source and target names into sankeyData's "nodes"
            // if (!listOfNodes.includes(d.target)) {
            //     sankeyData.nodes.push({name: d.target});
            // }
            
            // ============= I might do something else actually, check code above ==========
            
            // The code eventually pushes link objects to sankeyData
            
            console.log();

            // since we need the index reference as source and targets for "links" array anyway, how about 
            // ... I do that here eheheheheh phunny moment
            let sourceIndex = sankeyData.nodes.findIndex( (i) => i.name === d.source );    
            let targetIndex = sankeyData.nodes.findIndex( (i) => i.name === d.target );   

            sankeyData.links.push({
                source: sourceIndex,
                target: targetIndex,
                value: d.value
            });
        }); //DONE
        
        // Generate the d3.sankey generator cosntructor
        const sankeyViz = d3
                .sankey()
                .nodes(sankeyData.nodes)
                .links(sankeyData.links)
                .nodeAlign(d3.sankeyRight)
                .nodeSort((a,b) => -a.value + b.value)
                .nodeWidth(30)     // How THICK the nodes should be
                .extent([
                [dimensions.margins, dimensions.margins],
                [
                dimensions.width - dimensions.margins * 2,
                dimensions.height - dimensions.margins * 2
                ]
                ]);
    
        // call and assign sankyfied data to "sankeyData" variable
        sankeyData = sankeyViz();   // DONE

        // This will fix the invisible gradient later down the line hehehe
        sankeyData.links.forEach( (d) => {
            if (d.y0 === d.y1) { d.y1 += 0.005;}
        } )
        sankeyData.nodes.forEach( (d) => {
            d.nodeWidth = d.x1 - d.x0;
        })
        // console.log(sankeyData); //CHECK FOR VALIDATION

        // ============================================================================
        // Now we got the sankeyfied data, let's start drawing shits hehehehe ahahahahh
        // =============================================================================


        // I'm gonna STEAL their color scale... yoink
        // tehcnically not stealing but "eh"
        colorScale = d3
                .scaleOrdinal()
                // .domain(sankeyData.nodes.map((n) => n.name))
                .range(["#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f", "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ac"])
        
        const svg = d3.select("#sankey-here")
            .append("svg")
            .attr("height", dimensions.height)
            .attr("width", dimensions.width)
            .attr("overflow", "visible");

        const chart = svg
            .append("g")
            .attr("transform", `translate(${dimensions.margins},${dimensions.margins})`)
            .attr("height", dimensions.height - dimensions.margins * 2)
            .attr("width", dimensions.width - dimensions.margins * 2)
            .attr("overflow", "visible");

        chart.append("text")
            .text("Region of Origin")
            .attr("dominant-baseline", "middle")
            .attr('text-anchor', 'left')
            .attr('x', dimensions.margins)
            .attr("font-size", "18px")
            .attr("font-weight", "600");
        
        chart.append("text")
            .text("PR Visa Stream")
            .attr("dominant-baseline", "middle")
            .attr('text-anchor', 'middle')
            .attr('x', dimensions.width/2)
            .attr("font-size", "18px")
            .attr("font-weight", "600");
        
        chart.append("text")
            .text("State/Territory")
            .attr("dominant-baseline", "middle")
            .attr('text-anchor', 'end')
            .attr('x', dimensions.width - 2*dimensions.margins )
            .attr("font-size", "18px")
            .attr("font-weight", "600");
            
        chart.append('text')
            .text('=========================== DEPARTURE ============================')
            .style('fill', 'green')
            .attr("font-weight", "600")
            .attr('x', dimensions.margins - 20)
            .attr('y', dimensions.height/2 -15)
            .attr('text-anchor', 'middle')
            .attr('transform', `rotate(-90, ${dimensions.margins - 20}, ${dimensions.height/2 -15})`);
        
        chart.append('text')
            .text('=========================== DESTINATION ============================')
            .style('fill', 'red')
            .attr("font-weight", "600")
            .attr('x', dimensions.width - dimensions.margins)
            .attr('y', dimensions.height/2 -15)
            .attr('text-anchor', 'middle')
            .attr('transform', `rotate(90, ${dimensions.width - dimensions.margins}, ${dimensions.height/2 -15})`);
        
        chart.append('text')
            .text('Showing Migrated Population (no. of people) on vertical axis')
            .attr('x', dimensions.width/2)
            .attr('y', dimensions.height - dimensions.margins*2)
            .attr('text-anchor', 'middle')
            .style('opacity', 0.6)
            .style('font-style', 'italic');
             


        // ===================================================
        // =============== THE NODES =========================
        // ===================================================

        const nodes = chart.append("g")
            .attr("id", "node-group")
            .selectAll("rect")
            .data(sankeyData.nodes)
            .enter()
            .append("rect")
            .attr("class", "node")
            .attr("x", (d) => d.x0)
            .attr("y", (d) => d.y0)
            .attr("fill", (d) => colorScale(d.name))
            .attr("height", (d) => d.y1 - d.y0)
            .attr("width", (d) => d.x1 - d.x0);
        
        // ===================================================
        // =============== THE LINKS =========================
        // ===================================================
        
        // The linearGradient elements to define gradient colors for the links
        svg.append("defs")
            .selectAll("linearGradient")
            .data(sankeyData.links)
            .enter()
            .append("linearGradient")
            .attr("id", d => `${d.source.index}-grad-${d.target.index}`)
            // .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .call(gradient => gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", ({source: {name: i}}) => {return colorScale(i);}))
            .call(gradient => gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", ({target: {name: i}}) => {return colorScale(i);}));
        
        const links = chart
            .append("g")
            .attr("fill", "none")
            .selectAll("path")
            .data(sankeyData.links)
            .join("path")
            .attr("stroke", (d) => {
                // console.log( `url("#${d.source.index}-link-${d.target.index}")`);
                return `url(#${d.source.index}-grad-${d.target.index})`;
                // return "gray";
            })
            .attr("class", "linkage")
            .attr("stroke-opacity", 0.4)
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke-width", function (d) {
                return d.width;
            })
            // .text( (d) => `${d.source.name} to ${d.target.name}:\n${d.value} people`)

        // ===================================================
        // ===================================================                      
        // Node name labelling heheheeh
        const labelNames = chart.append("g")
            .selectAll("text")
            .data(sankeyData.nodes)
            .enter()
            .append("text")
            .text((d) => d.name + " (" + d3.format(".3~s")(d.value)+")")
            .attr('id', (d) => `label-${d.index}`)
            .attr("class", (d) => `level-${d.depth} node-label`)
            // .attr("x", (d) => d3.mean([d.x0, d.x1]))
            .attr("x", (d) => (d.x1 < dimensions.width*0.7) ? d.x1 + 5 : d.x0 - 5)
            .attr("y", (d) => (d.y0+d.y1)/2)
            // .attr("y", (d) => d.y0 + 15)
            .attr("text-anchor", (d) => (d.x1 < dimensions.width*0.7) ? "start" : "end")
            // .attr("dominant-baseline", "middle")
            .attr("fill", "black")
            .attr("font-family", "monospace")
            .attr("font-weight", "bold")
            .attr("font-size", "11px")
            .style("mix-blend-mode", "normal")
            .attr("value", (d) => d.nodeWidth)
            // .style("text-shadow", ".5px .5px 2px #222")
            .style("visibility", (d) => (d.y1 - d.y0 < 20 ? 'hidden' : 'visible'))
            // WRAPPING ==============================================
            .call(wrap);
        
        

        console.log(d3.selectAll(".linkage"));
        
        
        // The things at the bottom is uh. EXTREMELY MESSY AND SHOULD BE HANDLED WITH CARE
        // ===============================================================================
        // ========================Hovering Time for nodes================================
        // ===============================================================================
        d3.selectAll('.node').on("mouseover", function(event, nodeData) {
            let selLinks = d3.selectAll(".linkage").filter((link) => {
                // console.log(d);
                return (link.source.index === nodeData.index) || (link.target.index === nodeData.index);
            })
            // console.log(selLinks);
            .raise();
            selLinks.transition()
            .duration(50)
            .attr('stroke-opacity', '0.6'); 

            d3.selectAll('.linkage').filter((link) => {
                return (link.source.index != nodeData.index) && (link.target.index != nodeData.index);
            }).style('opacity', 0.1);

            let thisNode = d3.select(this);

            d3.selectAll('.node').filter( function(d) {
                return (nodeData.index < 12 && nodeData.index > 7) ? (this != thisNode.node() && d.index < 12 && d.index > 7 ) : (this != thisNode.node() && (d.index >= 12 || d.index <= 7  )) ;
            }).style('opacity', 0.1);

            d3.selectAll('.node-label').filter( function(d) {
                return (nodeData.index < 12 && nodeData.index > 7) ? (d.index != nodeData.index && d.index < 12 && d.index > 7 ) : (d.index != nodeData.index && (d.index >= 12 || d.index <= 7  )) ;
            }).style('opacity', 0.1)
            
            d3.selectAll('.node-label').filter( function(d) {
                return d.index === nodeData.index;
            }).style('visibility', 'visible')
        })

        nodes.on("mouseout", () => {
            d3.selectAll(".linkage")
            .transition()
            .duration(50)
            .attr('stroke-opacity', 0.4);

            // bring back the nodes ehhee
            d3.selectAll('.node').style('opacity', 1);
            d3.selectAll('.linkage').style('opacity', 1);
            d3.selectAll('.node-label').style('opacity', 1).style('visibility', (d) => (d.y1 - d.y0 < 20 ? 'hidden' : 'visible'));

        })

        // ===============================================================================
        // =====================For the links (to previous links)=========================
        // ===============================================================================
        links.on("mouseover", function(event, d) {
            // console.log(d)
            let prevSelLinks = d3.selectAll(".linkage").filter((link) => {
                return (link.target.index === d.source.index)
            })
            .raise();

            // I will test this out
            d3.select('svg')
                .append('text')
                .attr("id", 'temp-tt')
                .attr('text-anchor', 'middle')
                .attr('x', (d.source.x1 + d.target.x0)/2)
                .attr('y', (d.y0 +d.y1)/2 +20)
                .text(`${d3.format('.5~s')(d.value)} people`);

            let thisSelLinks = d3.select(this);

            // Also raise the links from the same source, but don't highlight them
            d3.selectAll('.linkage').filter((link) => {
                return (link.source.index != d.source.index)
            }).attr('pointer-event', 'none');


            // Let's also un-highlights the nodes, shall we?
            d3.selectAll('.node').filter((node) => {
                return (d.source.index > 7) ? (node.index != d.target.index && node.index != d.source.index && node.index > 7) : (node.index != d.target.index && node.index != d.source.index)
            }).style('opacity', 0.2);
            
            // And uhh unhighlight the labels of out-of-focus nodes
            d3.selectAll('.node-label').filter((label) => {
                return (d.source.index > 7) ? (label.index != d.target.index && label.index != d.source.index && label.index > 7) : (label.index != d.target.index && label.index != d.source.index)
            }).style('opacity', 0.1)

            d3.selectAll('.node-label').filter((label) => {
                return label.index === d.source.index || label.index === d.target.index;
            }).style('visibility', 'visible');

            // Change the links (both included and excluded)
            d3.selectAll('.linkage').filter( function(link, i) {
                return this != thisSelLinks.node() && this != prevSelLinks.node();
            }).transition().duration(50).attr('stroke-opacity', 0.1)

            thisSelLinks
                .raise()
                .transition()
                .duration(50)
                // .ease(d3.easeLinear)
                .attr('stroke-opacity', 0.6);

            if (prevSelLinks.size() > 0) {
                // console.log(prevSelLinks);
                prevSelLinks.transition()
                    .duration(50)
                    // .ease(d3.easeLinear)
                    .attr('stroke-opacity', 0.6);
            }
        })

        links.on("mouseout", () => {
            d3.selectAll(".linkage")
            .transition()
            .duration(50)
            // .ease(d3.easeLinear)
            .attr('stroke-opacity', "0.4")
            .attr('pointer-event', 'auto');

            d3.selectAll('.node').style('opacity', 1);
            d3.selectAll('.node-label').style('opacity', 1).style('visibility', (d) => (d.y1 - d.y0 < 20 ? 'hidden' : 'visible'));
            d3.select('#temp-tt').remove();

        })


        

    });     // End tag of the WHOLE DATA INJECTION STUFF PLZ REMEMBER  <========================
    


}