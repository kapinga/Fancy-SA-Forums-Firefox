/* Copyright (c) 2012, Jonathon Harding
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy 
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights 
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
 * copies of the Software, and to permit persons to whom the Software is 
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in 
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS 
 * IN THE SOFTWARE.
 */

/* This function is intended to include all of the Firefox specific code needed
 * to make fancy.js work
 */

// Wrap all this code in a separate namespace
fancySAHelper = {
  adframeRegEx: /^http:\/\/forums\.somethingawful\.com\/(adframe\.php|eyewonder)/i,
  breakTablesRegEx: /^http:\/\/forums\.somethingawful\.com\/(showthread\.php?.*|newreply\.php?|editpost\.php)/i,
  
  baseURL: null,
  getURL: function(url) {
    return (fancySAHelper.baseURL + url);
  },
  
  saveOption: function(key, val) {
    self.port.emit("saveOption", {
      key: key,
      value: val
    });
  },
  
  init: function () {
    // Initialize the self.port listeners
    self.port.on("getOptions", function(options) {
      self.port.emit("log", "Options recieved");
      fancySAForums.options = options;
    });
    
    self.port.on("getURL", function(url) {
      // Once we receive the URL, define baseURL
      self.port.emit("log", "URL received");
      fancySAHelper.baseURL = url.substr(0, url.length-1);
	  // And attach the CSS
	  fancySAHelper.AttachCSS(0);
	  
      // When the "ready" event finally hits, start modifying the page
      jQuery("document").ready(function () {
        self.port.emit("log", "Page is ready");
        fancySAForums.fancify();
        self.port.emit("log", "fancify completed");
        if (fancySAHelper.breakTablesRegEx.test(document.location)) {
          self.port.emit("log", "Unbreaking tables...");
          fancySAHelper.UnbreakTables();
          self.port.emit("log", "Tables unbroken");
        }
        self.port.emit("log", "Page complete");
      });
    });
    
    // This script doesn't need to run on ads
    // So skip those pages:
    if (!(fancySAHelper.adframeRegEx.test(document.location))) {
      // Request the extension's base URL, then get started
      self.port.emit("getURL", null);
	  // And request all the options too
      self.port.emit("getOptions", null);
    }
  },
  
  AttachCSS: function(count) {
	self.port.emit("log", "AttachCSS started");
	css = $("link[rel=stylesheet][href$='globalcss/globalmenu.css']");
	if (css.size() === 0) {
		css = $("link[rel=stylesheet][href='/aw/css/core.min.css']");
	}
	if (css.size() > 0) {
		// Attach a bit of CSS that makes things look good before the script finishes
		$(css).after("<style type='text/css'> body > #globalmenu { margin: 0 auto !important; } #content > div.pages, #content > #ac_timemachine { display: none; } </style>");
		// And attach the main fancy.css
		$(css).after("<link rel='stylesheet' type='text/css' href='" + fancySAForums.browser.getURL("/css/fancy.css") + "' />");
		fancySAForums.AttachCSS();
	} else {
		if count < 1000 {
			window.setTimeout(function() {
				fancySAHelper.AttachCSS(count+1);
			}, 10);
		}
	}
  },

  // For pages that might contain table-breaking images, this function will
  // resize them downwards.
  
  // Modified from the original chrome script to take advantage of the
  // -moz-available feature, which will allow Firefox to resize the images
  // to fit within their parent containers.
  UnbreakTables: function () {
    /* stop breaking the fucking tables with your stupid images yall */

    // thanks to Paolo Bergantino, Nick Craver & Andrew Ramdsen
    // http://stackoverflow.com/questions/965816/what-jquery-selector-excludes-items-with-a-parent-that-matches-a-given-selector/965962#965962
    // http://stackoverflow.com/questions/3877027/jquery-callback-on-image-load-even-when-the-image-is-cached
    // http://irama.org/news/2011/06/05/cached-images-have-no-width-or-height-in-webkit-e-g-chrome-or-safari/

    // Attach the css that will prevent the parent elements from expanding
    // to fit the table-breaking images
	$("head").append("<style type='text/css'> table.post {table-layout:fixed;} td.userinfo {min-width:-moz-min-content;} div.bbc-block {overflow-x:auto;}</style>");
    jQuery.expr[':'].parents = function(a,i,m){
      return jQuery(a).parents(m[3]).length < 1;
    };

    $(".postbody img.img, .attachment img").one('load', function() {
      var img = this;
      
      setTimeout(function() {
        $(img).attr('original-width', $(img).width());
        $(img).attr('original-height', $(img).height());
        
        //(img).css('max-width', '100%');
        $(img).css('max-width', '-moz-available');
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
  }
}