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

function login()
{
    const redirect = "/";

    const formData = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
        remember: document.getElementById("remember").checked
    };
  
    fetch("login_submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (response.status == 429)
        {
            alert("To many request's, please try again later.");
        }
        else if (!response.ok) {
            return response.json().then(errorData => {
                doOutcome(errorData, redirect);
            });
        }
        
        return response.json();
    })
    .then(data => {
        doOutcome(data, redirect);
    })
    .catch((error) => {
        doOutcome(error, redirect);
    });
}

function register()
{
    const username = document.getElementById("username").value;
    const passwordValue = document.getElementById("password").value;
    const reenterPasswordValue = document.getElementById("reenter_password").value;

    const redirect = "/login";

    if (passwordValue != reenterPasswordValue)
    {
        alert("Password and Reenter Password must match");
        return;
    }

    const formData = {
        username: username,
        password: passwordValue,
        reenter_password: reenterPasswordValue
    };

    fetch("register_submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (response.status == 429)
        {
            alert("To many request's, please try again later.");
        }
        else if (!response.ok) {
            return response.json().then(errorData => {
                doOutcome(errorData, redirect);
            });
        }
        
        return response.json();
    })
    .then(data => {
        doOutcome(data, redirect);
    })
    .catch((error) => {
        doOutcome(error, redirect);
    });
}

function doOutcome(data, redirect)
{
    if (data == null)  {return; }
    if (data.success && redirect != null)
    {
        window.location.href = redirect;
    }
    else
    {
        alertError(data);
    }
}

function alertError(error)
{
    if (error && error.message != null)
    {
        alert(error.message);
    }
}