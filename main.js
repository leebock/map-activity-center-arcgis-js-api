$(document).ready(function() {

    const CITIES = [
      {name: "Los Angeles", latLng: [34.05, -118.27]},
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
          .append($("<label>").text(value.name))
          .data(value)
          .append($("<button>").addClass("hide").click(function(){$(this).toggleClass("active");}))
          .append($("<button>").addClass("ghost").click(function(){$(this).toggleClass("active");}))
          .append($("<button>").addClass("zoom-to"))
          .appendTo($("div#controls ul"));
      }
    );
    
    noUiSlider.create($("div#slider").get(0), {start: [100], range: {'min': 1,'max': 100}});

    /********** All map specific stuff below this line *****************/

    // create map

    var _map = L.map("map", {center: [40, -95], zoom: 2, zoomControl: false})
        .addLayer(L.esri.basemapLayer("Streets"))
        .addControl(L.control.zoom({position: "topright"}));

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
    
    var _layerGroup = L.layerGroup().addTo(_map);
    loadMarkers();

    // zoom to initial extent

    const FULL_EXTENT = L.latLngBounds(
        $.map(CITIES, function(value){return L.latLng(value.latLng);})
    );
    _map.fitBounds(FULL_EXTENT, getPadding());
    
    // assign UI event handlers

    $("div#controls ul li button.zoom-to").click(
        function() {
            var ll = $(this).parent().data().latLng;
            _map.flyToBounds(L.latLng(ll).toBounds(100000), getPadding());
        }
    );
    $("div#controls ul li button.ghost").click(function(){loadMarkers()});
    $("div#controls ul li button.hide").click(function(){loadMarkers()});
    
    slider.noUiSlider.on("change", function(){});

    /************************** Functions ****************************/
    
    function loadMarkers()
    {
        _layerGroup.clearLayers();
        $.each(
            $.grep(
                $("div#controls ul li"), 
                function(value) {return !$("button.hide", value).hasClass("active");}
            ),
            function(index, li) {
                var data = $(li).data();
                var marker = L.marker(data.latLng)
                    .addTo(_layerGroup)
                    .bindPopup(data.name,{closeButton: false})
                    .bindTooltip(data.name)
                    .on("click", function(){$(".leaflet-tooltip").remove();});
                marker.properties = data;  
                marker.setOpacity($("button.ghost", li).hasClass("active") ? 0.5 : 1);
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
                0
            ], 
            paddingBottomRight: [0,0]
        };
    }
    
});