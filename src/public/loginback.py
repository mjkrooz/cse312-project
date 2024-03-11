from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
import bcrypt

app = Flask(__name__)

client = MongoClient('db')
db = client['login']
users_collection = db['users']

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = users_collection.find_one({'username': username})

    if user: # check pass, return token if correct
        if bcrypt.checkpw(password.encode('utf-8'), user['password']):
            return jsonify({'message': 'Login successful', 'token': 'your_generated_token'}), 200
        else:
            return jsonify({'message': 'Incorrect password'}), 401
    else:
        return jsonify({'message': 'User not found'}), 404
    
    return render_template('login.html')

if __name__ == '__main__':
    app.run(debug=True)
