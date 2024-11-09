let isLoading = false;

window.onload = function() {
    console.log("index.js loaded");

    loadGlobal();

    let page = 1;
    let reachedPageLimit = false;

    const categoryContainer = document.getElementById("categories")

    dynamicScrollBarLoading(async ()=>{
        if (isLoading || reachedPageLimit) { return; };
        isLoading = true;
        
        try {
            const response = await fetch(`get_home_page_categories?page=${page}`);

            //if (!response.ok) throw new Error('Network response was not ok');

            reachedPageLimit = hasReachedPageLimit(response);

            if (reachedPageLimit) { return; }

            const data = await response.json();

            data.data.forEach(item => {
                // Category
                cardsList = "";
                item.film_list.results.forEach((item)=>{
                    cardsList += createFilmCard(item);
                })

                category = createCategory(item.title, cardsList, item.media_type, item.list_type, item.time_window);

                //console.log(category);
                //categoryContainer.insertAdjacentElement("beforeend", category)

                const container = document.createElement('div');

                container.innerHTML = category;

                categoryContainer.appendChild(container.firstChild);

                addScrollList(document.getElementById(`scroll-${item.title}`));
            });

            page++;
        } catch (error) {
            console.error('Failed to load data:', error);
            return false;
        } finally {
            isLoading = false;
            return true;
        }
    });
};
