from flask import render_template, request, jsonify, session
from flask_app.models.model_score import Score
from flask_app.models.model_user import User
from flask_app import app

@app.route('/updateScore', methods=["POST"])
def updateScore():
    session["currentScore"] = request.form["score"]
    return jsonify(message = "success")

@app.route("/saveScoreWin", methods=["POST"])
def saveScoreWin():
    user = User.get_user_by_email(session["data"])
    print(session['currentScore'])
    data = {
        "guesses": int(session["currentScore"]) + 1,
        "user_id": user.id
    }
    Score.save_guesses(data)
    User.update_attempts(user.id)
    User.update_won(user.id)
    User.update_streak(user.id)
    if int(User.get_streak(user.id)[0]["streak"]) > int(User.get_max_streak(user.id)[0]["max_streak"]):
        User.update_max_streak(user.id)

    return jsonify(message = "success")

@app.route("/saveScoreLoss", methods=["POST"])
def saveScoreLoss():
    user = User.get_user_by_email(session["data"])
    User.update_attempts(user.id)
    User.update_streak_loss(user.id)
    return jsonify(message = "success")

@app.route("/getScoreData")
def getScoreData():
    user = User.get_user_by_email(session["data"])
    score = []
    for i in range(1, 7):
        data = {
            "guesses": i,
            "user_id": user.id
        }
        score.append(Score.get_scores(data)[0]['COUNT(*)'])
    return jsonify(score)

@app.route("/getPlayedData")
def getPlayedData():
    user = User.get_user_by_email(session["data"])
    played = User.get_attempts(user.id)[0]["played"]
    return jsonify(played)

@app.route("/getWinRate")
def getWinData():
    user = User.get_user_by_email(session["data"])
    won = User.get_won(user.id)[0]["won"]
    return jsonify(won)

@app.route("/getStreakData")
def getStreakData():
    user = User.get_user_by_email(session["data"])
    streak = User.get_streak(user.id)[0]["streak"]
    return jsonify(streak)

@app.route("/getMaxStreakData")
def getMaxStreakData():
    user = User.get_user_by_email(session["data"])
    streak = User.get_max_streak(user.id)[0]["max_streak"]
    return jsonify(streak)

@app.route("/getSessionData")
def getSessionData():
    if "data" in session:
        return jsonify(True)
    return jsonify(False)