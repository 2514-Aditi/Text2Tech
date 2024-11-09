import React, { useState, useEffect } from 'react'; // Ensure correct imports
import { useLocation } from 'react-router-dom'; // Import useLocation for state
import { Editor as MonacoEditor } from '@monaco-editor/react'; // Rename MonacoEditor import to avoid conflict
import './CodeEditor.css';

// Component to edit and run code
function CodeEditor() {
    const [code, setCode] = useState(""); // State to hold code
    const [output, setOutput] = useState(""); // State to hold output
    const [language, setLanguage] = useState("C++"); // State to hold selected language
    const location = useLocation(); // Use location to fetch the extracted code
    const { extractedText } = location.state || {}; // Get extracted text passed via location.state

    // Update the code state when extracted text changes
    useEffect(() => {
        if (extractedText) {
            setCode(extractedText); // Set the extracted code as initial value
        }
    }, [extractedText]);

    // Handle running the code
    const runCode = () => {
        console.log('Running code:', code);
        console.log('Selected language:', language);
        
        // Post the code to the backend for execution (adjust backend URL if necessary)
        fetch('http://localhost:5000/run-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code, language: language })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Server error: ' + response.statusText); // Handle HTTP errors
            }
            return response.json();
        })
        .then(data => {
            if (data.output) {
                setOutput(data.output); // Display the output from the backend
            } else if (data.error) {
                setOutput(data.error); // Show backend errors (e.g., compilation/runtime errors)
            } else {
                setOutput('No output returned from server');
            }
        })
        .catch(error => {
            console.error('Error running code:', error); // Log error details
            setOutput("Error: " + error.message); // Show error message if request fails
        });
    };

    return (
        <div className="code-editor-container">
            <div className="editor-section">
                <h3>Input Code</h3>
                {/* Language Selection Dropdown */}
                <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)} 
                    className="language-select"
                >
                    <option value="c">C</option>
                    <option value="cpp">C++</option>
                </select>

                {/* Monaco Editor for code editing */}
                <MonacoEditor
                    height="300px" // Set the height of the editor
                    language={language} // Set the language based on selected language
                    value={code} // Set the code to be displayed in the editor
                    onChange={(newCode) => setCode(newCode)} // Update code state when editor content changes
                />
                <button onClick={runCode}>Run</button> {/* Run button */}
            </div>

            <div className="output-section">
                <h3>Output</h3>
                {/* Display the output of the code */}
                <div className="output">
                    {output} {/* Display output or error message */}
                </div>
            </div>
        </div>
    );
}

export default CodeEditor;
