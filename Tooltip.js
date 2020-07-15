function Tooltip(container)
{
	var _self = this;
	this._container = container;
	this._div = $("<div>").addClass("tooltip").attr("role", "tooltip").appendTo(container);
}

Tooltip.prototype.hide = function()
{
	this._div.hide();	
}

Tooltip.prototype.show = function(text, screenPoint)
{
	
	this._div
		.text(text)
		.css("left", parseInt(screenPoint.x))
		.css("bottom", $("#map").outerHeight() - (parseInt(screenPoint.y)));
		
	var classes = [
		"upper-right",
		"upper-center",
		"upper-left",
		"center-right",
		"center-left",
		"bottom-left",
		"bottom-center"
	];
	
	this._div.show();
	
	// move through each of the positions until one doesn't overflow 
	// the container (or until the options run out...)
	
	var i = 0;
	do {
		this._div.removeClass(classes.join(" "));
		this._div.addClass(classes[i]);
		i++;
	} while (!isWithin(this._div, this._container) && i < classes.length);
				
	function isWithin(div, container)
	{
		var boundaryRight = $(container).outerWidth();
		var boundaryTop = 0;			
		var right = parseInt(div.position().left)+div.outerWidth();
		if ($("div.tooltip").css("transform") !== "none") {
			right = right + parseInt($("div.tooltip").css("transform").split(/[()]/)[1].split(',')[4]);
		}
		right = right + parseInt($("div.tooltip").css("margin-left"));
		return boundaryRight > right && $("div.tooltip").position().top > boundaryTop;
	}

}

