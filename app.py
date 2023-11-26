from flask import Flask, render_template, request, jsonify
import pyttsx3
import threading

app = Flask(__name__)

def speak(message):
    engine = pyttsx3.init()

    # Adjust the rate and volume as needed
    rate = engine.getProperty('rate')
    engine.setProperty('rate', rate - 50)  # Decrease the rate for a deeper voice

    volume = engine.getProperty('volume')
    engine.setProperty('volume', volume + 0.5)  # Increase the volume

    # Use a male voice if available, otherwise use the default voice
    voices = engine.getProperty('voices')
    male_voice = [voice for voice in voices if "male" in voice.name.lower()]
    if male_voice:
        engine.setProperty('voice', male_voice[0].id)

    engine.say(message)
    engine.runAndWait()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/speak', methods=['POST'])
def speak_text():
    data = request.get_json()
    message = data['message']

    # Speak the message in a separate thread to avoid blocking the main thread
    threading.Thread(target=speak, args=(message,)).start()

    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(debug=True)
