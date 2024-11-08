let hideOnClickList = [];
let blacklist = [];

let autoLoadGlobal = false;

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", (e) => {
        hideOnClickList.forEach((element)=>{
            if (e.target != element && !isBlacklisted(e.target))
            {
                element.classList.add("hide");
                element.classList.remove("show");
            }
        })
    });
});

window.onload = function() {
    if (autoLoadGlobal)
    {
        loadGlobal();
    }
};

function dynamicScrollBarLoading(loadEvent)
{
    window.addEventListener('scroll', () => {
        console.log(isScrollingPossible())
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !isLoading) {
            loadEvent();
        }
    });

    loadEvent();

    // Keep loading more until scrolling is possible
    // because if client cant scroll then they cant load anything more.
    function call_until(stop)
    {
        if (stop) { return; }

        setTimeout(()=>{
            loadEvent();
            return call_until(isScrollingPossible());
        }, 1000)
    }
    call_until(isScrollingPossible());
}

function isScrollingPossible() {
    return document.documentElement.scrollHeight > window.innerHeight;
}

function loadGlobal()
{
    console.log("global.js loaded");

    // Scrolling
    const mediaList = document.getElementsByClassName("scroll-list");

    iterate(mediaList, (listContainer)=>{
        addScrollList(listContainer);
    })
}

function addScrollList(listContainer)
{
    let isDown = false;
    let startX;
    let scrollLeft;

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
}

function isBlacklisted(element)
{
    let isBlacklistedBool = false;
    blacklist.forEach((b)=>{
        if (b == element)
        {
            isBlacklistedBool = true;
        }
    })
    return isBlacklistedBool;
}

function iterate(list, callback)
{
    for (let i=0; i<list.length; i++)
    {
        const obj = list.item(i);
        callback(obj);
    }
}
function addHideOnClick(element)
{
    hideOnClickList.push(element);
}
function addBlacklist(element)
{
    blacklist.push(element);
}
function addDropdown(button, list)
{
    addHideOnClick(list);
    addBlacklist(button);
    button.addEventListener("click", (e)=>{
        console.log("toggle");
        list.classList.toggle("hide");
    })
}

function hasReachedPageLimit(data)
{
    if (data && data.status == 200)
    {
        return false;
    }
    else if (data && data.status == 404)
    {
        // Reached page limit
        return true;
    }
}

function createFilmCard(title, year, rating, time, ageRating, mediaType, img)
{
    /*
        <div class="media-modal unselectable">
            <div class="media-info">
                <div>
                    <h3>Dune: Part Two</h3>
                    <div>
                        <p>2024</p>
                        <p>8.5/10</p>
                        <p>2h 46m</p>
                        <p>PG-13</p>
                        <p>Movie</p>
                    </div>
                </div>
            </div>
            <img src="media/dune.jpg">
        </div>
    */

    const html = `<div class="media-modal unselectable"><div class="media-info"><div><h3>${title}</h3><div><p>${year}</p><p>${rating}</p><p>${time}</p><p>${ageRating}</p><p>${mediaType}</p></div></div></div><img src="${img}"></div>`

    return html;
}

function createCategory(title, filmCards, mediaType, listType)
{
    /*
        <section class="category">
            <h2>Featured today</h2>
        </section>
    */

    const html = `<section class="category"><a class="h3" href="/category/${mediaType}/${listType}">${title}</a><div id="scroll-${title}" class="media-list scroll-list">${filmCards}</div></section>`

    return html
}
