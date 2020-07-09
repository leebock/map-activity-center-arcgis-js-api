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
	"esri/widgets/Attribution"
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
	Attribution
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

        // create map

		
		/*	
        var _map = L.map(
                "map", 
                {center: [40, -95], zoom: 2, zoomControl: false, attributionControl: false}
            )
            .addLayer(L.esri.basemapLayer("Streets"))
            .addControl(L.control.zoom({position: "topright"}))
            .addControl(L.control.attribution({position: "bottomleft"}))
			.on("click", map_onClick);
        */
		var _layerMarkers = new GraphicsLayer();
		loadMarkers();
		var _map = new Map({basemap: "streets"});
		var _view = new MapView({
			map: _map, 
			container: "map", 
			center: new Point(-95, 40),
			scale: 60000000
		});		
		
        // load markers

		/*
        var _layerMarkers = L.featureGroup().addTo(_map).on("click", marker_onClick);
		*/
		
		_map.add(_layerMarkers);
		
        // zoom to initial extent
		/*
        L.easyButton({
            states:[
                {
                    icon: "fa fa-home",
                    onClick: function(btn, map){
                        _map.fitBounds(_layerMarkers.getBounds(), getPadding());
                    },
                    title: "Full extent"
                }
            ],
            position: "topright"
        }).addTo(_map);			        
        */
		_view.padding = getPadding();
		_view.extent = _layerMarkers.extent;
		_view.ui.move("zoom", "top-right");
		_view.ui.remove("attribution");
		$("<div>")
			.attr("id", "my-attribution")
			.css("position", "absolute")
			.css("left", "0px")
			.css("bottom", "0px")
			.css("background", "rgba(255,255,255,0.8)")
			.css("z-index", 5000)
			.appendTo($("section"));
		new Attribution({view: _view, container: $("div#my-attribution").get(0)});
		
		/*
		function map_onClick()
		{
			_table.clearActive();
			loadMarkers();
			_map.fitBounds(_layerMarkers.getBounds(), getPadding());
		}
		*/
		/*
		function marker_onClick(e)
		{
			var data = e.layer.properties;
			$(".leaflet-tooltip").remove();			
			_table.activate(data);
			loadMarkers();
			_map.flyToBounds(
				L.latLng(data.latLng).toBounds(2000000), 
				getPadding()
			);
			$.grep(
				_layerMarkers.getLayers(), 
				function(layer){return layer.properties === data;}
			).shift().openPopup();
		}
		*/
        // table event handlers

        function table_onItemActivate(event, data, reset) {
			/*
            loadMarkers();
            if (reset) {
                _map.fitBounds(_layerMarkers.getBounds(), getPadding());
            } else {
                _map.flyToBounds(
                    L.latLng(data.latLng).toBounds(2000000), 
                    getPadding()
                );
                $.grep(
                    _layerMarkers.getLayers(), 
                    function(layer){return layer.properties === data;}
                ).shift().openPopup();
            } 
			*/           
        }
        
        function table_onItemHide(event) {
			/*
            loadMarkers();
            if (_table.getVisibleRecords().length === 1) {
				var data = _table.getVisibleRecords().shift();
                _map.flyToBounds(
                    L.latLng(data.latLng).toBounds(2000000), 
                    getPadding()
                );
            } else {
                _map.fitBounds(_layerMarkers.getBounds(), getPadding());
            }
			*/
        }

        /************************** Functions ****************************/
        function loadMarkers()
        {
			_layerMarkers.removeAll();
			var symbol = new PictureMarkerSymbol({
				url: "resources/marker-icon.png", 
				width: 18, height: 30, xoffset: -1, yoffset: 14
			});
            $.each(
                _table.getVisibleRecords(),
                function(index, data) {
					var graphic = new Graphic({
						geometry: new Point(data.latLng[1], data.latLng[0]), 
						symbol: symbol
					});
					_layerMarkers.add(graphic);
					/*
                    var marker = L.marker(data.latLng)
                        .addTo(_layerMarkers)
                        .bindPopup(data.name,{closeButton: false})
                        .bindTooltip(data.name);
                    marker.properties = data;  
                    if (_table.getActive() && data !== _table.getActive()) {
						marker.setOpacity(0.5);
					}
					*/
                }
            );
        }
		/*
        function calcOffsetCenter(center, targetZoom, paddingOptions)
        {
            var targetPoint = _map.project(center, targetZoom);
            if (targetZoom < _map.getZoom()) {
                targetPoint = targetPoint.subtract([
                    (paddingOptions.paddingTopLeft[0] - paddingOptions.paddingBottomRight[0])/4,
                    (paddingOptions.paddingTopLeft[1] - paddingOptions.paddingBottomRight[1])/4
                ]);
            } else {                
                targetPoint = targetPoint.add([
                    (paddingOptions.paddingTopLeft[0] - paddingOptions.paddingBottomRight[0])/2,
                    (paddingOptions.paddingTopLeft[1] - paddingOptions.paddingBottomRight[1])/2
                ]);
            }
            return _map.unproject(targetPoint, targetZoom);
        }
        */
        // helper function    

        function getPadding()
        {
            return {
                left: $("div#controls").outerWidth() + parseInt($("div#controls").position().left),
				top: 0,
                right: 0,
                bottom: $("div#map").outerHeight() - $("button#rate").position().top /*$("div#octopodes").outerHeight() + 10*/
            };
        }

        
    });

} 

);