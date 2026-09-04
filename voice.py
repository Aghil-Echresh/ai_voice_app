import requests

VOICE_API = "YOUR_VOICE_API_KEY"
VOICE_ID = "YOUR_VOICE_ID"

def text_to_voice(text):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    headers = {
        "xi-api-key": VOICE_API,
        "Content-Type": "application/json"
    }
    data = {
        "text": text,
        "voice_settings": {
            "stability": 0.35,
            "similarity_boost": 0.85,
            "style": 0.7,
            "use_speaker_boost": True
        }
    }
    audio = requests.post(url, json=data, headers=headers)
    return audio.content