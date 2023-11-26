// Initialize variables
let isListening = false;
let recognition;

// Elements
const logoContainer = document.getElementById('logo-container');
const chatContainer = document.getElementById('chat-messages');
const cameraPopup = document.getElementById('camera-popup');
const cameraPreview = document.getElementById('camera-preview');

// Event listener for the logo container
logoContainer.addEventListener('click', toggleListening);

// Greet user on page load
document.addEventListener('DOMContentLoaded', () => {
    generateBotResponse('Hello! How can I assist you today?');
});

// Toggle voice recognition
function toggleListening() {
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
}

// Start voice recognition
function startListening() {
    isListening = true;

    // Pause logo animation while listening
    logoContainer.style.animationPlayState = 'paused';

    // Initialize SpeechRecognition
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    // Set event listeners
    recognition.onstart = () => console.log('Listening...');
    recognition.onend = handleRecognitionEnd;
    recognition.onresult = handleRecognitionResult;

    // Start recognition
    recognition.start();
}

// Handle recognition end
function handleRecognitionEnd() {
    console.log('Stopped listening.');

    // Resume logo animation when not listening
    logoContainer.style.animationPlayState = 'running';

    // Restart recognition if still in listening mode
    if (isListening) recognition.start();
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
    if (userInput.includes('open youtube')) {
        openWebsite('https://www.youtube.com/');
    } else if (userInput.includes('open facebook')) {
        openWebsite('https://www.facebook.com/');
    } else if (userInput.includes('open instagram')) {
        openWebsite('https://www.instagram.com/');
    } else if (userInput.includes('open snapchat')) {
        openWebsite('https://www.snapchat.com/');
    } else if (userInput.includes('open spotify')) {
        openWebsite('https://www.spotify.com/');
    } else if (userInput.includes('open camera')) {
        openCameraPopup();
    } else if (userInput.includes('take a picture')) {
        takePicture();
    } else if (userInput.includes('stop listening')) {
        stopListening();
    } else {
        generateBotResponse('I\'m not sure how to respond to that. Can you please try a different command?');
    }
}

// Stop listening function
function stopListening() {
    isListening = false;
    recognition.stop();
    console.log('Stopped listening.');

    // Resume logo animation when not listening
    logoContainer.style.animationPlayState = 'running';
}

// Open website in a new tab
function openWebsite(url) {
    window.open(url, '_blank');
    generateBotResponse(`Opening ${url}...`);
}

// Open camera popup
function openCameraPopup() {
    // Display the camera popup
    cameraPopup.style.display = 'block';

    // Ask for camera access
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(handleCameraStream)
        .catch(handleCameraError);
}

// Handle camera stream
function handleCameraStream(stream) {
    // Set the camera preview source
    if ("srcObject" in cameraPreview) {
        cameraPreview.srcObject = stream;
    } else {
        // Fallback for older browsers
        cameraPreview.src = window.URL.createObjectURL(stream);
    }
}

// Handle camera error
function handleCameraError(error) {
    console.error('Unable to access camera:', error);
    closeCameraPopup();
}

// Take a picture and download it
function takePicture() {
    const canvas = document.createElement('canvas');
    canvas.width = cameraPreview.videoWidth;
    canvas.height = cameraPreview.videoHeight;
    canvas.getContext('2d').drawImage(cameraPreview, 0, 0, canvas.width, canvas.height);

    // Convert the canvas content to a data URL
    const dataUrl = canvas.toDataURL('image/png');

    // Create a link element and trigger a download
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'snapshot.png';
    link.click();

    // Close the camera popup
    closeCameraPopup();
}

// Close camera popup
function closeCameraPopup() {
    // Hide the camera popup and stop the camera stream
    cameraPopup.style.display = 'none';
    if (cameraPreview.srcObject) {
        const tracks = cameraPreview.srcObject.getTracks();
        tracks.forEach(track => track.stop());
    }
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
