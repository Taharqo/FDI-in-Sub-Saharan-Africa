// html_v7, app_v6.py
//NOTES:

//To do:
// - link drop down to map highlight
// - ability to select fdi year to be used for scatter plot & select number of year in the future to visualize fdi affect on coutnry
// - ability to plot a metric using a selection box 

// event squence:
// open page > africa map > you select a country > FDI barchart > select a checkbox > add a line to the >
// > bargraph to that represents the checkbox option.  

// Process flow scenarios legend:
//    1) initial page load: 
//    2) click on country from drop down > DDEL > FEPJDD > FEPJ > BG & BSS > country graph & ticker displayed on page
//    3) click on country from map        > MEL > FEPJDD > FEPJ > BG & BSS > country graph & ticker displayed on page
//    4) click on country graph buttons:
//    5) click on SSA scatter graph buttons:

//African map coordinates 
var map = L.map('map', {
    center: [-1.170320, 23.241192],
    zoom: 4
  })
  
  // base map layer 
  var base = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY})
  
    var mapStyle = {
      color:'white',
      fillcolor: '#2B7A78',
      fillOpacoty: 0.5,
      weight: 1
    };
   
  
  // Geojson link 
  var geoJsonLink = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/africa.geojson";
  
  // API endpoints 
  // endpoint id: fdi = 0, gdp = 1, gni_c = 2, gdp_c = 3, health expenditure = 4, life expectance = 5, 
  //              heuman development = 6, education = 7, political stability = 8, corruption = 9
  var fdi = "/fdi"
  var ci = "/corruption"
  var psi = "/stability"
  var ed = "/education"
  var gdp = "/gdp"
  var human = "/humandev"
  var life = "/life"
  var gdp_pc = '/gdp_pc'
  var gni = '/gni'
  var life_agg = '/life_agg'
  var healthcare = '/healthcare'
  
  // array of all endpoint used by forEach to retrieve jsons from endpoints in the filter_endpointJson function
  var indexEndPoints =[fdi, ci, psi, ed, gdp, human, life, gdp_pc, gni, healthcare]
  
  // used to store the name of the country selected from the drop down or the map 
  var selected_country = ''

  var not_ssa = ['Morocco', 'Egypt', 'Libya', 'Tunisia', 'Algeria', 'Somalia', 'Western Sahara', 'Djibouti', 'La Reunion']

  
  // These variables maps back to the id column in the data files. 
  var indexSelector_line1 = 1; 
  var indexSelector_line2 = 1;
  var indexSelector = 0;
  var fdi_vs_metric = 0;
  
  
  // These variables will be used to build the scatter plot. they will hold a key value pare 
  // key = country name & value = numeric value representing FDI, corruption or gdp ... etc. 
  var fdi_obj ={}
  var corr_obj ={}
  var hd_obj = {}
  var edu_obj = {}
  var ps_obj = {}
  var gdp_obj = {}
  var le_obj = {}
  var gdp_c_obj = {}
  var he_obj = {}
  var gni_c_obj = {}
  
  
  var scatter_array = [] // array will contain the above objects. will be used to build the scatter graph
  var selected_country_json_array = [] //?????


  var clickflag = 0 /// testing click envent gold
  var old_layer = '' // testing click envent gold

  var polygon_country_indx // to identify the countries polygon id

  
  $('.index').hide()
  $('.scatter').hide()

  var country_dict = []
  var dict_key = 0

  
  d3.json(geoJsonLink).then(data => {

       
  
  // Retrieve geojson for subsaharan Africa. all the below functions are defined within this call 
  // because the geojson is retrieved asynchronously using a promise it only persists within the promise 
  // and is not accessable outside this function:
  


  // (BPDD) vvvvvvvvvvvvvv BUILD & POPULATE DROPDOWN VALUES AND FILTER NONE SUB-SAHARAN COUTNRIES vvvvvvvvvvvv
    function builddropdown(){
      var ddmenu = d3.select('#selDataset')
      var i = 0
      
      data.features.forEach(c => { if (not_ssa.indexOf(c.properties.name) === -1) {

        if (i == 0){
          ddmenu.append('option').text('All Sub-Saharan Countries') //// Add to the drop down  "All SUB-SAHARAN Countries" as an option
          i++
        }

        var country_name = c.properties.name
        ddmenu.append('option').text(country_name)
        }
      });     
    };
    
  // (BPDD) ^^^^^^^^^^^^^^^^^^ BUILD & POPULATE DROPDOWN VALUES AND FILTER NONE SUB-SAHARAN COUTNRIES ^^^^^^^^^^

  
    builddropdown()


  //auto build buttons /////TEST
 
 
  
  //auto build buttons////// TEST

  
  //(BSS) vvvvvvvvvvvvvvvv TICKER: SELECTED COUNTRY 2018 SNAPSHOT vvvvvvvvvvvv
    function buildsnapshot() {
      var panel = d3.select('#sample-metadata');
      var ticker = '';
      panel.html("");
      selected_country_json_array.forEach(rec => {
        var series = rec[0]['series'];
        var year = rec[0]['2018'];
        ticker = ticker + series + ': ' + year + ' <> ';
      });
      panel.append('marquee').text(ticker);
    }
  //^^^^^^^^^^^^^^^^ TICKER: SELECTED COUNTRY 2018 SNAPSHOT ^^^^^^^^^^^^^



  ////////// UNDERCONSTRUCTION: adding checkbox /////////////
  
   ////////// UNDERCONSTRUCTION: adding checkbox /////////////



  //(BSGSSA)vvvvvvvvvvvvvvvv BUILD SCATTER GRAPH vvvvvvvvvvvvvvvvvvv
    function build_scatter(scatter_array){
        var text = Object.keys(scatter_array[0])
        var x_axis = Object.values(scatter_array[0])
        var y_axis = Object.values(scatter_array[fdi_vs_metric])           

        var trace1 = {
          x: x_axis,
          y:  y_axis,
          mode: 'markers',
          type: 'scatter',
          name: 'Sub-Saharan Country',
          text: text,
          marker: { size: 12 }
        };
        
        var data = [trace1];
        
        var layout = {
          xaxis: {
            title: `${selected_country_json_array[0][indexSelector]['series']}`
          },
          yaxis: {
            title: `${selected_country_json_array[fdi_vs_metric][0]['series']}`
          },
          title:`${selected_country} ${selected_country_json_array[0][indexSelector]['series']} vs ${selected_country_json_array[fdi_vs_metric][0]['series']} `,
          showlegend: true,
            legend: {"orientation": "h"}
        };

        
        Plotly.newPlot('one', data, layout);

    }    
    // (BSGSSA)^^^^^^^^^^^^^^^^^^^^^ BUILD SCATTER GRAPH ^^^^^^^^^^^^^^^ 
  
   
 //(SD) vvvvvvvvvvvvvvvv SCATTER PLOT: BUILDING AN OBJECT from every endpoint for the year 2018 vvvvvvvvvvvvvvvvvvvv
 //vvvvvvvvvvvvvvvv ie. for the FDI endpoint the result will be {country_name:amount of FDI injected} vvvvvvvvv
 //vvvvvvvvvvvvvvvv assumption: it will take 5 years for the effects of FDI to take place vvvvvvvvvvvvvvvvvvvvv
    function scatter_data(){

      indexEndPoints.forEach(iep => {
        d3.json(iep).then(data => {
          if (indexEndPoints.length > 0){
            data.forEach(c => {

              var obj_key = c.country_name
              
              if (c.series == 'FDI'){
                var obj_val = c['2005']
              }
              else {
                var obj_val = c['2009']
              }
          
              if (c.series == 'FDI') { 
                fdi_obj[`${obj_key}`] = obj_val
                scatter_array[0] = (fdi_obj)
              }

              else if (c.series == 'GDP') { 
                gdp_obj[`${obj_key}`] = obj_val
                scatter_array[1] = (gdp_obj)
              }

              else if (c.series == 'GNI Per Capita') { 
                gni_c_obj[`${obj_key}`] = obj_val
                scatter_array[2] = (gni_c_obj) 
              }   

              else if (c.series == 'GDP Per Capita') { 
                gdp_c_obj[`${obj_key}`] = obj_val 
                scatter_array[3] = (gdp_c_obj) 
              }

              else if (c.series == 'Health Expenditure') { 
                he_obj[`${obj_key}`] = obj_val
                scatter_array[4] = (he_obj) 
              }

              else if (c.series == 'Life Expectancy') { 
                le_obj[`${obj_key}`] = obj_val
                scatter_array[5] = (le_obj)            
              }

              else if (c.series == 'Human Development Index') {
                hd_obj[`${obj_key}`] = obj_val
                scatter_array[6] = (hd_obj)           
              }

              else if (c.series == 'Education Index') { 
                edu_obj[`${obj_key}`] = obj_val
                scatter_array[7] = (edu_obj)
              }

              else if (c.series == 'Political Stability') { 
                ps_obj[`${obj_key}`] = obj_val
                scatter_array[8] = (ps_obj)
              }

              else if (c.series == 'Corruption Index') { 
                corr_obj[`${obj_key}`] = obj_val
                scatter_array[9] = (corr_obj)
              }

            })
          }
        build_scatter(scatter_array)
        }); 
      }); 
    };
  // (SD)^^^^^^^^^^^^^^^^ SCATTER PLOT: BUILDING AN OBJECT from every endpoint for the year 2018 ^^^^^^^^^^^^^^^^^^^^
  //^^^^^^^^^^^^^^^^ ie. for the FDI endpoint the result will be {country_name:amount of FDI injected} ^^^^^^^^^
  //^^^^^^^^^^^^^^^^ assumption: it will take 5 years for the effects of FDI to take place ^^^^^^^^^^^^^^^^^^^^^

      
  //(BG) vvvvvvvvvvvvvvvvvvv BUILDING COUNTRY GRAPH vvvvvvvvvvvvvvvvvvvvvv
    function build_graph() {
       // console.log(selected_country_json_array)
      var x_fdi = Object.keys(selected_country_json_array[indexSelector][0]).slice(0,19);
      var y_fdi = Object.values(selected_country_json_array[indexSelector][0]).slice(0,19);
      //console.log(x_fdi)
    //   console.log(y_fdi)


      var x_gdp_c = Object.keys(selected_country_json_array[indexSelector_line1][0]).slice(0,19);
      var y_gdp_c = Object.values(selected_country_json_array[indexSelector_line1][0]).slice(0,19)
    //   console.log(x_gdp_c)
    //   console.log(y_gdp_c)

      var x_gni_c = Object.keys(selected_country_json_array[indexSelector_line2][0]).slice(0,19);
      var y_gni_c = Object.values(selected_country_json_array[indexSelector_line2][0]).slice(0,19)
    //   console.log(x_gni_c)
    //   console.log(y_gdp_c)

        var fdi_trace = {
          x: x_fdi,
          y: y_fdi,
          name: `FDI`,
          type: 'bar',
          marker: {color: '#DAA520',
          },
          connectgaps: true
        }
        
        var first_trace = {
          x: x_gdp_c,
          y: y_gdp_c,
          name: `${selected_country_json_array[indexSelector_line1][0]['series']}`,
          yaxis: 'y2',
          type: 'line',
          line: {color: 'red'
          },
          connectgaps: true
        }

        var second_trace = {
            x: x_gni_c,
            y: y_gni_c,
            name: `${selected_country_json_array[indexSelector_line2][0]['series']}`,
            yaxis: 'y2',
            type: 'line',
            line: {color: 'blue'
            },
            connectgaps: true
          }

        var data = [fdi_trace, first_trace, second_trace]

        var layout = {
          title: `${selected_country_json_array[0][0]['country_name']} FDI vs. ${selected_country_json_array[indexSelector_line1][0]['series']} & ${selected_country_json_array[indexSelector_line2][0]['series']}`,
          yaxis: {title: 'FDI'},
          yaxis2: {
            title: `${selected_country_json_array[indexSelector_line1][0]['series']} & ${selected_country_json_array[indexSelector_line2][0]['series']}`,
            overlaying: 'y',
            side: 'right'
          },
          showlegend: true,
            legend: {"orientation": "h"},
          connectgaps: true
        };
        var config2 = {responsive : true}
        Plotly.newPlot("one", data, layout, config2)
    }
  //(BG)^^^^^^^^^^^^^^^^ BUILDING COUNTRY GRAPH ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^



  //(FEPJ)vvvvvvvvvvvvvvvvv USE SELECTED COUNTRY FROM DROPDOWN/MAP TO FILTER GEOJSON vvvvvvvvvvvvvvvvvvvvvvv 
  //data filter
    function filter_endpointJson(selected_country){ 
      indexEndPoints.forEach(iep => {
        
        d3.json(iep).then(data => {
          if (indexEndPoints.length > 0){
            var selected_country_json = data.filter(d => selected_country == d.country_name)
            selected_country_json_array[selected_country_json[0]['id']] = selected_country_json
          }
          //PLOT Construction
          build_graph()

          buildsnapshot()
        }); 
      });    
    };
  //(FEPJ)^^^^^^^^^^^^^^^^^^^^^ USE SELECTED COUNTRY FROM DROPDOWN/MAP TO FILTER GEOJSON ^^^^^^^^^^^^^^^^^^^


  
  //(FEPJDD)vvvvvvvvvvvvvv SET SELECTED COUNTRY TO VALUE OF DROP DOWN SELECTION vvvvvvvvvvvvvvv
  function filter_endpointJsonDD(){
    indexSelector = 0;
    selected_country = d3.select('#selDataset').node().value

    if (selected_country != 'All Sub-Saharan Countries') {
      $('.index').show()
      $('.scatter').hide()
      indexSelector_line1 = 2 // put to sleep: display no line graphs
      indexSelector_line2 = 3 // put to sleep: display no line graphs
      filter_endpointJson(selected_country)  
      //make a call to the click listener function 
    }

    else {
      $('.index').hide()
      $('.scatter').show()

      scatter_data();
      fdi_vs_metric = 1
    }

    //////// TESTING ability to click on polygon by calling Leaflet 
 
    // var mapData1 = L.geoJson(data, {
    //   onEachFeature: function(feature, layer) {
    //     console.log('im inside onEachFeature inside L.geoJson')
    //     // console.log(event.target)
    //     // var target_country = 

    //     click: function click_func(event) {
    //       // console.log(event)
    //       // console.log(event.target) 
    //       // console.log(feature.properties.name) 
                                            
    //     layer = event.target;

    //     layer.setStyle({
    //       fillColor: 'gold',
    //       fillOpacity: 0.5
    //     });    

    //     if(clickflag == 0){
    //       old_layer = layer
    //       clickflag ++
    //     }
        
    //     if(old_layer != layer){
    //       old_layer.setStyle({
    //         fillColor: '#2B7A78',
    //         fillOpacity: 0.5
    //       });  

    //       old_layer = layer
    //     }   
    //   }     

    //   }
    // //   /// to identify each contires index in the geojeson
      data.features.forEach(c => {
        country_dict.push({
            key: dict_key,
            value: c.properties.name 
        })
        dict_key++
    }) 
    console.log(country_dict)

    var country_obj = country_dict.filter(c => selected_country == c.value )
    polygon_country_indx = country_obj[0]['key']
    
    var x = document.getElementsByClassName("leaflet-interactive")[polygon_country_indx];
    var att = document.createAttribute("id"); 
    att.value = `${selected_country}`; 
    x.setAttributeNode(att)
    console.log(x)

    $(`#${selected_country}`).find('path').trigger('click'); // Works

    // // $(`${selected_country}`).on("click", "path", function(){
    // //     $(this).text("It works!");
    // // }); ///////////////////doesnt work
    // // $(`${selected_country}`).ready(function(){
    // //     $("path").trigger("click");
    // // }); ///////////////////doesnt work
    // // $(`#${selected_country}`).trigger(click);
    // // $(`#${selected_country}`).click(); ///////////////////doesnt work

    // // $( `#${selected_country}` ).click(function() {
    // //     console.log( "Handler for .click() called." );
    // //   }); ///////////////////doesnt work
    // // document.getElementById(`${selected_country}`).click() ///////////////////doesnt work
    // //document.getElementsByClassName("leaflet-interactive").click() ///////////////////doesnt work
    // //d3.select("#selDataset").on("change",console.log(mapData))///???????

/// to identify each contires index in the geojeson

    // });
     //////// TESTING ability to click on polygon by calling Leaflet

  };
//(FEPJDD)^^^^^^^^^^^^^^^ SET SELECTED COUNTRY TO VALUE OF DROP DOWN SELECTION  ^^^^^^^^^^^^^^


  // (DDEL) Drop down event listener: a change in the drop down value will call function filter_endpointJsonDD
  d3.select("#selDataset").on("change",filter_endpointJsonDD)
  


  ////////// test: checkbox event listener ///////////////////////////////////// CheckBox
  function handleChange(){
    var x = document.getElementById("corr-chkbx");

      if(x.checked == true){
          console.log('GDP/Capita: yes')
          indexSelector_line2 = 3
      }
      else{
          console.log('GDP/Capita: no')
      }
  }

  d3.select("#corr-chkbx").on('change',handleChange)
  ////////// test: checkbox event listener ///////////////////////////////////// CheckBox




  //// TEST///////// connect drop down selection to map: access polygons from using dropdown listiner ///////


  //// TEST///////// connect drop down selection to map: access polygons from using dropdown listiner ///////




    //vvvvvvvvvvvvvvvvvvv BUTTON EVENT LISTENERS & GRAPH CALIBRATION FUNCTIONS vvvvvvvvvvvvvvvvv
    // Called after a button is clicked:
    // sets the indexSelector to the value that corresponds to the data file id
    // calls the filter_endpointjson 
    function life_click(){
      indexSelector_line1 = 4
      indexSelector_line2 = 5
      filter_endpointJson(selected_country)
    };

    function econIndx_click(){
      indexSelector_line1 = 2
      indexSelector_line2 = 3
      filter_endpointJson(selected_country)
    };

    function poliIndx_click(){
        indexSelector_line1 = 8
        indexSelector_line2 = 9
        filter_endpointJson(selected_country)
    };

    function fdiVSgdp_click(){
      scatter_data();
      fdi_vs_metric = 1
    };

    function fdiVShumdev_click(){
      scatter_data();
      fdi_vs_metric = 6
    };

    function fdiVScorr_click(){
      scatter_data();
      fdi_vs_metric = 9
    };

    //button listenetrs 
    d3.select('#lifeIndx-btn').on('click', life_click);
    d3.select('#poliIndx-btn').on('click', poliIndx_click);
    d3.select('#econIndx-btn').on('click', econIndx_click);
    d3.select('#fdi_gdp-btn').on('click', fdiVSgdp_click);
    d3.select('#fdi_humnDev-btn').on('click', fdiVShumdev_click);
    d3.select('#fdi_corr-btn').on('click',fdiVScorr_click);
    //^^^^^^^^^^^^^^^^^^^^^^^^^ BUTTON EVENT LISTENERS & GRAPH CALIBRATION FUNCTIONS ^^^^^^^^^^^^^

    ////define click function TEST/////


    /////define click funciong TEST////
  
    
    // Creating a geoJSON layer with the retrieved data
    var mapData = L.geoJson(data, {
      // Style each feature (in this case a country)
      //Feature is the geoJson data for each polygon representing each country. each feature has properties and a name = country name
    
      style: function(feature) {
        return {
          color: "white",
          fillColor: '#2B7A78',
          fillOpacity: 0.5,
          weight: 1
        };
      },
      // Called on each feature mouseover, mouseout & click
      onEachFeature: function(feature, layer) {
        // Set mouse events to change map styling
        country_name = feature.properties.name;

        if(not_ssa.indexOf(country_name) === -1){
          layer.on({
            // When a user's mouse touches a map feature, the mouseover event calls this function, that feature's opacity changes to 90% so that it stands out
            mouseover: function mouseover_func(event) {
              //console.log(event.target)
              if (selected_country != feature.properties.name ){
                layer = event.target;
                layer.setStyle({
                  fillColor: '#3AAFA9',
                  fillOpacity: 0.9
                });
              }
            },
            // When the cursor no longer hovers over a map feature - when the mouseout event occurs - the feature's opacity reverts back to 50%
            mouseout: function mouseout_func(event) {    
              //console.log(event.target)     
              ////// TESTING: if country is clicked then mouseout funtion should not work ///////////
              if (selected_country != feature.properties.name ){
                layer = event.target;
                layer.setStyle({
                  fillColor: '#2B7A78',
                  fillOpacity: 0.5
                });              
              }
            },
            // (MEL) Map listener: when a country is selected from the map this is activiated.            
            click: function click_func(event) {
                // console.log(event)
                // console.log(event.target) 
                // console.log(feature.properties.name) 
               

              selected_country = feature.properties.name
              console.log(feature.properties.name)
              d3.select('#selDataset').node().value = selected_country 
              filter_endpointJsonDD()
                                         
              layer = event.target;

              layer.setStyle({
                fillColor: 'gold',
                fillOpacity: 0.5
              });    

              if(clickflag == 0){
                old_layer = layer
                clickflag ++
              }
              
              if(old_layer != layer){
                old_layer.setStyle({
                  fillColor: '#2B7A78',
                  fillOpacity: 0.5
                });  

                old_layer = layer
              }   
            }     

          });
        }
        else{
          layer.bindPopup(`<img src='https://www.essence.com/wp-content/uploads/2020/04/GettyImages-945638698-1-1472x1472.png' width='99%' height='99%'><hr><h6> Non-SSA Country<h6>`);
  
          layer.setStyle({
            fillColor:'#cdcdcd'
          });
        }
      }

    }).addTo(map); 

    //d3.select("#selDataset").on("change",console.log(mapData))
    // var x = document.getElementsByClassName("leaflet-interactive");
    // console.log(polygon_country_indx)
    // console.log(polygon_country_indx)

    // console.log(x)
  
  });
  base.addTo(map);

 