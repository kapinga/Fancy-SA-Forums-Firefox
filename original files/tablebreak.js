/* stop breaking the fucking tables with your stupid images yall */

// thanks to Paolo Bergantino, Nick Craver & Andrew Ramdsen
// http://stackoverflow.com/questions/965816/what-jquery-selector-excludes-items-with-a-parent-that-matches-a-given-selector/965962#965962
// http://stackoverflow.com/questions/3877027/jquery-callback-on-image-load-even-when-the-image-is-cached
// http://irama.org/news/2011/06/05/cached-images-have-no-width-or-height-in-webkit-e-g-chrome-or-safari/

jQuery.expr[':'].parents = function(a,i,m){
    return jQuery(a).parents(m[3]).length < 1;
};

$(".postbody img.img, .attachment img").one('load', function() {
	var img = this;
	
	setTimeout(function() {
		$(img).attr('original-width', $(img).width());
		$(img).attr('original-height', $(img).height());
		
		$(img).css('max-width', '-moz-available');
		// Awful ugly fixed value. Please god change this to something more intelligent. How?
		//$(img).maxSize({
		//	width: 752
		//});
	}, 0);
}).each(function() {
	if(this.complete) $(this).load();
});

$(window).load( function () {
	
	$(".postbody img.img, .attachment img").each(function () {
		if ($(this).width() < $(this).attr('original-width')) {
			$(this).filter(":parents(a)")
				.after("<div style='font-size:10px; font-style:italic'>" + $(this).attr('original-width') + "x" + $(this).attr('original-height') + " image automatically resized - click for big</div>")
				.wrap("<a href='" + $(this).attr("src") + "' target='_blank' />")
				.css("border", "2px yellow solid");
		}
	});
});