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

// This is an active module of the Fancy SA Forums for Firefox addon

// Keep everything wrapped up in the fancySAMain namespace, for good practice
if (typeof fancySAMain == "undefined") {
	var fancySAMain = {
		// Set this to true to see the occasional log message
		debug: false,
		
		init: function() {
			this.pageMod = require("page-mod");
			this.self = require("self");
			this.data = this.self.data;
			this.tStart = new Date().getTime();
			
			this.pageMod.PageMod({
				include: "http://forums.somethingawful.com/*",
				contentScriptFile: [this.data.url("lib/jquery-1.6.4.min.js"), this.data.url("fancyFunctions.js")],
				contentScript: 'fancySAPage.Init("' + this.data.url("") + '");',
				contentScriptWhen: "start",
				onAttach: function onAttach(worker) {
					if (fancySAMain.debug) {
						worker.port.on("log", function(message) {
							console.log("Script on start (" + (new Date().getTime() - fancySAMain.tStart) + "): " + message);
						});
					}
				}
			});
		}
	};
	
	fancySAMain.init();
}