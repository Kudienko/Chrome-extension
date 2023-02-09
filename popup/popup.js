const grabBtn = document.getElementById("grabBtn");
grabBtn.addEventListener("click",() => {
    chrome.tabs.query({active: true}, (tabs)=>{
        const tab = tabs[0];
        if (tab){
            execScript(tab);
        } else {
            alert("There no active tabs")
        }
    })
})


function execScript(tab){
    chrome.scripting.executeScript(
        {
            "target": {tabId: tab.id, allFrames: true},
            func: grabImages
        },
        onResult
    )
}

function grabImages() {
    const images = document.querySelectorAll("img");
    return Array.from(images).map(image=>image.src);
}

function onResult(frames) {
    if (!frames || !frames.length){
        alert("Could not retrieve images from specified page");
        return;
    }
    const imageUrls = frames.map(frame => frame.result).reduce((r1,r2)=>r1.concat(r2))
    openImagePage(imageUrls)
}

function openImagePage(urls) {
    chrome.tabs.create({url:"page/page.html", active: false}, (tab) => {
        setTimeout(()=>{
            chrome.tabs.sendMessage(tab.id,urls, (resp)=>{
                chrome.tabs.update(tab.id, {active:true})
        })
        },500)
    })
}

