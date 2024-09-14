from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient, errors

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# MongoDB client connection (handle potential connection errors)
try:
    client = MongoClient('mongodb+srv://sivcloud12:gesture@cluster0.imbqc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    db = client['sos_alerts_db']
    sos_collection = db['generate']
except errors.ConnectionError as e:
    print(f"Error connecting to MongoDB: {e}")

# API endpoint to receive SOS alerts (POST method)
@app.route('/alert', methods=['POST'])
def sos_alert():
    try:
        # Get the data from the POST request
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        # Extract necessary fields from the request
        user_id = data.get('user_id')
        name = data.get('name')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        if not all([user_id, name, latitude, longitude]):
            return jsonify({'message': 'Incomplete data'}), 400
        
        # Create the SOS alert object
        sos_alert_data = {
            'user_id': user_id,
            'name': name,
            'latitude': latitude,
            'longitude': longitude,
            'alert_message': "Help",
        }
        
        # Insert the SOS alert into MongoDB
        sos_collection.insert_one(sos_alert_data)

        # Return a success response
        return jsonify({'message': 'SOS Alert received and stored successfully'}), 200

    except Exception as e:
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500

# API endpoint to retrieve all SOS alerts (GET method)
@app.route('/getAlerts', methods=['GET'])
def get_sos_alerts():
    try:
        # Retrieve all SOS alerts from MongoDB
        alerts = list(sos_collection.find({}, {'_id': 0}))  # Exclude MongoDB's default _id field

        # Return the alerts in JSON format
        return jsonify(alerts), 200

    except Exception as e:
       return jsonify({'message': f'An error occurred: {str(e)}'}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
