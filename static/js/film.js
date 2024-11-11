let watchingTrailer = false;
let addedToWatchHistory = false;

window.onload = function() {
    console.log("film.js loaded");
    
    loadGlobal();

    // Seasons drropdown
    const DropdownBtn = document.getElementsByClassName("dropdown-button")[0];
    const DropdownList = document.getElementsByClassName("dropdown-list-container")[0];
    addDropdown(DropdownBtn, DropdownList);

    //const mediaIFrameOverlay = document.getElementById("media-iframe-overlay");
}

function mediaFrameClicked()
{
    // Add to watch history
    addedToWatchHistory = true;

    iframeOverlay = document.getElementById("media-iframe-overlay");
    iframeOverlay.style.pointerEvents = 'none';

    const url = window.location.pathname;
    const urlPaths = url.split("/");
    console.log(urlPaths);
    // /film/tv/48866/1/1

    let mediaType = urlPaths[2];
    let tmdbId = urlPaths[3];
    let season = null, episode = null;

    if (mediaType.toLowerCase() == "tv")
    {
        season = urlPaths[4];
        episode = urlPaths[5];
    }

    //alert(`Media Frame Clicked.\n TMDB Id: ${tmdbId}, Media Type: ${mediaType}, Season: ${season}, Episode: ${episode}`)

    const formData = {
        tmdb_id: tmdbId,
        media_type: mediaType,
        season: season,
        episode: episode
    };

    fetch(`/add_to_watch_history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    });
}

async function setTrailer(mediaType, id)
{
    const response = await fetch(`/trailer/${mediaType.toLowerCase()}?id=${id}`);

    if (response.ok)
    {
        const data = await response.json();

        setMediaIFrame(data.embed);
        watchingTrailer = true;
        //createHtmlElement(`<iframe src="https://www.youtube.com/embed/N445qZGWUAA?si=AWcTjRaD52NOAK5e" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`)
    }
}

function toggleFavorite(id, media)
{
    const formData = {
        tmdb_id: id,
        media_type: media
    };

    fetch(`/toggle_favorite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    }).then(response => {
        if (response.status == 429)
        {
            alert("To many request's, please try again later.");
        }
        else if (!response.ok) {
            return response.json().then(errorData => {
                
            });
        }
        
        return response.json();
    })
    .then(data => {
        if (data.success)
        {
            const favoriteBtn = document.getElementById("favorite");
            const favoriteBtnText = document.querySelector("#favorite span");
            if (data.favorited)
            {
                favoriteBtn.classList.add("favorited");
                favoriteBtnText.textContent = "Favorited"
            }
            else 
            {
                favoriteBtn.classList.remove("favorited");
                favoriteBtnText.textContent = "Favorite"
            }
        }
    })
    .catch((error) => {
        
    });
}

function setMediaIFrame(embed)
{
    const mediaIFrame = document.getElementById("media-iframe");
    mediaIFrame.src = embed;
    watchingTrailer = false;
}