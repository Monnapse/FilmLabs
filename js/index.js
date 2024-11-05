window.onload = function() {
    console.log("index.js loaded");

    // Scrolling
    const mediaList = document.getElementsByClassName("media-list");
    let isDown = false;
    let startX;
    let scrollLeft;

    for (let i=0; i<mediaList.length; i++)
    {
        const listContainer = mediaList.item(i);
        listContainer.addEventListener("mousedown", (e)=>{
            isDown = true;
            startX = e.pageX - scrollContainer.offsetLeft;
            scrollLeft = scrollContainer.scrollLeft;
            console.log("mouse down");
        })
        listContainer.addEventListener('mouseleave', () => {
            isDown = false;
        });
        listContainer.addEventListener('mouseup', () => {
            isDown = false;
        });
        listContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - listContainer.offsetLeft;
            const walk = (x - startX) * 2;
            listContainer.scrollLeft = scrollLeft - walk;
        });
        listContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            listContainer.scrollLeft += e.deltaY;
        });
    }
};