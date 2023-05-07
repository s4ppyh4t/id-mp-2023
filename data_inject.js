// async function inject_data(file_name){
//     console.log("calling data");
//     console.log(await resolve_data(file_name))
// }

// function resolve_data(file_name){
//     return d3.csv(file_name, function(csv_data){
//         return csv_data
//     })
// }


function inject_data(file_name){
    return d3.csv(file_name, function(data) 
    {
        return {
            "Country": data["Country"],
            "Wildfire": parseFloat(data.Wildfire),
            "Meteorological": parseFloat(data["Meteorological"]),
            "Geological": parseFloat(data.Geological),
            "Flood": parseFloat(data["Flood"]),
            "Storm": parseFloat(data.Storm)          
        };
    });    
}