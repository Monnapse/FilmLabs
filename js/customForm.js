window.onload = function() {
    console.log("customForm.js loaded");

    // Checkboxes
    const sumbitBtns = document.getElementsByClassName("submit-btn");

    iterate(sumbitBtns, (btn)=>{
        btn.addEventListener("click", (e)=>{
            e.preventDefault();
        })
    });
};

function iterate(list, callback)
{
    for (let i=0; i<list.length; i++)
    {
        const obj = list.item(i);
        callback(obj);
    }
}