const audio = new Audio("sounds/ting.mp3");
const socket = io('http://localhost:8000');

const form = document.getElementById('send-container');
const messageinput = document.getElementById('messageinp');
const messageContainer = document.querySelector(".container");
const typingStatus = document.getElementById("typing-status");
//hey there thanks for coming here

// 👉 Emoji replacements
const replaceEmojis = (text) => {
    return text
        .replace(":)", "😊")
        .replace(":(", "😞")
        .replace(":D", "😄")
        .replace("<3", "❤️");
};

const append = (message, position) => {
    const messageElement = document.createElement('div');

    // Add timestamp
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageElement.innerText = `${replaceEmojis(message)} • ${time}`;
    messageElement.classList.add('message', position);
    messageContainer.append(messageElement);

    // Auto-scroll to bottom
    messageContainer.scrollTop = messageContainer.scrollHeight;

    // Play notification
    if (position === 'left') audio.play();
    
    
};


const name = prompt("Enter your name to join");

if (name && name.trim() !== "") {
    const trimmedName = name.trim();
    socket.emit('new-user-joined', trimmedName);

    append(`You joined the chat`, 'right');

    socket.on('user-joined', joinedName => {
        if (joinedName !== trimmedName) {
            append(`${joinedName} joined the chat`, 'left');
        }
    });

    socket.on('recieve', data => {
        append(`${data.name}: ${data.message}`, 'left');
    });

    socket.on('user-left', leftName => {
    append(`${leftName} left the chat`, 'left');
});


    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageinput.value.trim();
        if (message !== "") {
            append(`${trimmedName}: ${message}`, 'right');
            socket.emit('send', message);
            messageinput.value = '';
        }
    });

    // Typing indicator
    messageinput.addEventListener('input', () => {
        socket.emit('typing', trimmedName);
        setTimeout(() => {
            socket.emit('stopTyping');
        }, 1000);
    });

    socket.on('displayTyping', (userName) => {
        typingStatus.innerText = `${userName} is typing...`;
    });

    socket.on('hideTyping', () => {
        typingStatus.innerText = "";
    });
} else {
    alert("Name is required to join the chat!");
}
