const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 5000;

// Enable CORS for all routes (before routes are defined)
app.use(cors()); // Ensure this is before the route definitions
app.use(bodyParser.json()); // To handle JSON request bodies

// Simple GET route to check if server is running
app.get('/', (req, res) => {
    res.send('Server is up and running!'); // Basic message to confirm server is working
});

// POST endpoint to run the code
app.post('/run-code', (req, res) => {
    const { code, language } = req.body;
    let runCommand = '';
    let compileCommand = '';
    let errorMessage = ''; // Initialize error message

    if (language === 'c') {
        const tempFile = 'temp.c';
        fs.writeFileSync(tempFile, code); // Write the code to a temp file
        compileCommand = `gcc ${tempFile} -o temp.exe`; // Compile the C code
        runCommand = 'temp.exe'; // Run the compiled executable
    } else if (language === 'cpp') {
        const tempFile = 'temp.cpp';
        fs.writeFileSync(tempFile, code); // Write the code to a temp file
        compileCommand = `g++ ${tempFile} -o temp.exe`; // Compile C++ code
        runCommand = 'temp.exe'; // Run the compiled executable
    } else {
        return res.status(400).json({ error: 'Unsupported language' }); // If unsupported language
    }

    // Compile the code first for C/C++
    if (language === 'c' || language === 'cpp') {
        exec(compileCommand, (err, stdout, stderr) => {
            if (err || stderr) {
                errorMessage = stderr || 'Compilation error'; // Set error if compilation fails
                return res.status(500).json({ error: errorMessage }); // Return compilation error to frontend
            }

            // If compilation is successful, run the code
            exec(runCommand, (err, stdout, stderr) => {
                if (err || stderr) {
                    errorMessage = stderr || 'Runtime error'; // Set runtime error if execution fails
                    return res.status(500).json({ error: errorMessage }); // Return runtime error to frontend
                }

                // Return output if successful
                res.json({ output: stdout });

                // Clean up temp files after execution
                fs.unlinkSync('temp.c'); // Delete temp C file
                fs.unlinkSync('temp.cpp'); // Delete temp C++ file
                fs.unlinkSync('temp.exe'); // Delete temp executable
            });
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
