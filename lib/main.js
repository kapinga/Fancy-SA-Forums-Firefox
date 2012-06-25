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

// This is an active module of the Fancy SA Forums for Firefox addon

// Set this to true to see the occasional log message
debug = true;

var tStart = new Date().getTime(),
    pageMod = require("page-mod"),
    self = require("self"),
    ss = require("simple-storage"),
    { MatchPattern } = require("match-pattern");
    
var data = self.data;

defaults = {
  hideHeader: false,
  forumLayout: "expanded",
  yospos: "amber"
};

pageMod.PageMod({
  //include: new MatchPattern(/^http:\/\/forums?\.somethingawful\.com\/?[^(adframe\.php)(eyewonder)(f\/search)]/),
  include: "http://forums.somethingawful.com/*",
  contentScriptFile: [data.url("lib/jquery-1.7.2.min.js"), data.url("fancyHelper.js"), data.url("fancyFunctions.js")],
  contentScriptWhen: "start",
  contentStyleFile: data.url("css/fancy.css"),
  onAttach: function onAttach(worker) {
    if (debug) {
      worker.port.on("log", function(message) {
        console.log("Script on start (" + (new Date().getTime() - tStart) + "): " + message);
      });
    }
    // Add a port to reply to URL requests:
    worker.port.on("getURL", function() {
      worker.port.emit("getURL", data.url(""));
    });
    
    worker.port.on("getOptions", function() {
      options = defaults;
      if (ss.storage.hideHeader !== undefined) {
        options.hideHeader = ss.storage.hideHeader;
      }
      if (ss.storage.forumLayout !== undefined) {
        options.forumLayout = ss.storage.forumLayout;
      }
      if (ss.storage.yospos !== undefined) {
        options.yospos = ss.storage.yospos;
      }
      worker.port.emit("getOptions", options);
    });
    
    worker.port.on("saveOption", function(opt) {
      ss.storage[opt.key] = opt.value;
    });
  }
});