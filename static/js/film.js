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

function toggleFavorite(id)
{
    const formData = {
        id: id
    };

    const response = fetch(`/toggle_favorite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    });
}

function setMediaIFrame(embed)
{
    const mediaIFrame = document.getElementById("media-iframe");
    mediaIFrame.src = embed;
    watchingTrailer = false;
}