var ready = false;
var state = "unstarted";

//------------- Youtube API mandatory code --------
var tag = document.createElement("script");
tag.id = "iframe-demo";
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}
// end

// autoplay fn
function onPlayerReady(event) {
    event.target.playVideo();
    console.log("ready");
}

// Player State control, gets triggered by API on every state change
function onPlayerStateChange(event) {
  var playerStatus = event.data;
  if (playerStatus == -1) {
    state = "unstarted";        // unstarted
  } else if (playerStatus == 0) {
    state = "ended";            // ended
  } else if (playerStatus == 1) {
    state = "playing";          // playing
  } else if (playerStatus == 2) {
    state = "paused";           // paused
  } else if (playerStatus == 3) {
    state = "buffering";        // buffering
  } else if (playerStatus == 5) {
    state = "video cued";       // video cued
  }

  // checks if popup window is open, if soo, push state changes
  var views = chrome.extension.getViews({ type: "popup" });
  if (views.length != 0){
      tell_state(state);
  }
}

// send state change to frontend Popup.html
async function tell_state(state) {
  chrome.runtime.sendMessage(state, (response) => {
    console.log("received user data -", response);
  });
}

// Message Listener for chrome Events API
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // state req
  if (msg == "get-state") {
    sendResponse(state);
  }

  // pause/ play song req
  if (msg == "pause") {
    if (state == "playing") {
      player.pauseVideo();
      sendResponse(state);
    } else if (state == "paused") {
      player.playVideo();
      sendResponse(state);
    }
  }
});
let counter = 0;
function sleep(ms) {
    counter++;
    return new Promise(resolve => setTimeout(resolve, ms));
}

// this fn is broken, chrome is not querrying "ID"
async function hold_on_tab(T_ID){
    while (true){
        chrome.tabs.query(
            {currentWindow: true, id: T_ID},
            function(tabArray){
                console.log("tab hold fn: ");
                console.log(tabArray);
            }
        );
        await sleep(2000);
        if (counter == 15){
            console.log("tab hold fn end");
            break;
        }
    }
}

// this is working fine, it trigger when a tab STARTS producing sound, 
// not if it was already doing, and wont judge even if it was
async function sound_fetch(){
    while (true){
        chrome.tabs.query(
            {currentWindow: true, audible : true},
            async function(tabArray){
                console.log("sound check - ");
                console.log(tabArray.id);
                await hold_on_tab();
            }
        );
        await sleep(3000);
        if (counter == 15){
            console.log("END sound check fn");
            break;
        }
    }
}
sound_fetch();