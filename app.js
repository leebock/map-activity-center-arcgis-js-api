require(
[
	"esri/Map", 
	"esri/views/MapView", 
	"esri/layers/GraphicsLayer", 
	"esri/Graphic", 
	"esri/geometry/Point",
	"esri/geometry/SpatialReference",
	"esri/symbols/PictureMarkerSymbol",
	"esri/geometry/Extent",
	"esri/widgets/Attribution",
	"esri/Viewpoint",
	"esri/widgets/Home"
],	 
function(
	Map, 
	MapView, 
	GraphicsLayer, 
	Graphic, 
	Point, 
	SpatialReference, 
	PictureMarkerSymbol, 
	Extent,
	Attribution,
	Viewpoint,
	Home
	) {

	"use strict";

    $(document).ready(function() {

        const CITIES = [
          {name: "L.A.", latLng: [34.05, -118.27]},
          {name: "Seattle", latLng: [47.61, -122.34]},
          {name: "Denver", latLng: [39.73, -104.96]},
          {name: "NYC", latLng: [40.78, -73.96]},
          {name: "Miami", latLng: [25.79, -80.21]}
        ];
		
		var VIEWPOINT_HOME = new Viewpoint({
			targetGeometry: new Extent({xmin: -122.34, ymin: 25.79, xmax: -73.96, ymax: 47.61}),
		});

		var _sheet = document.createElement('style');
		document.body.appendChild(_sheet);			        
        // build out UI (this part should be map library independent)
		
		var _table = $(new Table($("div#controls ul").get(0)))
		   .on("itemActivate", table_onItemActivate)
		   .on("itemHide", table_onItemHide)
		   .get(0);		
		
		_table.load($.map(CITIES, function(value){return {record: value, html: value.name};}));

		$("button#rate").click(
			function() {
				$("div#modal").css("display", "flex");
				$("div.noUi-handle.noUi-handle-lower").focus();
			}
		);
		$("div#modal button#cancel").click(function(){$("div#modal").css("display", "none");});
		$("div#modal button#apply").click(
			function(){
				$("div#modal").css("display", "none");
				$("button#rate").empty();
				for (var i=0; i<parseInt(slider.noUiSlider.get(0)); i++) {
					$("button#rate").append($("<div>").addClass("octopus"));
				}
			}
		);
		        
        noUiSlider.create(
            $("div#slider").get(0), 
            {start: [1], range: {'min': 1,'max': 5}, step: 1}
        );    
		for (var i=0; i < slider.noUiSlider.options.range.max; i++) {
			$("div#octopodes").append($("<img>").attr("src", "resources/octopus.png"));
		}
		$("div#octopodes img:nth-of-type(1)").show();
        slider.noUiSlider.on(
            "slide", 
            function(values){
				$.each(
					$("div#octopodes img"),
					function(index, value) {
						$(value).css("display", index < parseInt(values[0]) ? "block" : "none");
					}
				);
			}
        );

        /********** All map specific stuff below this line *****************/

        // create map & layer, then load the graphics

		var _map = new Map({basemap: "streets"});
		var _layerMarkers = new GraphicsLayer();		
		_map.add(_layerMarkers);
		loadMarkers();

		// create and configure view
		
		var _view = new MapView({map: _map, container: "map", padding: getPadding()});
		_view.on("click", view_onClick);
		_view.goTo(VIEWPOINT_HOME); // establish viewpoint after padding
		_view.popup.visibleElements = {closeButton: false};
		_view.popup.dockOptions.buttonEnabled = false;
		_view.popup.actions.removeAll();
		_view.popup.alignment = "top-center";
		_view.ui.move("zoom", "top-right");
		_view.ui.add(new Home({view: _view, viewpoint: VIEWPOINT_HOME}), "top-right");
		_view.ui.remove("attribution");
		
		// create attribution div whose position can be tweaked
		
		$("<div>")
			.attr("id", "my-attribution")
			.css("position", "absolute")
			.css("left", "0px")
			.css("bottom", "0px")
			.css("background", "rgba(255,255,255,0.8)")
			.css("z-index", 5000)
			.appendTo($("section"));
			
		new Attribution({view: _view, container: $("div#my-attribution").get(0)});
		
		function view_onClick(event)
		{
			_view.hitTest(event).then(
				function(response) {
					if (response.results.length === 0) {
						_table.clearActive();
						loadMarkers();
						_view.goTo(VIEWPOINT_HOME, {duration: 1000});
					} else {
						var data = response.results.shift().graphic.attributes;
						_table.activate(data);
						loadMarkers();
						var targetPoint = new Point(data.latLng.slice().reverse());
						_view.goTo(
							new Viewpoint({targetGeometry: targetPoint, scale: 30000000}),
							{duration: 500}
						).then(function(){showPopup(data.name, targetPoint);});
					}
				}
			);
		}
		
        // table event handlers

        function table_onItemActivate(event, data, reset) {
			loadMarkers();
			if (reset) {
				_view.popup.close();
				_view.goTo(VIEWPOINT_HOME, {duration: 1000});
            } else {
				var targetPoint = new Point(data.latLng.slice().reverse());
				_view.goTo(
					new Viewpoint({targetGeometry: targetPoint, scale: 30000000}),
					{duration: 1000}
				);
				showPopup(data.name, targetPoint);
			}
        }
        
        function table_onItemHide(event) {
            loadMarkers();
            if (_table.getVisibleRecords().length === 1) {
				var data = _table.getVisibleRecords().shift();
				var targetPoint = new Point(data.latLng.slice().reverse());
				_view.goTo(
					new Viewpoint({targetGeometry: targetPoint, scale: 30000000}),
					{duration: 1000}
				);
				showPopup(data.name, targetPoint);
            } else {
				_view.popup.close();
				_view.goTo(VIEWPOINT_HOME, {duration: 1000});
            }
        }

        /************************** Functions ****************************/

        function loadMarkers()
        {
			_layerMarkers.removeAll();
			var symbol = new PictureMarkerSymbol({
				url: "resources/marker-icon.png", 
				width: 18, height: 30, xoffset: -1, yoffset: 14
			});
			var tiny = new PictureMarkerSymbol({
				url: "resources/marker-icon-faded.png", 
				width: 18, height: 30, xoffset: -1, yoffset: 14
			});
            $.each(
                _table.getVisibleRecords(),
                function(index, data) {
					var graphic = new Graphic({
						geometry: new Point(data.latLng[1], data.latLng[0]), 
						symbol: _table.getActive() && data !== _table.getActive() ? tiny : symbol,
						attributes: data
					});
					_layerMarkers.add(graphic);
                }
            );
        }
		
		function showPopup(title, location)
		{
			var width = 100; // opportunity to calculate a width here
			_sheet.innerHTML = ".esri-view-width-medium .esri-popup__main-container {width: "+width+"px}";
			_view.popup.dockEnabled = false;
			_view.popup.open({location: location, content: null, title: title});			
		}

        // helper function    

        function getPadding()
        {
            return {
                left: $("div#controls").outerWidth() + parseInt($("div#controls").position().left),
				top: 0,
                right: 0,
                bottom: $("div#map").outerHeight() - $("button#rate").position().top
            };
        }

        
    });

} 

);