from flask_app.config.mysqlconnection import connectToMySQL
from flask_app.models import model_user
from flask_app import DATABASE

class Score:
    
    def __init__(self, data):
        self.id = data['id']
        self.guesses = data['guesses']
        self.user_id = data['user_id']
        self.created_at = data['created_at']
        self.updated_at = data['updated_at']
        
    @classmethod
    def save_guesses(cls, data):
        query = "INSERT INTO scores (guesses, user_id) VALUES (%(guesses)s, %(user_id)s)"
        return connectToMySQL(DATABASE).query_db(query, data)
    
    @classmethod
    def get_scores(cls, data):
        query = "SELECT COUNT(*) FROM scores WHERE user_id = %(user_id)s AND guesses = %(guesses)s;"
        return connectToMySQL(DATABASE).query_db(query, data)
    
    