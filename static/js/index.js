window.onload = function() {
    console.log("index.js loaded");

    loadGlobal();

    let page = 1;
    let isLoading = false;

    const categoryContainer = document.getElementById("categories")

    console.log(categoryContainer)

    async function loadMoreData() {
        if (isLoading) return;
        isLoading = true;

        //document.getElementById('loading').style.display = 'block';

        try {
            const response = await fetch(`get_home_page_categories?page=${page}`);

            //if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();

            //const contentDiv = document.getElementById('content');

            //console.log(data)
            data.data.forEach(item => {
                // Category
                cardsList = "";
                item.film_list.results.forEach((item)=>{
                    cardsList += createFilmCard();
                })

                category = createCategory(item.title, cardsList);

                //console.log(category);
                //categoryContainer.insertAdjacentElement("beforeend", category)

                const container = document.createElement('div');

                container.innerHTML = category;

                console.log(container.firstChild)
                categoryContainer.appendChild(container.firstChild);
            });

            page++;

        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            isLoading = false;
        }
    }

    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !isLoading) {
            loadMoreData();
        }
    });

    loadMoreData();
};

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

function createCategory(title, filmCards)
{
    /*
        <section class="category">
            <h2>Featured today</h2>
        </section>
    */

    const html = `<section class="category"><h2>${title}</h2>${filmCards}</section>`

    return html
}

