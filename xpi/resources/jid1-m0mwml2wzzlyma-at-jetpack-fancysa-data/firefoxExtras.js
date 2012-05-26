// If I could edit fancy.js or tablebreak.js, I would wrap them in a listener
// function, and wait for this script to provide the baseURL.

// Instead, we do these two things that can't be done in the scripts themselves

// Define this stupid hack to return the correct value from chrome.extension.getURL(url)
var chrome = {
	extension: {
		getURL: function (url) {
			return ("resource://jid1-m0mwml2wzzlyma-at-jetpack-fancysa-data" + url);
		}
	}
};

// And attach the fancy.css that is done via code in chrome
newCSS = document.createElement("link");
newCSS.setAttribute("type", "text/css");
newCSS.setAttribute("rel", "stylesheet");
newCSS.setAttribute("href", chrome.extension.getURL("/css/fancy.css"));
document.head.appendChild(newCSS);