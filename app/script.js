document.querySelector(".control").addEventListener("click", pause);
document.querySelector(".reload").addEventListener("click", ask_state);

async function pause(){
    chrome.runtime.sendMessage("pause", (response) => {
      console.log("received user data", response);
      console.log(response);
    });
}

async function ask_state(){
    chrome.runtime.sendMessage("get-state", (response) => {
        console.log("received user data", response);
        set_state(response);
    });
}

function set_state(val) {
    document.querySelector("#state").innerHTML = val;
    if (val == "paused"){
        document.querySelector(".control").classList.add("paused");
        document.querySelector(".control").classList.remove("playing");
    }else if (val == "playing"){
        document.querySelector(".control").classList.add("playing");
        document.querySelector(".control").classList.remove("paused");
    }
}

chrome.runtime.onMessage.addListener((msg,sender,sendResponse) => {
    if(msg == "paused"){
        set_state("paused");
        sendResponse("recieved");
    }else if(msg == "playing"){
        set_state("paused");
        sendResponse("recieved");
    }else if(msg == "unstarted"){
        set_state("unstarted");
        sendResponse("recieved");
    }
});
