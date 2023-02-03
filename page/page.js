

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    addImagesContainer(message);
    sendResponse("ok");
})


function addImagesContainer(urls) {
    if (!urls || !urls.length) {
        return;
    }
    const container = document.querySelector(".container");
    urls.forEach(url => addImageNode(container, url))
}

function addImageNode(container, url) {
    const div = document.createElement("div");
    div.className = "imageDiv";
    const img = document.createElement("img");
    img.src = url;
    div.appendChild(img);
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.setAttribute("url", url);
    div.appendChild(checkbox);
    container.appendChild(div);
}

document.getElementById("selectAll").addEventListener("change", (event) => {
    const items = document.querySelectorAll(".container input");
    for (let item of items) {
        item.checked = event.target.checked;
    }
})

document.getElementById("downloadBtn").addEventListener("click", async () => {
    try {
        const urls = getSelectedUrls();
        const archive = await createArchive(urls);
        downloadArchive(archive);
    } catch (err) {
        alert(err.message)
    }
})

function getSelectedUrls() {
    const urls =
        Array.from(
            document.querySelectorAll(".container input"))
            .filter(item => item.checked)
            .map(item => item.getAttribute("url"));
    if (!urls || !urls.length) {
        throw new Error("Please, select at least one image")
    }
    return urls;
}

async function createArchive(urls) {
    const zip = new JSZip();
    for (let index in urls) {
        try{
            const url = urls[index];
            const response = await fetch(url);
            const blob = await response.blob();
            zip.file(checkAndGetFileName(index, blob),blob);
        } catch (err){
            console.error(err);
        }
    }
    return await zip.generateAsync({
        type:"blob",
        compression:"DEFLATE",
        compressionOptions:{
            level:9
        }
    })
}

function downloadArchive(archive) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(archive);
    link.download = "images.zip";
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
}

function checkAndGetFileName(index, blob){
    let  name = parseInt(index)+1;
    const [type,extension] = blob.type.split("/");
    if (type !== "image" || blob.size <= 0){
        throw Error("Incorrect content");
    }
    return name + "." + extension.split("+").shift();
}