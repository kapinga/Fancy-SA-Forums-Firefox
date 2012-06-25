/* Copyright (c) 2011, Jonathon Harding
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
if (fancySAHelper === undefined) {
  fancySAHelper = {
    //adframeRegEx: /^http:\/\/forums\.somethingawful\.com\/(adframe\.php|eyewonder)/i,
    //searchRegEx: /^http:\/\/forums\.somethingawful\.com\/f\/search/i,
    breakTablesRegEx: /^http:\/\/forums\.somethingawful\.com\/(showthread\.php?.*|newreply\.php?|editpost\.php)/i,
    
    baseURL: null,
    getURL: function(url) {
      return (fancySAHelper.baseURL + url);
    },
    
    saveOption: function(key, val) {
      self.emit("saveOption", {
        key: key,
        value: val
      });
    },
    
    // Attach the base fancy.css page. This was done in the manifest.json file 
	  // in the chrome extension, so do it as soon as there's a head object
    /*AttachFancyCSS: function() {
      self.port.emit("log", "AttachFancyCSS called");
      if (document.head !== undefined) {
        css = document.createElement("link");
        css.setAttribute("rel", "stylesheet");
        css.setAttribute("href", fancy.browser.getURL("/css/fancy.css"));
        document.head.insertBefore(css, document.head.firstChild);
        self.port.emit("log", "fancy.css attached!");
        
        fancySAForums.AttachForumCSS();
      } else {
        window.setTimeout(function() {fancySAHelper.AttachFancyCSS()}, 10);
      }
    },*/
    
    init: function () {
      // Initialize the self.port listeners
      self.port.on("getOptions", function(options) {
        fancySAForums.options = options;
      });
      /*self.port.on("getHideHeader", function(hideHeader) {
        fancySAForums.options.hideHeader = hideHeader;
      });
      
      self.port.on("getForumLayout", function(forumLayout) {
        fancySAForums.options.forumLayout = forumLayout;
      });*/
      
      self.port.on("getURL", function(url) {
        self.port.emit("log", "URL received");
        fancySAForums.baseURL = url.substr(0, url.length-1);
        
        // Now that we have the URL, attempt to attach the CSS
        //fancySAForumsInit.AttachFancyCSS();
        
        // And when the "ready" event finally hits, start modifying the script
        jQuery("document").ready(function () {
          fancySAForums.fancify();
          if (fancySAHelper.breakTablesRegEx.test(document.location)) {
            fancySAHelper.UnbreakTables();
          }
        });
      });
      
      // This script doesn't need to run on ads, and hangs on the search page (something to do with the $().wrapAll() function)
      // So skip those pages:
      if (!(this.adframeRegEx.test(document.location)) && !(this.searchRegEx.test(document.location))) {
        // Request the extension's base URL
        self.port.emit("getURL", null);
        self.port.emit("getOptions", null);
        /*// And request the hideHeader value
        self.port.emit("getHideHeader", null);
        // And request the forumLayout value
        self.port.emit("getForumLayout", null);*/
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
      $("head").append('<link rel="stylesheet" href="' + fancy.browser.getURL("/css/firefoxWidth.css") + '">');
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
}