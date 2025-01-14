const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');
const tesseract = require('tesseract.js');
const path = require('path');

const app = express();
const port = 5000;

// Enable CORS and JSON body parsing
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Setup file upload middleware using multer
const upload = multer({ dest: 'uploads/' });

// Root route for testing server
app.get('/', (req, res) => {
    res.send('Welcome to the code runner server!');
});

// POST route to run code
app.post('/run-code', upload.single('file'), (req, res) => {
    const { code: inputCode, language } = req.body;
    const file = req.file;

    if (file) {
        // If an image is uploaded, use OCR to extract code
        tesseract.recognize(
            path.join(__dirname, file.path),
            'eng'
        )
        .then(({ data: { text } }) => {
            fs.unlinkSync(file.path); // Clean up uploaded file
            processCode(text.trim(), language, res); // Process the extracted code
        })
        .catch(err => {
            console.error('OCR Error:', err);
            fs.unlinkSync(file.path); // Clean up uploaded file
            res.status(500).json({ error: 'Error in OCR processing' });
        });
    } else if (inputCode) {
        processCode(inputCode, language, res); // Process the code directly
    } else {
        res.status(400).json({ error: 'No code or file provided.' });
    }
});

// Function to handle code compilation and execution
const processCode = (code, language, res) => {
    let tempFile = '';
    let compileCommand = '';
    let runCommand = '';
    const isWindows = process.platform === 'win32'; // Check if the system is Windows

    if (language === 'c') {
        tempFile = 'temp.c';
        compileCommand = `gcc ${tempFile} -o temp.exe`;
        runCommand = isWindows ? 'temp.exe' : './temp.exe';  // Use temp.exe directly on Windows
    } else if (language === 'cpp') {
        tempFile = 'temp.cpp';
        compileCommand = `g++ ${tempFile} -o temp.exe`;
        runCommand = isWindows ? 'temp.exe' : './temp.exe';  // Use temp.exe directly on Windows
    } else if (language === 'java') {
        tempFile = 'Temp.java';
        compileCommand = `javac ${tempFile}`;
        runCommand = 'java Temp';
    } else if (language === 'python') {
        tempFile = 'temp.py';
        runCommand = `python ${tempFile}`;
    } else {
        return res.status(400).json({ error: 'Unsupported language' });
    }

    fs.writeFileSync(tempFile, code); // Write code to temporary file

    // Compile the code
    if (compileCommand) {
        exec(compileCommand, (err, stdout, stderr) => {
            if (err || stderr) {
                cleanUp(tempFile);
                return res.status(500).json({ error: stderr || 'Compilation error' });
            }
            executeCode(runCommand, tempFile, res);
        });
    } else {
        executeCode(runCommand, tempFile, res);
    }
};

// Function to execute the code
const executeCode = (runCommand, tempFile, res) => {
    exec(runCommand, (err, stdout, stderr) => {
        cleanUp(tempFile);
        if (fs.existsSync('temp.exe')) fs.unlinkSync('temp.exe'); // Remove the compiled executable
        if (err || stderr) {
            return res.status(500).json({ error: stderr || 'Runtime error' });
        }
        res.json({ output: stdout });
    });
};

// Function to clean up temporary files
const cleanUp = (tempFile) => {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    if (fs.existsSync('temp.exe')) fs.unlinkSync('temp.exe');
};

// Catch-all for undefined routes
app.use((req, res) => {
    res.status(404).send('Route not found.');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});