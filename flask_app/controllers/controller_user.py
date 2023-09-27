from flask_app import app
from flask_app import bcrypt
from flask_app.models.model_user import User
from flask import render_template, redirect, request, session, jsonify

@app.route("/")
def home():
    return render_template("home.html")

@app.route("/wordle")
def wordle():
    return render_template("wordle.html")

@app.route("/register", methods=["POST"])
def register():
    data = {**request.form}

    if not User.validate_reg(data):
        return redirect("/wordle")
    
    pw_hash = bcrypt.generate_password_hash(request.form['password'])
    data['password'] = pw_hash

    User.create(data)
    session['data'] = data

    return redirect("/wordle")

@app.route("/login/validate", methods=["POST"])
def loginValidate():
    data = {**request.form}
    user = User.get_user_by_email(data)
    if(not User.validate_log(data)):
        return redirect("/wordle")
    
    data["name"] = user.name
    session['data'] = data
    session['data']['name'] = user.name

    return redirect("/wordle")

@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")