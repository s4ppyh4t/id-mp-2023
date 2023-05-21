// async function inject_data(file_name){
//     console.log("calling data");
//     console.log(await resolve_data(file_name))
// }

// function resolve_data(file_name){
//     return d3.csv(file_name, function(csv_data){
//         return csv_data
//     })
// }


function inject_data(fname){
    let file_name = fname;
    let f_name = "data/" + file_name;
    return d3.csv(f_name, function(data) 
    {
        // return {
        //     "Country": data["Country"],
        //     "Wildfire": parseFloat(data.Wildfire),
        //     "Meteorological": parseFloat(data["Meteorological"]),
        //     "Geological": parseFloat(data.Geological),
        //     "Flood": parseFloat(data["Flood"]),
        //     "Storm": parseFloat(data.Storm)          
        // };
        return {
            "Country": data["Country"],
            // "Year": parseInt(data.Year),
            "Flood": parseFloat(data["Flood"]),
            "Mass movement": parseFloat(data["Mass movement"]),
            // "Drought": parseFloat(data["Drought"]),
            // "Extreme temperature": parseFloat(data["Extreme temperature"]),
            "Volcanic eruption": parseFloat(data["Volcanic eruption"]),
            "Earthquake": parseFloat(data.Earthquake),
            "Wildfire": parseFloat(data.Wildfire),
            "Storm": parseFloat(data.Storm),
            "AvgIDP": parseFloat(parseFloat(data["Average IDP of all"]).toFixed(2))          
        };
    });    
}
