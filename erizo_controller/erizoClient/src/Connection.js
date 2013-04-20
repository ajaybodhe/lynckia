/*global window, console, navigator*/

var Erizo = Erizo || {};

Erizo.sessionId = 103;

Erizo.Connection = function (spec) {
    "use strict";
    var that = {};         

    spec.session_id = (Erizo.sessionId += 1);

    // Check which WebRTC Stack is installed.
    that.browser = "";
    L.Logger.debug("browser userAgent ===== >" + window.navigator.userAgent);
    if (typeof module !== 'undefined' && module.exports) {
        L.Logger.error('Publish/subscribe video/audio streams not supported in erizofc yet');
        that = Erizo.FcStack(spec);
    } else if ( (window.navigator.userAgent.match(/Chrome\/([\d.]*?)\./) != null) && 
                 (window.navigator.userAgent.match(/Chrome\/([\d.]*?)\./)[1] === "25" || 
                  window.navigator.userAgent.match(/Chrome\/([\d.]*?)\./)[1] === "26")) {
        // Google Chrome Stable.
        console.log("Stable!");
        that = Erizo.ChromeStableStack(spec);
        that.browser = "chrome-stable";
    } else if ((window.navigator.userAgent.match(/Chrome\/([\d.]*?)\./) != null) &&
               (window.navigator.userAgent.match(/Chrome\/([\d.]*?)\./)[1] === "27" ||
               window.navigator.userAgent.match(/Chrome\/([\d.]*?)\./)[1] === "28")) {
        // Google Chrome Canary.
        console.log("Canary!");
        that = Erizo.ChromeCanaryStack(spec);
        that.browser = "chrome-canary";
    } else if ((window.navigator.userAgent.match(/Bowser\/([\d.]*?)\./) != null) && 
               (window.navigator.userAgent.match(/Bowser\/([\d.]*?)\./)[1] === "25")) {
        // Bowser
        that.browser = "bowser";
    } else if ((window.navigator.userAgent.match(/Firefox\/([\d.]*?)\./) != null) &&
               (window.navigator.userAgent.match(/Firefox\/([\d.]*?)\./)[1] === "21")) {
        // Firefox
        console.log("in Firefox block");
        that = Erizo.FirefoxStableStack(spec);
        that.browser = "mozilla";
    } else {
        // None.
        that.browser = "none";
        throw "WebRTC stack not available";
    }

    return that;
};

Erizo.GetUserMedia = function (config, callback, error) {
    "use strict";
    //var n = navigator;
    //n.getUserMedia = n.webkitGetUserMedia || n.mozGetUserMedia;
    if (typeof module !== 'undefined' && module.exports) {
        L.Logger.error('Video/audio streams not supported in erizofc yet');
    } else {
        try {
            navigator.webkitGetUserMedia("audio, video", callback, error);
            console.log('GetUserMedia BOWSER');
        } catch (e) {
            try{
                 navigator.webkitGetUserMedia(config, callback, error);
                 console.log('GetUserMedia CHROME', config);
            }catch(e){
                 navigator.mozGetUserMedia(config, callback, error);
                 console.log('GetUserMedia Firefox', config);
            }

           
        }
    }
    

};
