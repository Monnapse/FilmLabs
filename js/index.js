window.onload = function() {
    console.log("index.js loaded");

    let loggedIn = true;

    // Account/Login
    manageLoggedIn(loggedIn);

    // Scrolling
    const mediaList = document.getElementsByClassName("media-list");
    let isDown = false;
    let startX;
    let scrollLeft;

    iterate(mediaList, (listContainer)=>{
        listContainer.addEventListener("mousedown", (e)=>{
            isDown = true;
            startX = e.pageX - listContainer.offsetLeft;
            scrollLeft = listContainer.scrollLeft;
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
    })
};