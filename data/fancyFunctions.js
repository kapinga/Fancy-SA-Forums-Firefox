/* Copyright (c) 2011, Jonathon Harding, Thomas Boyt
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

// Wrap all my code within the "fancySAForums" namespace
var fancySAForums = {
  browser: {
    // the idea here is to keep fancy sa code same across
    // all browsers except for browser-specific functions
    // (like getURL)
    getURL: function (url) {
      return fancySAHelper.getURL(url);
    }
  },

  options: {
    hideHeader: false,
    forumLayout: "expanded",
    yospos: "amber"
  },

  setOption: function(key, val) {
    fancySAForums.options[key] = val;
    fancySAHelper.saveOption(key, val);
  },

  toggleBoolOpt: function(key) {
    if (fancySAForums.options[key] === true)
      fancySAForums.setOption(key, false);
    else if (fancySAForums.options[key] === false)
      fancySAForums.setOption(key, true);
  },
  
  
  //hideHeader: false,
  //forumLayout: "expanded",
  
  /*AttachForumCSS: function() {
    css = jQuery("link[rel=stylesheet][href^='/css/']");
    self.port.emit("log", "css.size: " + css.size());
    if (css.size() == 2) {
      // We should be in a normal forum. All forums have at least
      // main.css and bbcode.css
      jQuery("head").append("<link rel='stylesheet' type='text/css' href='"+fancy.browser.getURL("/css/default.css")+"' />");
    } else if (css.size() > 2) {
      // We might be in a non-normal styled forum. Check a little more carefully
      css219 = css.filter("[href^='/css/219.css']");
      if (css219.size() > 0) {
        self.port.emit("log", "219.css found");
        // Replace broken 219.css with updated version
        //css219.attr("href", fancy.browser.getURL("/css/219.css"));
        // Do this by linking the new one and eventually unlinking the old. This 
        // prevents any extra "flashes" the firefox tends to do...
        css219.after("<link rel='stylesheet' type='text/css' href='" + fancy.browser.getURL("/css/219-amber.css") + "' />");
        window.setTimeout(function() {css219.remove();}, 10);
      } else {
        cssFYAD = css.filter("[href^='/css/fyad.css']");
        if (cssFYAD.size() > 0) {
          cssFYAD.after("<link rel='stylesheet' type='text/css' href='"+fancy.browser.getURL("/css/fyad.css")+"' />");
        } else if (css.filter("[href^='/css/gaschamber.css'],[href^='/css/byob.css'],[href^='/css/rfa.css']").size() == 0) {
          // Only if none of the above matches should we load the default css
          self.port.emit("log", "css.size > 2, but still attaching default.css");
          jQuery("head").append("<link rel='stylesheet' type='text/css' href='"+fancy.browser.getURL("/css/default.css")+"' />");
        }
      }
    } else {
      // We probably haven't loaded everything, so wait 10ms and try again
      self.port.emit("log", "Trying again");
      window.setTimeout(function() {fancySAForums.AttachForumCSS()}, 10);
    }
  },*/
  
  fancify: function() {
    var fancy = fancySAForums; // :effort: alias.
    self.port.emit("log", "fancify started");
    /*
    *
    * Attach CSS
    *
    */

    // pattern - if no css tag has been found yet; select for css <link>; if element exists; replace with new css

    // YOSPOS
    css = $("link[rel=stylesheet][href^='/css/219.css']");
    if (css.size() > 0) {
      $(css).attr("href", fancy.browser.getURL("/css/219-amber.css"));
      /*// Do this by linking the new one and eventually unlinking the old. This 
      // prevents any extra "flashes" the firefox tends to do...
      css.after("<link rel='stylesheet' type='text/css' href='" + fancy.browser.getURL("/css/219-amber.css") + "' />");
      window.setTimeout(function() {css.remove();}, 10);*/
    }

    // FYAD
    if (css.size() === 0) {
      css = $("link[rel=stylesheet][href^='/css/fyad.css']");
      if (css.size() > 0) {
        $(css).append("<link rel='stylesheet' type='text/css' href='" + fancy.browser.getURL("/css/fyad.css") + "' />");
      }
    }

    // Prevent the default forums stylesheet from loading
    if (css.size() === 0)
     css = $("link[rel=stylesheet][href^='/css/gaschamber.css']");
    if (css.size() === 0)
     css = $("link[rel=stylesheet][href^='/css/byob.css']");
    if (css.size() === 0) {
      css = $("link[rel=stylesheet][href^='/css/rfa.css']");
      //RFA Fix
      if (css.size() > 0) {
        $("ul#navigation").css("background-image", "none");
        $("#content").before("<div style='width:100%;text-align:center;'><img src='http://fi.somethingawful.com/rfa/rfa-header.jpg'></div>");
       }
    }

    self.port.emit("log", "css.size: " + css.size());
    if (css.size() === 0) {
      self.port.emit("log", fancy.browser.getURL("/css/default.css"));
      $("head").append("<link rel='stylesheet' type='text/css' href='" + fancy.browser.getURL("/css/default.css") + "' />");
    }
    /*// Still need to do this RFA fix, I guess
    //RFA Fix
    if ($("link[rel=stylesheet][href^='/css/rfa.css']").size() > 0) {
      $("ul#navigation").css("background-image", "none");
      $("#content").before("<div style='width:100%;text-align:center;'><img src='http://fi.somethingawful.com/rfa/rfa-header.jpg'></div>");
    }*/
    self.port.emit("log", "CSS attached");

    // Wraps the search in a container for proper styling
    if (window.location.pathname.indexOf("search") != -1) {
      $("#globalmenu, #nav_purchase, #navigation, .breadcrumbs, #content, #copyright").wrapAll("<div id='container'></div>");
    }
    
    self.port.emit("log", "Search wrapped");

    // Add frontpage style banner
    $("#container").prepend("<div id='header' class='hidden'><img id='logo_img_bluegren' src='" + fancy.browser.getURL("/images/head-logo-bluegren.png")+"' /></div>")
    if (!fancySAForums.options.hideHeader) {
      $("#header").toggleClass("hidden"); //classes are used rather than just display: toggles so that they can be overriden by subforum-specific stylesheets
    }
    
    self.port.emit("log", "banner added");

    /*
    *
    * Options
    *
    */

    // Add options to globalmenu
    $("#globalmenu").append("<ul id='fancy-options' class='right'>");
    $("#globalmenu ul.right").append("<li class='first'><a class='toggle-header' href='#'>toggle header</a></li>");

    self.port.emit("log", "option toggles added");
    
    if ((window.location.pathname == "/forumdisplay.php") || (window.location.pathname == "/usercp.php" || window.location.pathname == "/bookmarkthreads.php")) {
      var text;
      if (fancySAForums.options.forumLayout == "compact") {
        text = 'switch to expanded view';
      } else if (fancySAForums.options.forumLayout == "expanded") {
        text = 'switch to compact view';
      }
      $("#globalmenu ul.right li.first").toggleClass("first");
      $("#globalmenu ul.right").prepend("<li class='first'><a class='toggle-forum-layout' href='#'>" + text + "</a></li>");
    }

    $("#globalmenu").insertBefore($("#container :first"));

    // event handlers
    $("#globalmenu a.toggle-header").click(function(e) {
      e.preventDefault();
      $("#header").toggleClass("hidden");
      fancySAForums.toggleBoolOpt("hideHeader");
    }
    );

    $("#globalmenu a.toggle-forum-layout").click(function(e) {
      e.preventDefault();
      $("table#forum.threadlist").toggleClass("expanded compact");
      if (fancy.options.forumLayout == "compact") {
        $("#globalmenu a.toggle-forum-layout").text('switch to compact view');
        fancy.setOption("forumLayout", "expanded");
      } else if (fancy.options.forumLayout == "expanded") {
        $("#globalmenu a.toggle-forum-layout").text('switch to expanded view');
        fancy.setOption("forumLayout", "compact");
      }
    });
    
    self.port.emit("log", "Option event handlers added");

    /*
    *
    * forumdisplay.php
    *
    */

    // Moves the archives box
    if ($(".forumbar").size() === 0)
      $("table#subforums").after("<div class='forumbar'></div>");
    $(".forumbar").append($("#ac_timemachine"));

    // Properly styles the bottom breadcrumbs tag
    $(".mainbodytextlarge:last, .online_users:last").wrapAll($("<div class ='breadcrumbs' />"));

    // Fix forum navbar
    $("ul.navigation").wrap("<div class='navbar_wrap'>");
    $("div.navbar_wrap").filter(":first").addClass("top");
    $("div.navbar_wrap").filter(":last").addClass("bottom");
    $("ul.navigation li").each(function(i, el) {
      var link = $(el).find("a");
      if ($(link).attr('href').substr(1, 25) == 'account.php?action=logout')
      $(this).attr("class", "logout");
      else if ($(link).attr('href').substr(1, 24) == 'account.php?action=login') {
        $(this).attr("class", "login");
        $(link).html('Log In');
      }
      $(this).empty().append(link);
    });

    // Move the copyright outside #container
    $("#container").after($("#copyright"));

    if (fancySAForums.options.forumLayout == "compact") {
      $("table#forum.threadlist").addClass("compact");
    }
    else if (fancySAForums.options.forumLayout == "expanded") {
      $("table#forum.threadlist").addClass("expanded");
    }

    // Reformat the tables
    $("table#forum.threadlist tbody tr").each(function(i, el) {

      var author = $(this).find("td.author");
      $(author).find("a").attr("class", "author");

      var replies = $(this).find("td.replies");

      if ($(this).find(".title_pages")[0] === undefined) {
        $(this).find("td.title").append("<div class='title_pages'>");
      }
      else {
        $(this).find("td.title").append($(this).find(".title_pages"));
        $(this).find(".title_pages").addClass("thread_pages");
        $(this).find(".thread_pages").removeClass("title_pages");
        $(this).find(".thread_pages").wrap("<div class='title_pages' />");
      }

      $(this).find(".title_pages").prepend("<div class='author'>" + author.html() +"</div>");
      $(this).find(".author:first").after("<div class='replies'>" + replies.html() + " replies</div>");

      // Merge columns into posticon field
      var posticon = $(this).find("td.icon img");
      posticon.addClass("posticon");

      // bookmark star
      var star = $(this).find("td.star img");
      star.addClass("star");
      
      var star_src = $(star).attr('src');
      if (star_src == "http://fi.somethingawful.com/style/bookmarks/star-off.gif")
        $(star).attr('src', fancy.browser.getURL("/images/star-off.gif"));
      else if (star_src == "http://fi.somethingawful.com/style/bookmarks/star0.gif")
        $(star).attr('src', fancy.browser.getURL("/images/star0.gif"));
      else if (star_src == "http://fi.somethingawful.com/style/bookmarks/star1.gif")
        $(star).attr('src', fancy.browser.getURL("/images/star1.gif"));
      else if (star_src == "http://fi.somethingawful.com/style/bookmarks/star2.gif")
        $(star).attr('src', fancy.browser.getURL("/images/star2.gif"));

      posticon.after(star);
      $(this).find("td.star").remove();

      // Ask/tell and SA-Mart icons
      icon2 = $(this).find("td.icon2 img");
      if (icon2.size() > 0) {

        icon2_src = $(icon2).attr('src');
        if (icon2_src == 'http://fi.somethingawful.com/ama.gif')
        $(icon2).attr('src', fancy.browser.getURL("/images/asktell-ask.gif"));
        else if (icon2_src == 'http://fi.somethingawful.com/tma.gif')
        $(icon2).attr('src', fancy.browser.getURL("/images/asktell-tell.gif"));
        else if (icon2_src == 'http://fi.somethingawful.com/forums/posticons/icon-37-selling.gif')
        $(icon2).attr('src', fancy.browser.getURL("/images/samart-sell.gif"));
        else if (icon2_src == 'http://fi.somethingawful.com/forums/posticons/icon-38-buying.gif')
        $(icon2).attr('src', fancy.browser.getURL("/images/samart-buy.gif"));
        else if (icon2_src == 'http://fi.somethingawful.com/forums/posticons/icon-46-trading.gif')
        $(icon2).attr('src', fancy.browser.getURL("/images/samart-swap.gif"));
        else if (icon2_src == 'http://fi.somethingawful.com/forums/posticons/icon-52-trading.gif')
        $(icon2).attr('src', fancy.browser.getURL("/images/samart-bid.gif"));

        posticon.after(icon2);
        $(this).find("td.icon2").remove();
        $(this).find("td.icon").addClass("wide");
        $(icon2).css("margin-left", "1px");
      }
    });

    // Remove headers from merged columns
    $("table#forum.threadlist thead tr th.star").remove();
    $("table#forum.threadlist thead tr th.icon2").remove();
    // The expanded icon column needs a specified header width, although the value is irrelevant
    //$("table#forum.threadlist thead tr th.icon").css("width", "1px");

    var replies = $("th.replies a");
    $("th.title").append('<span class="replies" style="float:right;margin-right: 20px;"></span>');
    $("th.title span.replies").append(replies);
    $("th.title span.replies a:first").empty().html("Replies");

    /*

    New page nav

    */

    // --- forumdisplay.php ---
    if (window.location.pathname == "/forumdisplay.php") {
        // top
      $("#forum").before("<div class = 'forumbar top' />");
      $(".forumbar.top").append("<div class = 'forumbar_pages' />");
      $(".forumbar_pages").append($(".pages"));
      $("table#forum").nextAll("br").remove();

      // bottom
      $(".forumbar:last").append("<div class = 'forumbar_pages' />");
      $(".forumbar_pages:last").append($('.pages.bottom'));

      // post button
      $(".forumbar.top").append($(".postbuttons"));
    }


    // --- showthread.php ---
    if (window.location.pathname == "/showthread.php") {
      // top
      $(".threadbar.top").append("<div class = 'threadbar_pages' />");
      $(".threadbar_pages").append($(".pages.top"));

      // bottom
      $(".threadbar.bottom .clear").before("<div class = 'threadbar_pages' />");
      $(".threadbar_pages:last").append($(".pages.bottom"));

      // Hide the new thread button from inside a thread
      $("ul.postbuttons li a[href^='newthread.php']").parent().css("display", "none");
    }

    // --- bookmarkthreads.php and usercp.php ---

    if (window.location.pathname == "/usercp.php" || window.location.pathname == "/bookmarkthreads.php") {
        // top
      $("#forum").before("<div class = 'forumbar top' />");
      $(".forumbar.top").append("<div class = 'forumbar_pages' />");
        $(".forumbar_pages").append($("#mp_bar .pages"));
        $("ul#usercpnav").nextAll("br").remove();

      // bottom
      $(".forumbar:last").append("<div class = 'forumbar_pages' />");
      $(".forumbar_pages:last").append($('.pages.bottom'));

      // post button
      $(".forumbar.top").append($(".postbuttons"));

      $("div.forumbar.top div.forumbar_pages").before($("span#bookmark_edit_attach"));
      $("div.pages:first").appendTo($("div.forumbar.top div.forumbar_pages"));
      if ($("div.pages").size() > 1)
        $("div.pages:last").appendTo($("div.forumbar div.forumbar_pages div.pages.bottom"));

      // hide the bookmark explanation text
      $("form[name=bookmarks] div:first").css("display", "none");
    }

    $("ul#usercpnav li a[href$='bookmarkthreads.php']").html("Bookmarks");
    $("ul#usercpnav li a[href$='action=editprofile']").html("Profile");
    $("ul#usercpnav li a[href$='action=editoptions']").html("Options");
    $("ul#usercpnav li a[href$='userlist=buddy']").html("Buddy List");
    $("ul#usercpnav li a[href$='userlist=ignore']").html("Ignore List");
  },
  
  init: function () {
    // Call init from FancySAHelper
    fancySAHelper.init();
  }
};
fancySAForums.init();