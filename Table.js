function Table(ul)
{
	var _self = this;
	this.load = function(pairs/*{record, html}*/)
	{
        $.each(
          pairs,
          function(index, value) {  
            $("<li>")
                .data(value.record)
                .append(
                    $("<button>").text(value.html).click(
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
                            $(_self).trigger("itemActivate", [$(this).parent().data(), $("li.selected", ul).length === 0]);
                        }
                    )
                )
                .append($("<button>")
					.addClass("hide")
					.attr("title", "Remove city from map and table.")
					.click(
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
                          $(_self).trigger("itemHide", []);                          
                        }
                    )
                )                    
              .appendTo(ul);
          }
        );
	};
    
    this.getNumberVisibleItems = function()
    {
        return $("li", ul).not(".hidden").length;
    };
    
    this.getVisibleRecords = function()
    {
        return $.map(
            $("li", ul).not(".hidden"), 
            function(value) {
                return $(value).data();
            }
        );        
    };
	
	this.getActive = function()
	{
		return $("li.selected", ul).data();
	};
	
	this.clearActive = function()
	{
		$("li", ul).removeClass("selected").removeClass("ghosted");
	};
	
	this.activate = function(record)
	{
		$("li", ul).removeClass("selected").removeClass("ghosted");
		$($.grep($("li", ul), function(value){return $(value).data() === record;})).addClass("selected");
		$("li", ul).not(".selected").addClass("ghosted");
	};

}

Table.prototype = {};