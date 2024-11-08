let isLoading = false;

window.onload = function() {
    console.log("selectedFilms.js loaded");

    loadGlobal();

    let page = 1;
    let reachedPageLimit = false;

    const mediaGrid = document.getElementById("media-grid");

    const path = window.location.pathname; // e.g., "/category/day/trending"
    const segments = path.split('/');

    const mediaType = segments[2];
    const listType = segments[3];
    const timeWindow = segments[4];

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
            const response = await fetch(`/get_category?page=${page}&media_type=${mediaType}&list_type=${listType}&time_window=${timeWindow}`);

            reachedPageLimit = hasReachedPageLimit(response);

            if (reachedPageLimit) { return; }

            const data = await response.json();

            // Category
            let cardsList = "";
            data.data.results.forEach((item)=>{
                cardsList += createFilmCard(
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    item.poster_path
                );
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
        } finally {
            isLoading = false;
        }
    }
    dynamicScrollBarLoading(scroll);
};
