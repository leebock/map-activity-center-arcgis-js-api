function Tooltip(container)
{
	this._container = container;
	this._div = $("<div>").addClass("tooltip").attr("role", "tooltip").appendTo(container);
}

Tooltip.prototype.hide = function()
{
	this._div.hide();	
};

Tooltip.prototype.show = function(text, x, y)
{
	
	this._div
		.text(text)
		.css("left", parseInt(x))
		.css("top", parseInt(y));
		
	var classes = [
		"upper-right",
		"upper-center",
		"upper-left",
		"center-left",
		"bottom-left",
		"bottom-center",
		"bottom-right",
		"center-right",
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
		var boundaryLeft = 0;
		var boundaryTop = 0;
		var boundaryBottom = $(container).outerHeight();
		
		var left = parseInt(div.position().left)+parseInt(div.css("margin-left"));
		var right = left+parseInt(div.outerWidth());
		var spitze = parseInt(div.position().top)+parseInt(div.css("margin-top"));
		var bottom = spitze+parseInt(div.outerHeight());
		
		return right < boundaryRight &&
				left > boundaryLeft && 
				spitze > boundaryTop && 
				bottom < boundaryBottom;
		
	}

};

