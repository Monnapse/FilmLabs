let hideOnClickList = [];
let blacklist = [];

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

function isBlacklisted(element)
{
    let isBlacklistedBool = false;
    blacklist.forEach((b)=>{
        //const queryElement = document.querySelector(e.target);
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
function manageLoggedIn(isLoggedIn)
{
    if (isLoggedIn)
    {
        const loggedInContainer = document.getElementById("logged-in");
        const loggedOutContainer = document.getElementById("logged-out");

        if (loggedInContainer != null)
        {
            loggedInContainer.classList.remove("hide");
            loggedInContainer.classList.add("show");
            if (loggedOutContainer != null)
            {
                loggedOutContainer.classList.remove("show");
                loggedOutContainer.classList.add("hide");
            }

            // Show account box when user toggles account button
            const popoutBox = document.getElementById("account-popout-box");
            addHideOnClick(popoutBox);
            addBlacklist(loggedInContainer);
            console.log("popoutBox");
            loggedInContainer.addEventListener("click", (e)=>{
                popoutBox.classList.toggle("hide");
            })
        }
    } 
    else
    {
        const loggedInContainer = document.getElementById("logged-in");
        const loggedOutContainer = document.getElementById("logged-out");

        if (loggedOutContainer != null)
        {
            loggedOutContainer.classList.remove("hide");
            loggedOutContainer.classList.add("show");
            if (loggedInContainer != null)
            {
                loggedInContainer.classList.remove("show");
                loggedInContainer.classList.add("hide");
            }
        }
    }
}