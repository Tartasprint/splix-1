
const beginScreen = document.querySelector("#beginScreen");
function isInGame() {
    return beginScreen.getAttribute("style")?.includes("display: none");
}

document.addEventListener("wheel", (e)=>{
    if (!isInGame()) return;
    console.log('log')
    let isUp = e.deltaY > 1;
    if (isUp) {
     zoom_out();
    } else {
        zoom_in();
    }
})

document.addEventListener('keydown',(e)=> {
    if(e.code === "KeyQ"){
        zoom_in();
    } else if(e.code === "KeyW") {
        zoom_initial();
    } else if(e.code === "KeyE") {
        zoom_out();
    }
})

function zoom_out(){
    if (window.BLOCKS_ON_SCREEN < 10000) window.BLOCKS_ON_SCREEN = (Math.sqrt(window.BLOCKS_ON_SCREEN)+5)**2;
}

function zoom_initial(){
    window.BLOCKS_ON_SCREEN = 1100;
}

function zoom_in(){
    if (window.BLOCKS_ON_SCREEN > 20) window.BLOCKS_ON_SCREEN = (Math.sqrt(window.BLOCKS_ON_SCREEN)-5)**2;
}