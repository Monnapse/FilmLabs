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
    .then(response => response.json())
    .then(data => {

    })
    .catch((error) => {

    });
}

function register()
{
    const username = document.getElementById("username").value;
    const passwordValue = document.getElementById("password").value;
    const reenterPasswordValue = document.getElementById("reenter_password").value;

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

    //try {
    //    const response = await fetch('register_submit', {
    //      method: 'POST',
    //      headers: { 'Content-Type': 'application/json' },
    //      body: JSON.stringify(formData)
    //    });
//
    //    if (!response.ok) {
    //        alert(error.message);
    //    }
//
    //    //const data = await response.json();
    //    //result.textContent = "Submission successful!";
//
    //} catch (error) {
    //    alert(error.message);
    //}

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
                doOutcome(errorData);
            });
        }
        
        return response.json();
    })
    .then(data => {
        doOutcome(data);
    })
    .catch((error) => {
        doOutcome(error);
    });
}

function doOutcome(data)
{
    if (data == null)  {return; }
    if (data.success)
    {
        window.location.href = "/";
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