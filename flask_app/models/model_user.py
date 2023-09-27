from flask_app.config.mysqlconnection import connectToMySQL
from flask_app import DATABASE
from flask_app import bcrypt
from flask import flash
import re

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+$')

class User:
    def __init__(self, data:dict):
        self.id = data['id']
        self.name = data['name']
        self.email = data['email']
        self.password = data['password']
        self.played = data['played']
        self.won = data['won']
        self.streak = data['streak']
        self.max_streak = data['max_streak']
        self.created_at = data['created_at']
        self.updated_at = data['updated_at']
    
    @classmethod
    def create(cls, data:dict) -> int:
        query = "INSERT INTO users (name, email, password, played, won, streak, max_streak) VALUES (%(name)s, %(email)s, %(password)s, %(played)s, %(won)s, %(streak)s, %(max_streak)s);"
        return connectToMySQL(DATABASE).query_db(query, data)

    @classmethod
    def get_user_by_email(cls, data:dict):
        query = "SELECT * FROM users WHERE email = %(email)s;"
        results = connectToMySQL(DATABASE).query_db(query, data)

        if not results:
            return False

        return cls(results[0])
    
    @classmethod
    def get_attempts(cls, id):
        query = "SELECT played FROM users WHERE id = %(id)s;"
        return connectToMySQL(DATABASE).query_db(query, {"id": id})
    
    @classmethod
    def get_won(cls, id):
        query = "SELECT won FROM users WHERE id = %(id)s;"
        return connectToMySQL(DATABASE).query_db(query, {"id": id})
    
    @classmethod
    def get_streak(cls, id):
        query = "SELECT streak FROM users WHERE id = %(id)s;"
        return connectToMySQL(DATABASE).query_db(query, {"id": id})
    
    @classmethod
    def get_max_streak(cls, id):
        query = "SELECT max_streak FROM users WHERE id = %(id)s;"
        return connectToMySQL(DATABASE).query_db(query, {"id": id})

    @classmethod
    def update(cls, data):
        query = "UPDATE users SET name = %(name)s, email = %(email)s, password = %(password)s WHERE id = %(id)s;"
        return connectToMySQL(DATABASE).query_db(query, data)
    
    @classmethod
    def update_attempts(cls, id):
        query = "UPDATE users SET played = played + 1 WHERE id = %(id)s;"
        return connectToMySQL(DATABASE).query_db(query, {"id": id})
    
    @classmethod
    def update_won(cls, id):
        query = "UPDATE users SET won = won + 1 WHERE id = %(id)s;"
        return connectToMySQL(DATABASE).query_db(query, {"id": id})
    
    @classmethod
    def update_streak(cls, id):
        query = "UPDATE users SET streak = streak + 1 WHERE id = %(id)s;"
        return connectToMySQL(DATABASE).query_db(query, {"id": id})
    
    @classmethod
    def update_streak_loss(cls, id):
        query = "UPDATE users SET streak = 0 WHERe id = %(id)s;"
        return connectToMySQL(DATABASE).query_db(query, {"id": id})
    
    @classmethod
    def update_max_streak(cls, id):
        query = "UPDATE users SET max_streak = max_streak + 1 WHERE id = %(id)s;"
        result = connectToMySQL(DATABASE).query_db(query, {"id": id})
        return result
    
    @classmethod
    def delete(cls, data:dict) -> None:
        query = "DELETE FROM users WHERE id = %(id)s;"
        return connectToMySQL(DATABASE).query_db(query, data)

    @staticmethod
    def validate_reg(user:dict):
        is_valid = True
        has_upper = False
        has_lower = False
        has_spec = False
        has_num = False
        spec_chars = re.compile('[@_!#$%^&*()<>?/\|}{~:]')

        results = User.get_user_by_email({"email": user['email']})

        if not results:
            if len(user['name']) < 2:
                flash("First name must be at least 2 characters long", "error")
                is_valid = False
            if not EMAIL_REGEX.match(user['email']):
                flash("Invalid email address!", "error")
                is_valid = False
            if len(user['password']) < 8:
                flash("Password must be at least 8 characters long", "error")
                is_valid = False
            if not user['password'] == user['confirm_password']:
                flash("Passwords don't match", "error")
                is_valid = False

            for chars in range(0, len(user['password'])):
                if user['password'][chars].islower():
                    has_lower = True
                if user['password'][chars].isupper():
                    has_upper = True
                if spec_chars.search(user['password'][chars]):
                    has_spec = True
                if user['password'][chars].isnumeric():
                    has_num = True
            if not has_lower or not has_upper or not has_spec or not has_num:
                flash("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character", "error")
                is_valid = False

        else:
            flash("Email already taken!", "error")
            is_valid = False 

        return is_valid
    
    @staticmethod
    def validate_log(user:dict):
        is_valid = True
        results = User.get_user_by_email({"email": user['email']})

        if results:
            if not bcrypt.check_password_hash(results.password, user['password']):
                flash("Invalid email or password", "loginError")
                is_valid = False
        else:
            flash("Invalid email or password", "loginError")
            is_valid = False
        return is_valid