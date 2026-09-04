from flask import Flask, request, send_file
from ai import generate_text
from voice import text_to_voice

app = Flask(__name__)

@app.route("/ai-voice", methods=["POST"])
def ai_voice():
    data = request.json
    prompt = data.get("prompt")

    # تولید متن
    text = generate_text(prompt)

    # تبدیل متن به صدا
    audio = text_to_voice(text)

    # ذخیره فایل صوتی
    filename = "output.wav"
    with open(filename, "wb") as f:
        f.write(audio)

    return send_file(filename, mimetype="audio/wav")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)