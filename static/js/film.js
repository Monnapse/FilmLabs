window.onload = function() {
    console.log("film.js loaded");
    
    loadGlobal();

    // Seasons drropdown
    const DropdownBtn = document.getElementsByClassName("dropdown-button")[0];
    const DropdownList = document.getElementsByClassName("dropdown-list-container")[0];
    addDropdown(DropdownBtn, DropdownList);
};