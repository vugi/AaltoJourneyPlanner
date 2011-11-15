$(document).ready(function(){
  console.log("Hello World from app.js");
  
  var from = "2546445,6675512"
  var to = "2549445,6675513"

  var params = "?request=route&from="+from+"&to="+to+"&format=json"
  var account = "&user="+config.user+"&pass="+config.pass

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