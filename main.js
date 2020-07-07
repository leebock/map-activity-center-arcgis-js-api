(function () {

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
        
        $.each(
          CITIES,
          function(index, value) {    
            $("<li>")
                .data(value)
                .append(
                    $("<button>").text(value.name).click(
                        function()
                        {
                            if ($(this).parent().hasClass("selected")) {
                                $(this).parent().removeClass("selected");
                                $("div#controls ul li").removeClass("ghosted");
                            } else {
                                $("div#controls ul li").removeClass("selected");
                                $("div#controls ul li").addClass("ghosted");
                                $(this).parent().addClass("selected").removeClass("ghosted");
                            }                        
                        }
                    )
                )
                .append($("<button>").addClass("hide").click(
                        function() {
                            $(this).parent().addClass("hidden");
                            $("div#controls ul li").removeClass("selected");
                            $("div#controls ul li").removeClass("ghosted");
                            if ($("div#controls ul li").not(".hidden").length === 0) {
                              $("div#controls ul li").removeClass("hidden");
                          } else if ($("div#controls ul li").not(".hidden").length === 1) {
                              $("div#controls ul li").not(".hidden").addClass("selected");
                          } else {
                              // nuttin...
                          }
                        }
                    )
                )                    
              .appendTo($("div#controls ul"));
          }
        );
        
        noUiSlider.create(
            $("div#slider").get(0), 
            {start: [11], range: {'min': 1,'max': 11}, step: 1}
        );    

        slider.noUiSlider.on(
            "slide", 
            function(values){$("div#rating label:last-child").text(parseInt(values[0]));}
        );

        /********** All map specific stuff below this line *****************/

        // create map

        var _map = L.map(
                "map", 
                {center: [40, -95], zoom: 2, zoomControl: false, attributionControl: false}
            )
            .addLayer(L.esri.basemapLayer("Streets"))
            .addControl(L.control.zoom({position: "topright"}))
            .addControl(L.control.attribution({position: "bottomleft"}));
            
        // override the methods called when zoom control buttons are clicked.  doing this
        // in order to account for padding due to absolutely positioned div#controls

        _map.zoomIn = function(){
            this.setView(
                calcOffsetCenter(this.getCenter(), this.getZoom()+1, getPadding()),
                this.getZoom()+1
            );
        };

        _map.zoomOut = function(){
            this.setView(
                calcOffsetCenter(this.getCenter(), this.getZoom()-1, getPadding()),
                this.getZoom()-1
            );
        };

        // load markers
        
        var _layerMarkers = L.featureGroup().addTo(_map);
        loadMarkers();

        // zoom to initial extent

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
        _map.fitBounds(_layerMarkers.getBounds(), getPadding());
        
        // assign UI event handlers

        $("div#controls ul li button:nth-of-type(1)").click(
            function() {
                var data = $(this).parent().data();
                loadMarkers();
                if ($("div#controls ul li.selected").length === 0) {
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
            }
        );
        
        $("div#controls ul li button.hide").click(
            function() {
                loadMarkers();
                if ($("div#controls ul li").length - $("div#controls ul li.hidden").length === 1) {
                    var data = $($.grep(
                        $("div#controls ul li"), 
                        function(value){return !$(value).hasClass("hidden");}
                    )).data();
                    _map.flyToBounds(
                        L.latLng(data.latLng).toBounds(2000000), 
                        getPadding()
                    );
                } else {
                    _map.fitBounds(_layerMarkers.getBounds(), getPadding());
                }
            }
        );

        /************************** Functions ****************************/
        
        function loadMarkers()
        {
            _layerMarkers.clearLayers();
            $.each(
                $.grep(
                    $("div#controls ul li"), 
                    function(value) {return !$(value).hasClass("hidden");}
                ),
                function(index, li) {
                    var data = $(li).data();
                    var marker = L.marker(data.latLng)
                        .addTo(_layerMarkers)
                        .bindPopup(data.name,{closeButton: false})
                        .bindTooltip(data.name)
                        .on("click", function(){$(".leaflet-tooltip").remove();});
                    marker.properties = data;  
                    marker.setOpacity($(li).hasClass("ghosted") ? 0.5 : 1);
                }
            );
        }
        
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
        
        // helper function    
        
        function getPadding()
        {
            return {
                paddingTopLeft: [
                    $("div#controls").outerWidth() + parseInt($("div#controls").position().left),
                    24
                ], 
                paddingBottomRight: [
                    0,
                    $("#map").height() - $("div#rating").position().top
                ]
            };
        }
        
    });

})();