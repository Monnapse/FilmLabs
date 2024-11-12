let isLoading = false;

window.onload = function() {
    console.log("selectedFilms.js loaded");

    loadGlobal();

    const mediaGrid = document.getElementById("media-grid");

    
    //    media_type
    //    list_type
    //    time_window
    const params = new URLSearchParams(window.location.search);
    const mediaType = params.get("media_type");
    const query = params.get("query");
    const includeAdult = params.get("include_adult") || true;

    // search_media?media_type=multi&page=1&query=the%20100&include_adult=true
    const apiString = `/search_media?media_type=${mediaType}&query=${query}&include_adult=${includeAdult}`;

    addScrollWithRequest(apiString, mediaGrid);

    /*
    let page = 1;
    let reachedPageLimit = false;

    const mediaGrid = document.getElementById("media-grid");

    
    //    media_type
    //    list_type
    //    time_window
    
    const params = new URLSearchParams(window.location.search);

    const mediaType = params.get("media_type");
    const query = params.get("query");
    const includeAdult = params.get("include_adult") || true;

    async function scroll()
    {
        if (isLoading || reachedPageLimit) { return; };
        isLoading = true;
        try {
            // search_media?media_type=multi&page=1&query=the%20100&include_adult=true
            const response = await fetch(`/search_media?page=${page}&media_type=${mediaType}&query=${query}&include_adult=${includeAdult}`);

            reachedPageLimit = hasReachedPageLimit(response);

            if (reachedPageLimit) { return; }

            const data = await response.json();

            if (data.data.results.length <= 0)
            {
                reachedPageLimit = true;
                return false;
            }

            // Category
            let cardsList = "";
            data.data.results.forEach((item)=>{
                cardsList += createFilmCard(item);
            })

            //category = createCategory(item.title, cardsList, item.media_type, item.list_type);

            const container = document.createElement('div');
            container.innerHTML = cardsList;

            //mediaGrid.appendChild(container.children);

            Array.from(container.children).forEach(child => {
                mediaGrid.appendChild(child);
            });

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
    */
};
