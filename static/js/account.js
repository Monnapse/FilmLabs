window.onload = function() {
    console.log("account.js loaded");

    loadGlobal();

    const sections = document.getElementsByClassName("account-properties-container");
    const buttons = document.getElementsByClassName("side-button-empty");
    
    const options = {
        root: null,
        threshold: 0.3
    };
    
    const callback = (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                iterate(buttons, (btn)=>{
                    btn.classList.remove("side-button");
                })
                document.getElementById(entry.target.id+"-btn").classList.add("side-button");
            }
        });
    };
    
    const observer = new IntersectionObserver(callback, options);
    iterate(sections, (container) => observer.observe(container));
};