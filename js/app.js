$(document).ready(function(){
  console.log("Hello World from app.js");
  
  initializeMap();
  initializeSwitches();
  getRoute();
  
  var map;
  var startMarker;
  var endMarker;
  var otherMarkers;
  var polyline;
  var legLinesAndMarkers;

  function initializeMap() {
    var c = config.locs.mapcenter;
    var latlng = new google.maps.LatLng(c.lat,c.lng);
    var myOptions = {
      zoom: 12,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"),
    myOptions);

    var startDefaultLatLng = new google.maps.LatLng(60.1885493977,24.8339133406);
    var endDefaultLatLng = new google.maps.LatLng(60.17173291474175,24.92356349471379);

    // Get start and end from config, if available
    $.each(config.locs, function(i, loc){
      if ("start" in loc) {
        startDefaultLatLng = new google.maps.LatLng(loc.lat,loc.lng);
      } else if ("end" in loc) {
        endDefaultLatLng = new google.maps.LatLng(loc.lat,loc.lng);
      }
    });


    var startIcon = new google.maps.MarkerImage("images/your-position-small.png",null,null,new google.maps.Point(10,10));
    console.log(startIcon);
    startMarker = new google.maps.Marker({
      position: startDefaultLatLng,
      draggable: false,
      title: "Start",
      icon: startIcon
    });
    startMarker.setMap(map);
    //google.maps.event.addListener(startMarker, 'mouseup', getRoute);

    endMarker = new google.maps.Marker({
      position: endDefaultLatLng,
      draggable: true,
      title: "End",
      icon: "https://chart.googleapis.com/chart?chst=d_map_spin&chld=1|0|ff0000|12|b|End"
    });
    endMarker.setMap(map);
    google.maps.event.addListener(endMarker, 'mouseup', getRoute);

    otherMarkers = [];
    $.each(config.locs, function(i, loc){
      if (!("nomap" in loc)) {
        console.log('other location:'+config.locs[i].title);
        var latLng = new google.maps.LatLng(loc.lat, loc.lng);

        var marker = new google.maps.Marker({
          position: latLng,
          draggable: false,
          title: loc.title,
          zIndex: 0,
          icon: "https://chart.googleapis.com/chart?chst=d_map_spin&chld=1|0|ffffff|9|b|"+loc.title
        });
        marker.setMap(map);
        google.maps.event.addListener(marker, 'mouseup',
          function() {
            endMarker.setPosition(latLng);
            getRoute();
          }
        );

        otherMarkers.push(marker);
      }
    });

    legLinesAndMarkers = [];
  }

  function initializeSwitches() {
    var switches = $('<div id="map_switches"></div>');
    switches.append('<a id="switch-toggle-other-markers" href="javascript:;">'
        +'Campus markers</a>'
        +'<a id="switch-toggle-your-position" href="javascript:;">'
        +'Your position</a>');
    $("#map_canvas").append(switches);
    $("#switch-toggle-other-markers").click(function(){
      var isOff = $(this).hasClass("off");
      $.each(otherMarkers, function(i, marker){
        marker.setVisible(isOff);
        if(isOff) {
          $("#switch-toggle-other-markers").removeClass("off");
        } else {
          $("#switch-toggle-other-markers").addClass("off");
        }
      });
    });
    $("#switch-toggle-your-position").click(function(){
      var isOff = $(this).hasClass("off");
      startMarker.setVisible(isOff);
      if(isOff) {
        $("#switch-toggle-your-position").removeClass("off");
      } else {
        $("#switch-toggle-your-position").addClass("off");
      }
    });
  }

  function getTransportHex(type, variant) {
    color = "";
    switch(type) {
      case "walk": color = "499bff"; break;
      case "tram": color = "00ae2e"; break;
      case "metro": color = "fb6500"; break;
      case "ferry": color = "00aee7"; break;
      case "train": color = "e9001a"; break;
      // bus
      default: color = "193695";
    }

    if (variant === "light") {
      switch(type) {
        case "walk": color = "8dd2ff"; break;
        case "tram": color = "5ee764"; break;
        case "metro": color = "ff9c42"; break;
        case "ferry": color = "69e6ff"; break;
        case "train": color = "ff7d61"; break;
        // bus
        default: color = "5a65cc";
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
        strokeOpacity: 0.9,
        strokeWeight: 5,
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
    //console.log("from:"+from)
    
    var toLatLng = endMarker.getPosition()
    var to = toLatLng.lng() + "," + toLatLng.lat()
    //console.log("to:"+to)

    var params = "?request=route&from="+from+"&to="+to+"&format=json&epsg_in=wgs84&epsg_out=wgs84"
    var account = "&user="+config.user+"&pass="+config.pass

    $.getJSON(config.api+params+account, function(data){
      //console.log(data);
      $.each(data, function(i,val){
        var route = val[0];
        var routePath= []

        console.log(route);
        var result = $("<div class='result'></div>");
        result.append("<h3>"+(i+1)+"</h3>");
        var startTime = route.legs[0].locs[0].depTime;
        var endTime = route.legs[route.legs.length-1].locs[route.legs[route.legs.length-1].locs.length-1].arrTime;
        result.append("<h4>"
            +startTime.substr(8,2)+":"+startTime.substr(10,2)
            +" &ndash; "
            +endTime.substr(8,2)+":"+endTime.substr(10,2)
            +"</h4>");

        var legs = $("<ol></ol>").appendTo(result)
        
        $.each(route.legs, function(i,leg){
          var legItem = $("<li></li>").appendTo(legs)
          
          var time = leg.locs[0].depTime;
          legItem.append("<span class='time'>"+time.substr(8,2)+":"+time.substr(10,2)+"</span> ");

          var type = getLegTypeString(leg.type)
          legItem.append("<span class='type'>"+type+"</span> ");

          if(type === "walk"){
             legItem.append("<span class='meters'>"+leg.length + "m</span>");
          } else {
            legItem.append("<span class='type'>" + formatVehicleCode(leg.code,type) + "</span> ");

            var startEndString = "<span class='places'>";
            if (leg.locs[0].name)
                startEndString += leg.locs[0].name;
            else
                startEndString += "???";
            startEndString += " &ndash; ";
            if (leg.locs[leg.locs.length-1].name)
                startEndString += leg.locs[leg.locs.length-1].name
            else
                startEndString += "???";
            startEndString += "</span>";

            legItem.append(startEndString);
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