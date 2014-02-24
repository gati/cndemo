var app = (function() {

	'use strict';
	var docElem = document.documentElement;

	var mapOptions = {
      center: new google.maps.LatLng(-1.292066, 36.821946),
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI:true,
      streetViewControl: false,
      draggable: true,
      navigationControl: false,
      scalControl: false,
      panControl: false,
      zoomControl: false,
      scaleControl: false,
      scrollwheel: false
    };

  var getTrafficIncidents = function(cb) {
  	$.getJSON("http://198.61.171.237:8083/item?tags=accident&location=36.821946,-1.292066", cb);
  };

  var lastRetrieved = null;
  var updateTrafficChatter = function(cb, init) {
  	var url = "http://198.61.171.237:8083/item?sources=twitter,facebook";
  	if(!init) {
  		url += "&after=" + lastRetrieved.publishedAt;
  	}
  	$.getJSON(url, cb);
  };


  var init = function() {
  	var streetMap = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  	
  	var markers = [];
        
  	getTrafficIncidents(function(data) {
  		$.each(data, function(idx, val) {
  			var coords = val.obj.geo.coordinates;
	  		var latLng = new google.maps.LatLng(coords[1], coords[0]);
	  		console.log(coords);
	  		console.log(val.obj.geo.addressComponents.formattedAddress);
	  		var marker = new google.maps.Marker({
			      position: latLng,
			      map: streetMap,
			      title: val.obj.content
			  });
			  markers.push(marker);
  		});

  		var markerCluster = new MarkerClusterer(streetMap, markers);
  	});

  	var trafficChatterCb = function(data) {
  		var trafficChatterEl = $("#traffic-chatter");
  		if(data.length > 0) {
  			lastRetrieved = data[0];
  		}
  		var arr = data.reverse();

  		$.each(arr, function(idx, obj) {
  			trafficChatterEl.prepend("<li class='active'>"+obj.content+"<br><small>"+moment(obj.publishedAt).from()+" from "+obj.source+"</small></li>");
  		});

  		setTimeout(function() {
  			updateTrafficChatter(trafficChatterCb);
  		},5000);
  	};
  	
  	updateTrafficChatter(trafficChatterCb, true);

  	$("pre.js").snippet("javascript",{style:"bright",transparent:true,showNum:false});
  };

	return {
		userAgentInit: function() {
			docElem.setAttribute('data-useragent', navigator.userAgent);
		},
		init: init
	};

})();

(function() {

	'use strict';

	app.userAgentInit();

	$(app.init);
	//foundation init
	$(document).foundation();

})();