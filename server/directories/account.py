"""
    Account page directories
    Made by Monnapse

    11/7/2024
"""

from server.web import WebClass

from flask import render_template, redirect

# SETTINGS

def run(app: WebClass):
    print("Account >>> Account directories loaded")

    @app.flask.route("/account")
    @app.limiter.limit("30 per minute")
    def account():
        try:
            authorization = app.get_authorization_data()

            if (authorization["logged_in"]):
                # If logged in then continue to account page
                return render_template(
                    app.base,
                    template = "account.html",
                    title = "Account",
                    javascript = "account",
                    no_footer = True,
                    authorization=authorization
                )
            else:
                # If not logged in then redirect to login page
                return redirect("/login")
        except Exception as e:
            print(f"Error in authentication controller at {account.__name__}: {e}")