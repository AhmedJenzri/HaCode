document.addEventListener("DOMContentLoaded", function() {
    const darkModeSwitch = document.getElementById("dark-mode-switch");
    darkModeSwitch.addEventListener("change", function() {
        document.body.classList.toggle("dark-mode");
        document.body.classList.toggle("light-mode");

        const elementsToChange = document.querySelectorAll("body, .container, input, textarea, select, button");
        elementsToChange.forEach(element => {
            if (document.body.classList.contains("dark-mode")) {
                element.classList.remove("light-mode");
                element.classList.add("dark-mode");
            } else {
                element.classList.remove("dark-mode");
                element.classList.add("light-mode");
            }
        });
    });
});

function generateKey() {
    const algorithm = document.getElementById("algorithm-spinner").value;
    let key = '';
    if (algorithm === 'AES' || algorithm === 'Vigenère Cipher') {
        key = generateRandomString(16);
    } else if (algorithm === 'Caesar Cipher') {
        key = Math.floor(Math.random() * 26).toString();
    }
    document.getElementById("key-input").value = key;
}

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function encryptMessage() {
    const key = document.getElementById("key-input").value;
    const plaintext = document.getElementById("text-input").value;
    const algorithm = document.getElementById("algorithm-spinner").value;
    let encryptedMessage = '';
    try {
        if (algorithm === 'AES') {
            if (key.length !== 16) throw new Error("Key must be 16 characters long for AES.");
            encryptedMessage = aesEncrypt(plaintext, key);
        } else if (algorithm === 'Caesar Cipher') {
            const shift = parseInt(key);
            encryptedMessage = caesarCipher(plaintext, shift);
        } else if (algorithm === 'Vigenère Cipher') {
            encryptedMessage = vigenereCipher(plaintext, key, true);
        }
        document.getElementById("encrypted-text-input").value = encryptedMessage;
    } catch (error) {
        document.getElementById("encrypted-text-input").value = `Error: ${error.message}`;
    }
}

function decryptMessage() {
    const key = document.getElementById("key-input").value;
    const encryptedText = document.getElementById("text-input").value;
    const algorithm = document.getElementById("algorithm-spinner").value;
    let decryptedMessage = '';
    try {
        if (algorithm === 'AES') {
            if (key.length !== 16) throw new Error("Key must be 16 characters long for AES.");
            decryptedMessage = aesDecrypt(encryptedText, key);
        } else if (algorithm === 'Caesar Cipher') {
            const shift = parseInt(key);
            decryptedMessage = caesarCipher(encryptedText, -shift);
        } else if (algorithm === 'Vigenère Cipher') {
            decryptedMessage = vigenereCipher(encryptedText, key, false);
        }
        document.getElementById("decrypted-text-input").value = decryptedMessage;
    } catch (error) {
        document.getElementById("decrypted-text-input").value = `Error: ${error.message}`;
    }
}

function copyEncryptedMessage() {
    const encryptedMessage = document.getElementById("encrypted-text-input").value;
    navigator.clipboard.writeText(encryptedMessage);
}

function copyDecryptedMessage() {
    const decryptedMessage = document.getElementById("decrypted-text-input").value;
    navigator.clipboard.writeText(decryptedMessage);
}

function selectFile() {
    const fileInput = document.getElementById('file-input');
    fileInput.click();
    fileInput.onchange = () => {
        const file = fileInput.files[0];
        document.getElementById("file-status").innerText = `Selected file: ${file.name}`;
        document.getElementById("selected-file").files = fileInput.files;
    };
}

function encryptFile() {
    const fileInput = document.getElementById("file-input");
    if (!fileInput.files.length) {
        document.getElementById("file-status").innerText = "No file selected for encryption.";
        return;
    }
    const file = fileInput.files[0];
    const key = document.getElementById("key-input").value;
    const algorithm = document.getElementById("algorithm-spinner").value;
    const reader = new FileReader();
    reader.onload = function() {
        const plaintext = reader.result;
        let encryptedMessage = '';
        try {
            if (algorithm === 'AES') {
                if (key.length !== 16) throw new Error("Key must be 16 characters long for AES.");
                encryptedMessage = aesEncrypt(plaintext, key);
            } else if (algorithm === 'Caesar Cipher') {
                const shift = parseInt(key);
                encryptedMessage = caesarCipher(plaintext, shift);
            } else if (algorithm === 'Vigenère Cipher') {
                encryptedMessage = vigenereCipher(plaintext, key, true);
            }
            downloadFile(encryptedMessage, file.name + '.enc');
        } catch (error) {
            document.getElementById("file-status").innerText = `Error: ${error.message}`;
        }
    };
    reader.readAsText(file);
}

function decryptFile() {
    const fileInput = document.getElementById("file-input");
    if (!fileInput.files.length) {
        document.getElementById("file-status").innerText = "No file selected for decryption.";
        return;
    }
    const file = fileInput.files[0];
    const key = document.getElementById("key-input").value;
    const algorithm = document.getElementById("algorithm-spinner").value;
    const reader = new FileReader();
    reader.onload = function() {
        const encryptedText = reader.result;
        let decryptedMessage = '';
        try {
            if (algorithm === 'AES') {
                if (key.length !== 16) throw new Error("Key must be 16 characters long for AES.");
                decryptedMessage = aesDecrypt(encryptedText, key);
            } else if (algorithm === 'Caesar Cipher') {
                const shift = parseInt(key);
                decryptedMessage = caesarCipher(encryptedText, -shift);
            } else if (algorithm === 'Vigenère Cipher') {
                decryptedMessage = vigenereCipher(encryptedText, key, false);
            }
            downloadFile(decryptedMessage, file.name.replace('.enc', ''));
        } catch (error) {
            document.getElementById("file-status").innerText = `Error: ${error.message}`;
        }
    };
    reader.readAsText(file);
}

function downloadFile(content, fileName) {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
}

function aesEncrypt(plaintext, key) {
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(plaintext, CryptoJS.enc.Utf8.parse(key), {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    });
    return iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64);
}

function aesDecrypt(ciphertext, key) {
    const ciphertextBytes = CryptoJS.enc.Base64.parse(ciphertext);
    const iv = ciphertextBytes.clone();
    iv.sigBytes = 16;
    iv.clamp();
    const encryptedBytes = ciphertextBytes.clone();
    encryptedBytes.words.splice(0, 4);
    encryptedBytes.sigBytes -= 16;
    const decrypted = CryptoJS.AES.decrypt({ ciphertext: encryptedBytes }, CryptoJS.enc.Utf8.parse(key), {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}

function caesarCipher(text, shift) {
    return text.split('').map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
            return String.fromCharCode(((code - 65 + shift) % 26 + 26) % 26 + 65); // Uppercase letters
        } else if (code >= 97 && code <= 122) {
            return String.fromCharCode(((code - 97 + shift) % 26 + 26) % 26 + 97); // Lowercase letters
        } else {
            return char; // Non-alphabet characters remain the same
        }
    }).join('');
}

function vigenereCipher(text, key, encrypt = true) {
    const keyLength = key.length;
    const keyCodes = Array.from(key).map(char => char.charCodeAt(0) - (char.charCodeAt(0) >= 97 ? 97 : 65));
    return text.split('').map((char, index) => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
            const offset = encrypt ? keyCodes[index % keyLength] : -keyCodes[index % keyLength];
            return String.fromCharCode(((code - 65 + offset) % 26 + 26) % 26 + 65); // Uppercase letters
        } else if (code >= 97 && code <= 122) {
            const offset = encrypt ? keyCodes[index % keyLength] : -keyCodes[index % keyLength];
            return String.fromCharCode(((code - 97 + offset) % 26 + 26) % 26 + 97); // Lowercase letters
        } else {
            return char; // Non-alphabet characters remain the same
        }
    }).join('');
}
