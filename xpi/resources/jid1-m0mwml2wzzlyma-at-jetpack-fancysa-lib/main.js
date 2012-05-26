// This is an active module of the Fancy SA Forums for Firefox addon
var pageMod = require("page-mod"),
    self = require("self"),
    data = self.data,
    { MatchPattern } = require("match-pattern");
//	editSA_sss = Components.classes["@mozilla.org/content/style-sheet-service;1"].getService(Components.interfaces.nsIStyleSheetService),
//	editSA_ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService),
//	editSA_uri = editSA_ios.newURI(data.url("css/fancy.css"),null, null);

pageMod.PageMod({
    include: "*.forums.somethingawful.com",
    contentScriptFile: [data.url("lib/jquery.js"), data.url("lib/maxResize.js"),
    	data.url("firefoxExtras.js"), data.url("fancy.js"), data.url("tableBreak.js")],
    contentScriptWhen: "ready"});