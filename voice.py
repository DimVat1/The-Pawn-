import pyttsx3

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

if __name__ == "__main__":
    speak("Hello! I am your virtual assistant. How can I help you today?")
