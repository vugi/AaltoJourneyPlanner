$(document).ready(function(){
  console.log("Hello World from app.js");
  
  initializeMap();
  getRoute();
  
  var map;
  var startMarker;
  var endMarker;
  
  function initializeMap() {
    var latlng = new google.maps.LatLng(60.1885493977,24.8339133406);
    var myOptions = {
      zoom: 12,
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
      icon: "images/route-start.png"
    });
    startMarker.setMap(map);
    google.maps.event.addListener(startMarker, 'mouseup', getRoute);
    
    var endDefaultLatLng = new google.maps.LatLng(60.1882074634,24.88797846);
    endMarker = new google.maps.Marker({
      position: endDefaultLatLng,
      draggable: true,
      title: "End",
      icon: "images/route-end.png"
    });
    endMarker.setMap(map);
    google.maps.event.addListener(endMarker, 'mouseup', getRoute);
  }
  
  function getRoute(){
    console.log("getRoute")
    
    var fromLatLng = startMarker.getPosition()
    var from = fromLatLng.lng() + "," + fromLatLng.lat()
    console.log("from:"+from)
    
    var toLatLng = endMarker.getPosition()
    var to = toLatLng.lng() + "," + toLatLng.lat()
    console.log("to:"+from)

    var params = "?request=route&from="+from+"&to="+to+"&format=json&epsg_in=wgs84&epsg_out=wgs84"
    var account = "&user="+config.user+"&pass="+config.pass
    
    $("#results").empty()

    $.getJSON(config.api+params+account, function(data){
      console.log(data);
      $.each(data, function(i,val){
        var route = val[0];
        console.log(route)
        var result = $("<div></div>");
        result.append("<h3>Route "+(i+1)+"</h3>");

        var legs = $("<ul></ul>")
        $.each(route.legs, function(i,leg){
          legs.append("<li>"+getLegTypeString(leg.type) + " " + leg.length + "m</li>")
        });
        result.append(legs)

        result.append("Length: " + route.length);
        result.append("<br/>Duration: " + route.duration/60 + " minutes");
        $("#results").append(result);
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
});