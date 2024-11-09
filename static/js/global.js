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
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !isLoading) {
            loadEvent();
        }
    });

    loadEvent();

    // Keep loading more until scrolling is possible
    // because if client cant scroll then they cant load anything more.
    async function call_until(stop, passes)
    {
        if (stop || passes > 5) { return; }

        setTimeout(()=>{
            loadEvent().then((result) => {
                //console.log(result)
                if (result) 
                {
                    return call_until(isScrollingPossible(), passes+1);
                }
            })
            .catch(console.error)
        }, 1000)
    }
    call_until(isScrollingPossible(), 0);
}

function isScrollingPossible() {
    return document.documentElement.scrollHeight > window.innerHeight;
}

function loadGlobal()
{
    console.log("global.js loaded");

    // Search bar
    const searchbar = document.getElementById("searchbar");
    const searchbarBtn = document.getElementById("searchbar-btn");

    const params = new URLSearchParams(window.location.search);;
    const query = params.get("query");

    if (query)
    {
        searchbar.value = query;
    }

    searchbar.addEventListener('keydown', (e)=>{
        if (e.code == "Enter")
        {
            search(searchbar.value);
        }
    });
    searchbarBtn.addEventListener('click', ()=>{
        search(searchbar.value);
    });

    // Scrolling
    const mediaList = document.getElementsByClassName("scroll-list");
    iterate(mediaList, (listContainer)=>{
        addScrollList(listContainer);
    })
}

function search(query) {
    // search_media?media_type=multi&page=1&query=the%20100&include_adult=true
    if (query)
    {
        window.location.href = `search?media_type=all&page=1&query=${encodeURIComponent(query)}&include_adult=false`;
    }
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
        //console.log("toggle");
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

function createFilmCard(film, url)
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

    if (film == null) { return; }

    //console.log(film);

    const title = film.media_type === "movie" ? film.title : film.media_type === "tv" ? film.name : "Loading"
    const year = film.media_type === "movie" ? film.release_date.split("-")[0] : film.media_type === "tv" ? film.first_air_date.split("-")[0] : "Loading";
    const rating = parseFloat(film.vote_average.toFixed(1));;
    const mediaType = film.media_type === "movie" ? "Movie" : film.media_type === "tv" ? "TV" : "Loading";
    let img = film.poster_path;

    //console.log(img);

    if (img == null)
    {
        img = "/static/media/movie_poster_not_found.jpg"
    }

    //const html = `<div class="media-modal unselectable"><div class="media-info"><div><h3>${title}</h3><div><p>${year}</p><p>${rating}</p><p>${time}</p><p>${ageRating}</p><p>${mediaType}</p></div></div></div><img src="${film.poster_path}"></div>`
    const html = `<div class="media-modal unselectable"><div class="media-info"><div><h3>${title}</h3><div><p>${year}</p><p>${rating}</p><p>${mediaType}</p></div></div></div><img src="${img}"></div>`

    const container = document.createElement('div');
    container.innerHTML = html;

    const card = container.firstChild;

    function onClick()
    {
        window.location.href = url;
    }

    if (isMobile()) {
        card.addEventListener('dblclick', onClick);
    } else {
        card.addEventListener('click', onClick);
    }

    return container.firstChild;
}

function isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

function createCategory(title, mediaType, listType, timeWindow)
{
    /*
        <section class="category">
            <h2>Featured today</h2>
        </section>
    */

    /*
        media_type
        list_type
        time_window
    */

    const timeHtml = timeWindow != null ? `&time_window=${timeWindow}` : ""

    const html = `<section class="category"><a class="h3" href="/category?media_type=${mediaType}&list_type=${listType}${timeHtml}">${title}</a><div id="scroll-${title}" class=" media-list scroll-list"></div></section>`

    const container = document.createElement('div');
    container.innerHTML = html;

    return container.firstChild;
}

function addScrollWithRequest(apiString, mediaGrid)
{
    let page = 1;
    let reachedPageLimit = false;

    async function scroll()
    {
        if (isLoading || reachedPageLimit) { return; };
        isLoading = true;
        try {
            /*
                /get_category?page=5&media_type=tv&list_type=top_rated&time_window=null
                get_category

                page
                media_type
                list_type
                time_window
            */
            const response = await fetch(`${apiString}&page=${page}`); //`/get_category?page=${page}&media_type=${mediaType}&list_type=${listType}&time_window=${timeWindow}`);

            if (reachedPageLimit) { return; }
            reachedPageLimit = hasReachedPageLimit(response);
            if (reachedPageLimit) { return; }

            const data = await response.json();

            if (data.data.results.length <= 0)
            {
                reachedPageLimit = true;
                return false;
            }

            // Category
            //let cardsList = "";
            data.data.results.forEach((item)=>{
                const card = createFilmCard(item, getFilmUrl(item));
                mediaGrid.appendChild(card);
            })

            //const container = document.createElement('div');
            //container.innerHTML = cardsList;
//
            //Array.from(container.children).forEach(child => {
            //    mediaGrid.appendChild(child);
            //});

            page++;
        } catch (error) {
            console.error('Failed to load data:', error);
            return false;
        } finally {
            isLoading = false;
            return true;
        }
    }
    dynamicScrollBarLoading(scroll);
}

function getFilmUrl(film)
{
    const media_type = film.media_type
    let url = `/film/${media_type}/${film.id}`
    if (media_type == "tv")
    {
        url += "/1/1"
    }
    return url;
}