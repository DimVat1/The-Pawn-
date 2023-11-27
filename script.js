// Initialize variables
let isListening = false;
let recognition;

// Elements
const logoContainer = document.getElementById('logo-container');
const chatContainer = document.getElementById('chat-messages');

// Event listener for the logo container
logoContainer.addEventListener('click', toggleListening);

// Greet user on page load
document.addEventListener('DOMContentLoaded', () => {
    generateBotResponse('Hello! How can I assist you today?');
});

// Toggle voice recognition
function toggleListening() {
    isListening ? stopListening() : startListening();
}

// Start voice recognition
function startListening() {
    isListening = true;
    pauseLogoAnimation();
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    configureRecognition();
    recognition.start();
}

// Configure SpeechRecognition settings
function configureRecognition() {
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onstart = () => console.log('Listening...');
    recognition.onend = handleRecognitionEnd;
    recognition.onresult = handleRecognitionResult;
}

// Handle recognition end
function handleRecognitionEnd() {
    console.log('Stopped listening.');
    resumeLogoAnimation();

    if (isListening) {
        recognition.start();
    }
}

// Handle recognition results
function handleRecognitionResult(event) {
    const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');

    if (event.results[0].isFinal) {
        processUserCommand(transcript.toLowerCase());
    }
}

// Process user commands
function processUserCommand(userInput) {
    const commands = {
        'open youtube': 'https://www.youtube.com/',
        'open facebook': 'https://www.facebook.com/',
        'open instagram': 'https://www.instagram.com/',
        'open snapchat': 'https://www.snapchat.com/',
        'open spotify': 'https://www.spotify.com/',
        'open camera': openCameraInNewTab,
        'take a picture': takePictureInNewTab,
        'stop listening': stopListening,
    };

    for (const command in commands) {
        if (userInput.includes(command)) {
            commands[command] instanceof Function ? commands[command]() : openWebsite(commands[command]);
            return;
        }
    }

    generateBotResponse('I\'m not sure how to respond to that. Can you please try a different command?');
}

// Stop listening function
function stopListening() {
    isListening = false;
    recognition.stop();
}

// Open website in a new tab
function openWebsite(url) {
    window.open(url, '_blank');
    generateBotResponse(`Opening ${url}...`);
}

// Open camera preview in a new tab
function openCameraInNewTab() {
    const newTab = window.open('', '_blank');
    newTab.document.write('<video id="camera-preview" autoplay playsinline></video>');
    
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            newTab.document.getElementById('camera-preview').srcObject = stream;
            newTab.document.addEventListener('message', handleNewTabMessage);
        })
        .catch(handleCameraError);

    generateBotResponse('Opening camera preview in a new tab...');
}

// Handle messages in the new tab
function handleNewTabMessage(event) {
    const command = event.data.toLowerCase();
    if (command === 'take a picture') {
        takePictureInNewTab();
    }
}

// Take a picture in the new tab
function takePictureInNewTab() {
    const newTab = window.open('', '_blank');
    const canvas = createCanvasFromCameraPreview(newTab.document.getElementById('camera-preview'));
    const dataUrl = canvas.toDataURL('image/png');
    localStorage.setItem('capturedPicture', dataUrl);
    newTab.document.write('<p>Picture taken and saved!</p>');
}

// Create canvas from camera preview
function createCanvasFromCameraPreview(videoElement) {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    canvas.getContext('2d').drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas;
}

// Generate bot response
function generateBotResponse(userInput) {
    fetch('chatbot.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userMessage: userInput }),
    })
        .then(response => response.json())
        .then(async data => {
            const assistantReply = 'Virtual Agent: ' + data.assistantReply;
            console.log(assistantReply);
            await speak(assistantReply);
            addChatMessage(assistantReply);
        })
        .catch(error => console.error('Error:', error));
}

// Speak the given message using a male voice
async function speak(message) {
    const maleVoice = await getMaleVoice();
    return new Promise(resolve => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.voice = maleVoice;
        utterance.onend = resolve;
        speechSynthesis.speak(utterance);
    });
}

// Add a chat message to the container
function addChatMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.textContent = message;
    chatContainer.appendChild(messageDiv);
}

// Get a male voice for speech synthesis
async function getMaleVoice() {
    return new Promise(resolve => {
        let voices = speechSynthesis.getVoices();

        if (voices.length) {
            resolve(voices.find(voice => voice.name.includes('Male')));
        } else {
            speechSynthesis.onvoiceschanged = () => {
                voices = speechSynthesis.getVoices();
                resolve(voices.find(voice => voice.name.includes('Male')));
            };
        }
    });
}

// Pause logo animation
function pauseLogoAnimation() {
    logoContainer.style.animationPlayState = 'paused';
}

// Resume logo animation
function resumeLogoAnimation() {
    logoContainer.style.animationPlayState = 'running';
}
