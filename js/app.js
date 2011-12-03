$(document).ready(function(){
  console.log("Hello World from app.js");
  
  initializeMap();
  getRoute();
  
  var map;
  var startMarker;
  var endMarker;
  var polyline;
  var legLinesAndMarkers = [];
  
  function initializeMap() {
    var latlng = new google.maps.LatLng(60.18,24.89);
    var myOptions = {
      zoom: 13,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"),
    myOptions);

    var startDefaultLatLng = new google.maps.LatLng(60.1885493977,24.8339133406);
    startMarker = new google.maps.Marker({
      position: startDefaultLatLng,
      draggable: true,
      title: "Start",
      icon: "https://chart.googleapis.com/chart?chst=d_map_spin&chld=1|0|00ff00|12|b|Start"
    });
    startMarker.setMap(map);
    google.maps.event.addListener(startMarker, 'mouseup', getRoute);
    
    var endDefaultLatLng = new google.maps.LatLng(60.17173291474175,24.92356349471379);
    endMarker = new google.maps.Marker({
      position: endDefaultLatLng,
      draggable: true,
      title: "End",
      icon: "https://chart.googleapis.com/chart?chst=d_map_spin&chld=1|0|ff0000|12|b|End"
    });
    endMarker.setMap(map);
    google.maps.event.addListener(endMarker, 'mouseup', getRoute);

  }

  function getTransportHex(type, variant) {
    color = "";
    switch(type) {
      case "walk": color = "000000"; break;
      case "tram": color = "009933"; break;
      case "metro": color = "ff6600"; break;
      case "ferry": color = "0000ff"; break;
      case "train": color = "ff0000"; break;
      // bus
      default: color = "0000cc";
    }

    if (variant === "light") {
      switch(type) {
        case "walk": color = "999999"; break;
        case "tram": color = "33cc66"; break;
        case "metro": color = "ff9933"; break;
        case "ferry": color = "9999ff"; break;
        case "train": color = "ff3333"; break;
        // bus
        default: color = "3333ff";
      }
    }
    return color;
  }

  function createPolyline(path, transportTypeString) {
    if(!path) {
      path = [];
      console.log("No path!");
    }

    var color = "#"+getTransportHex(transportTypeString);

    polyline = new google.maps.Polyline({
        path: path,
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 6,
        clickable: false
      });
    polyline.setMap(map);

    return polyline;
  }
  function createMarker(LatLng, vehicle, type) {
    var color = getTransportHex(type, 'light');

    var marker = new google.maps.Marker({
      position: LatLng,
      draggable: false,
      title: vehicle+"",
      icon: "https://chart.googleapis.com/chart?chst=d_map_spin&chld=1|0|"+color+"|11|b|"+vehicle
    });
    marker.setMap(map);
    return marker;
  }

  function showRoute(legs) {
    // remove any current lines
    for(var i in legLinesAndMarkers) {
      legLinesAndMarkers[i]["polyline"].setMap(null);
      if(legLinesAndMarkers[i]["marker"]) {
        legLinesAndMarkers[i]["marker"].setMap(null);
      }
      legLinesAndMarkers[i] = null;
    }
    legLinesAndMarkers = [];

    for(var i in legs) {
      var leg = legs[i];
      var type = getLegTypeString(leg.type);
      var marker = null;
      if (type !== "walk") {
        var vehicleNumber = formatVehicleCode(leg.code,type);
        marker = createMarker(
          new google.maps.LatLng(leg.locs[0].coord.y,leg.locs[0].coord.x), vehicleNumber, type
        );
      }
      var path = [];
      $.each(leg.locs,function(i,loc){
        path.push(new google.maps.LatLng(loc.coord.y,loc.coord.x))
      });
      var line = createPolyline(path, type);

      legLinesAndMarkers.push({polyline: line, marker: marker});
    }
  }

  function formatVehicleCode(code,type) {
    //console.log('code:'+code);
    var vehicleString = "";
    if (type === "train") {
      vehicleString = code.substring(4,5);
    } else if (type === "metro") {
      vehicleString = "metro";
    } else {
      vehicleString = code.substring(1,6).trim();
      var leadingZeros = 0;
      for (var i in vehicleString) {
        if(vehicleString[i] === "0") {
          leadingZeros++;
        } else {
          break;
        }
      }
      vehicleString = vehicleString.substring(leadingZeros);
    }

    return vehicleString;
  }

  function getRoute(){
    console.log("getRoute")
    // Clear current data
    $("#results").empty()
    //polyline.setPath([]);
    showRoute({});

    var fromLatLng = startMarker.getPosition()
    var from = fromLatLng.lng() + "," + fromLatLng.lat()
    console.log("from:"+from)
    
    var toLatLng = endMarker.getPosition()
    var to = toLatLng.lng() + "," + toLatLng.lat()
    console.log("to:"+to)

    var params = "?request=route&from="+from+"&to="+to+"&format=json&epsg_in=wgs84&epsg_out=wgs84"
    var account = "&user="+config.user+"&pass="+config.pass

    $.getJSON(config.api+params+account, function(data){
      console.log(data);
      $.each(data, function(i,val){
        var route = val[0];
        var routePath= []
        
        var result = $("<div class='result'></div>");
        result.append("<h3>Route "+(i+1)+"</h3>");

        var legs = $("<ol></ol>").appendTo(result)
        
        $.each(route.legs, function(i,leg){
          var legItem = $("<li></li>").appendTo(legs)
          
          var time = leg.locs[0].depTime;
          legItem.append(time.substr(8,2)+":"+time.substr(10,2)+" ");
          
          var type = getLegTypeString(leg.type)
          legItem.append(type + " ");

          if(type === "walk"){
             legItem.append(leg.length + "m ");
          } else {
            /*legItem.append(leg.code.substr(1,4))*/
            legItem.append(formatVehicleCode(leg.code,type));
          }


          $.each(leg.locs,function(i,loc){
            routePath.push(new google.maps.LatLng(loc.coord.y,loc.coord.x))
          })
        });

        //result.append("Length: " + route.length + "m<br/>");
        result.append("Duration: " + route.duration/60 + " minutes");
        $("#results").append(result);
        
        // Show route on map when clicked
        result.click(function(){
          showRoute(route.legs);
          $(".result").removeClass("selected")
          result.addClass("selected")
        })
        
        // Show the first result immediately
        if(i === 0){
          showRoute(route.legs);
          result.addClass("selected")
        }
      });
    });
  }
  
  function getLegTypeString(typeId){
    switch(typeId){
      case "walk": return "walk"; break;
      case "2": return "tram"; break;
      case "6": return "metro"; break;
      case "7": return "ferry"; break;
      case "12": return "train"; break;
      default: return "bus";
    } 
  }

  function initializeTimeChooser() {
    console.log("timeChooser");

    $("body").append("<div id='overlay'></div>");

    $("body").append("<div id='time-chooser'></div>");

  }
});