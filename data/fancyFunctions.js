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
 
// Go ahead and remove the jQuery $ function from the namespace
$.noConflict();

// And wrap all my code within the "fancySAPage" namespace
if (typeof fancySAPage == "undefined") {
	var fancySAPage = {
		adframeRegEx: /^http:\/\/forums\.somethingawful\.com\/(adframe\.php|eyewonder)/i,
		searchRegEx: /^http:\/\/forums\.somethingawful\.com\/f\/search/i,
		breakTablesRegEx: /^http:\/\/forums\.somethingawful\.com\/(showthread\.php?.*|newreply\.php?|editpost\.php)/i,
		
		URLset: false,
		pageReady: false,
		hideHeader: false,
		
		getURL: function (url) {
			return (this.baseURL + url);
		},
		
		Init: function () {
			// Initialize the self.port listeners
			self.port.on("getURL", function(url) {
				self.port.emit("log", "URL received");
				fancySAPage.baseURL = url.substr(0, url.length-1);
				fancySAPage.URLset = true;
				
				// Now that we have the URL, attempt to attach the CSS
				fancySAPage.AttachFancyCSS();
				
				// And when the "ready" event finally hits, start modifying the script
				jQuery("document").ready(function ($) {
					fancySAPage.Fancy($)
				});
			});
			
			self.port.on("getHideHeader", function(hideHeader) {
				fancySAPage.hideHeader = hideHeader;
			});
			
			// This script doesn't need to run on ads, and hangs on the search page (something to do with the $().wrapAll() function)
			// So skip those pages:
			if (!(this.adframeRegEx.test(document.location)) && !(this.searchRegEx.test(document.location))) {
				// Request the extension's base URL
				self.port.emit("getURL", null);
				// And request the hideHeader value
				self.port.emit("getHideHeader", null);
			}
		},
		
		AttachFancyCSS: function() {
			self.port.emit("log", "AttachFancyCSS called");
			// Attach the base fancy.css page. This was done in the manifest.json
			// file in the chrome extension, so do it as soon as there's a head object
			if (document.head !== undefined) {
				css = document.createElement("link");
				css.setAttribute("rel", "stylesheet");
				css.setAttribute("href", fancySAPage.getURL("/css/fancy.css"));
				document.head.insertBefore(css, document.head.firstChild);
				self.port.emit("log", "fancy.css attached!");
				
				fancySAPage.AttachForumCSS();
			} else {
				window.setTimeout(function() {fancySAPage.AttachFancyCSS()}, 10);
			}
		},
		
		AttachForumCSS: function() {
			css = jQuery("link[rel=stylesheet][href^='/css/']");
			self.port.emit("log", "css.size: " + css.size());
			if (css.size() == 2) {
				// We should be in a normal forum. All forums have at least
				// main.css and bbcode.css
				jQuery("head").append("<link rel='stylesheet' type='text/css' href='"+fancySAPage.getURL("/css/default.css")+"' />");
			} else if (css.size() > 2) {
				// We might be in a non-normal styled forum. Check a little more carefully
				css219 = css.filter("[href^='/css/219.css']");
				if (css219.size() > 0) {
					self.port.emit("log", "219.css found");
					// Replace broken 219.css with updated version
					//css219.attr("href", fancySAPage.getURL("/css/219.css"));
					// Do this by linking the new one and eventually unlinking the old. This 
					// prevents any extra "flashes" the firefox tends to do...
					css219.after("<link rel='stylesheet' type='text/css' href='" + fancySAPage.getURL("/css/219-amber.css") + "' />");
					window.setTimeout(function() {css219.remove();}, 10);
				} else {
					cssFYAD = css.filter("[href^='/css/fyad.css']");
					if (cssFYAD.size() > 0) {
						cssFYAD.after("<link rel='stylesheet' type='text/css' href='"+fancySAPage.getURL("/css/fyad.css")+"' />");
					} else if (css.filter("[href^='/css/gaschamber.css'],[href^='/css/byob.css'],[href^='/css/rfa.css']").size() == 0) {
						// Only if none of the above matches should we load the default css
						self.port.emit("log", "css.size > 2, but still attaching default.css");
						jQuery("head").append("<link rel='stylesheet' type='text/css' href='"+fancySAPage.getURL("/css/default.css")+"' />");
					}
				}
			} else {
				// We probably haven't loaded everything, so wait 10ms and try again
				self.port.emit("log", "Trying again");
				window.setTimeout(function() {fancySAPage.AttachForumCSS()}, 10);
			}
		},
		
		// This function is modified from the original fancy.css included
		// with the chrome extension.
		Fancy: function ($) {
			// Begin "fancy.js" code
			// The relevant css is attached before the document calls the ready function
			/*css = jQuery("link[rel=stylesheet][href^='/css/219.css']");
			if (css.size() > 0) {
				// Replace broken 219.css with updated version
				//css.attr("href", fancySAPage.getURL("/css/219.css"));
				// Do this by linking the new one and eventually unlinking the old. This 
				// prevents any extra "flashes" the firefox tends to do...
				css.after("<link rel='stylesheet' type='text/css' href='" + fancySAPage.getURL("/css/219-amber.css") + "' />");
				window.setTimeout(function() {css.remove();}, 10);
			}

			if (css.size() == 0) {
			css = $("link[rel=stylesheet][href^='/css/fyad.css']");
			if (css.size() > 0) {
				$(css).append("<link rel='stylesheet' type='text/css' href='"+fancySAPage.getURL("/css/fyad.css")+"' />");
			}
			}

			// Prevent the default forums stylesheet from loading
			if (css.size() == 0)
				css = $("link[rel=stylesheet][href^='/css/gaschamber.css']");
			if (css.size() == 0)
				css = $("link[rel=stylesheet][href^='/css/byob.css']");
			if (css.size() == 0) {
				css = $("link[rel=stylesheet][href^='/css/rfa.css']");
				//RFA Fix
				if (css.size() > 0) {
					$("ul#navigation").css("background-image", "none");
					$("#content").before("<div style='width:100%;text-align:center;'><img src='http://fi.somethingawful.com/rfa/rfa-header.jpg'></div>");
				}
			}
			if (css.size() == 0) {
				$("head").append("<link rel='stylesheet' type='text/css' href='"+fancySAPage.getURL("/css/default.css")+"' />");
			}*/
			// Still need to do this RFA fix, I guess
			//RFA Fix
			if ($("link[rel=stylesheet][href^='/css/rfa.css']").size() > 0) {
				$("ul#navigation").css("background-image", "none");
				$("#content").before("<div style='width:100%;text-align:center;'><img src='http://fi.somethingawful.com/rfa/rfa-header.jpg'></div>");
			}

			// Wraps the search in a container for proper styling
			if (window.location.pathname.indexOf("search") != -1) {
				// This code hangs on the search page, not sure why. Is something not fully loaded?
				// I've manually set the search page to be bypassed by the entire script for safety
				$("#globalmenu, #nav_purchase, #navigation, .breadcrumbs, #content, #copyright").wrapAll("<div id='container'></div>");
			}

			// Add frontpage style banner
			$("#container").prepend("<div id='header' class='hidden'><img id='logo_img_bluegren' src='"+fancySAPage.getURL("/images/head-logo-bluegren.png")+"' /></div>")
			
			//if (localStorage.getItem("hideHeader") != "true") {
			if (!fancySAPage.hideHeader) {
			  $("#header").toggleClass("hidden"); //classes are used rather than just display: toggles so that they can be overriden by subforum-specific stylesheets
			}
			
			// Moves the archives box
			if ($(".forumbar").size() == 0)
				$("table#subforums").after("<div class='forumbar'></div>");
			$(".forumbar").append($("#ac_timemachine"));

			// Properly styles the bottom breadcrumbs tag
			$(".mainbodytextlarge:last, .online_users:last").wrapAll($("<div class ='breadcrumbs' />"));

			// Add banner
			$("#globalmenu").append("<ul class='right'>");
			$("#globalmenu ul.right").append("<li class='first'><a class='toggle' href='#'>toggle header</a></li>");
			$("#globalmenu").insertBefore($("#container :first"));

			// Fix forum navbar
			$("ul.navigation").wrap("<div class='navbar_wrap'>");
			$("div.navbar_wrap").filter(":first").addClass("top");
			$("div.navbar_wrap").filter(":last").addClass("bottom");
			$("ul.navigation li").each(function(i, el) {
				link = $(this).find("a");
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
			
			// Move the post author content
			$("table#forum.threadlist tbody tr").each(function(i, el) {
				
				author = $(this).find("td.author");
				$(author).find("a").attr("class", "author");
				
				replies = $(this).find("td.replies");
				
				if ($(this).find(".title_pages")[0] == null) {
					$(this).find("td.title").append("<div class='title_pages'>");
				}
				else {
					//$(this).find(".title_pages").prepend("<br />");
					$(this).find(".title_pages").prepend(" - ");
				}
				$(this).find(".title_pages").prepend("by " + author.html());
				$(this).find(".author:first").after(" - <span class='replies'>" + replies.html() + " replies</span>");

				// Merge columns into posticon field
				posticon = $(this).find("td.icon img");

				// bookmark star
				star = $(this).find("td.star img");
				//if (star.parent().css("display") != "none") {
					star_src = $(star).attr('src');
					if (star_src == "http://fi.somethingawful.com/style/bookmarks/star-off.gif")
						$(star).attr('src', fancySAPage.getURL("/images/star-off.gif"));
					else if (star_src == "http://fi.somethingawful.com/style/bookmarks/star0.gif")
						$(star).attr('src', fancySAPage.getURL("/images/star0.gif"));
					else if (star_src == "http://fi.somethingawful.com/style/bookmarks/star1.gif")
						$(star).attr('src', fancySAPage.getURL("/images/star1.gif"));
					else if (star_src == "http://fi.somethingawful.com/style/bookmarks/star2.gif")
						$(star).attr('src', fancySAPage.getURL("/images/star2.gif"));

					star.css("margin-top", "5px");
					star.css("margin-left", "45px");
					posticon.after(star);
					posticon.after("<br />");
					//posticon.before(star);
					$(this).find("td.star").remove();
					//$(this).find("td.icon").css("width", "78px");
				//}

				// Ask/tell and SA-Mart icons
				icon2 = $(this).find("td.icon2 img");
				if (icon2.size() > 0) {
					
					icon2_src = $(icon2).attr('src');
					if (icon2_src == 'http://fi.somethingawful.com/ama.gif')
						$(icon2).attr('src', fancySAPage.getURL("/images/asktell-ask.gif"));
					else if (icon2_src == 'http://fi.somethingawful.com/tma.gif')
						$(icon2).attr('src', fancySAPage.getURL("/images/asktell-tell.gif"));
					else if (icon2_src == 'http://fi.somethingawful.com/forums/posticons/icon-37-selling.gif')
						$(icon2).attr('src', fancySAPage.getURL("/images/samart-sell.gif"));
					else if (icon2_src == 'http://fi.somethingawful.com/forums/posticons/icon-38-buying.gif')
						$(icon2).attr('src', fancySAPage.getURL("/images/samart-buy.gif"));
					else if (icon2_src == 'http://fi.somethingawful.com/forums/posticons/icon-46-trading.gif')
						$(icon2).attr('src', fancySAPage.getURL("/images/samart-swap.gif"));
					else if (icon2_src == 'http://fi.somethingawful.com/forums/posticons/icon-52-trading.gif')
						$(icon2).attr('src', fancySAPage.getURL("/images/samart-bid.gif"));

					posticon.after(icon2);
					$(this).find("td.icon2").remove();
					$(this).find("td.icon").css("width", "100px");
					$(icon2).css("margin-left", "1px");
				}
			});

			// Remove headers from merged columns
			$("table#forum.threadlist thead tr th.star").remove();
			$("table#forum.threadlist thead tr th.icon2").remove();
			$("table#forum.threadlist thead tr th.icon").css("width", "1px");

			replies = $("th.replies a");
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
				//$(".forumbar_pages").append($("#mp_bar .pages"));
				$(".forumbar_pages").append($(".pages"));

				// bottom
				$(".forumbar:last").append("<div class = 'forumbar_pages' />");
				$(".forumbar_pages:last").append($('.pages.bottom'));

				// post button
				$(".forumbar.top").append($(".postbuttons"))
			}


			// --- showthread.php ---
			if (window.location.pathname == "/showthread.php") {
				// top
				$(".threadbar.top").append("<div class = 'threadbar_pages' />");
				$(".threadbar_pages").append($(".pages.top"));

				// bottom
				$(".threadbar.bottom .clear").before("<div class = 'threadbar_pages' />");
				$(".threadbar_pages:last").append($(".pages.bottom"));

				// Hide the new thread button from instead a thread
				$("ul.postbuttons li a[href^='newthread.php']").parent().css("display","none");
			}
			
			// --- bookmarkthreads.php and usercp.php ---

			if (window.location.pathname == "/usercp.php" || window.location.pathname == "/bookmarkthreads.php") {
				// top
				$("#forum").before("<div class = 'forumbar top' />");
				$(".forumbar.top").append("<div class = 'forumbar_pages' />");
				$(".forumbar_pages").append($("#mp_bar .pages"));

				// bottom
				$(".forumbar:last").append("<div class = 'forumbar_pages' />");
				$(".forumbar_pages:last").append($('.pages.bottom'));

				// post button
				$(".forumbar.top").append($(".postbuttons"))

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



			// header toggle

			$("#globalmenu a.toggle").click(function(e) {
				e.preventDefault();
				$("#header").toggleClass("hidden");
				
				/*if (localStorage.getItem("hideHeader") == "false")
					localStorage.setItem("hideHeader", "true");
				else
					localStorage.setItem("hideHeader", "false");
				}*/
				fancySAPage.hideHeader = !fancySAPage.hideHeader;
				self.port.emit("toggleHideHeader", null);
			});
			
			// End "fancy.js" code
			
			// After all this, unbreak the tables if necessary
			if (this.breakTablesRegEx.test(document.location)) {
				this.UnbreakTables($);
			}
		}, 
		
		// For pages that might contain table-breaking images, this function will
		// resize them downwards.
		
		// Modified from the original chrome script to take advantage of the
		// -moz-available feature, which will allow Firefox to resize the images
		// to fit within their parent containers.
		UnbreakTables: function ($) {
			/* stop breaking the fucking tables with your stupid images yall */

			// thanks to Paolo Bergantino, Nick Craver & Andrew Ramdsen
			// http://stackoverflow.com/questions/965816/what-jquery-selector-excludes-items-with-a-parent-that-matches-a-given-selector/965962#965962
			// http://stackoverflow.com/questions/3877027/jquery-callback-on-image-load-even-when-the-image-is-cached
			// http://irama.org/news/2011/06/05/cached-images-have-no-width-or-height-in-webkit-e-g-chrome-or-safari/

			// Attach the css that will prevent the parent elements from expanding
			// to fit the table-breaking images
			$("head").append('<link rel="stylesheet" href="' + fancySAPage.getURL("/css/firefoxWidth.css") + '">');
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
	};
	
	// Now get started
	fancySAPage.Init();
}