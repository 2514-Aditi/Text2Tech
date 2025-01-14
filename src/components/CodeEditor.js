import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import './CodeEditor.css';

function CodeEditor() {
    const [code, setCode] = useState("");
    const [output, setOutput] = useState("");
    const [language, setLanguage] = useState("c");
    const [file, setFile] = useState(null); // File input for OCR image
    const location = useLocation();
    const { extractedText } = location.state || {};

    useEffect(() => {
        if (extractedText) {
            setCode(extractedText);
        }
    }, [extractedText]);

    const handleFileUpload = (event) => {
        setFile(event.target.files[0]); // Handle the uploaded file
    };

    const runCode = () => {
        const formData = new FormData();
        formData.append("code", code);
        formData.append("language", language);
        if (file) {
            formData.append("file", file);
        }

        fetch('http://localhost:5000/run-code', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.headers.get('Content-Type')?.includes('application/json')) {
                return response.json();
            } else {
                throw new Error('Invalid response from server');
            }
        })
        .then(data => {
            if (data.output) {
                setOutput(data.output);
            } else if (data.error) {
                setOutput(`Error: ${data.error}`);
            } else {
                setOutput('No output returned from server.');
            }
        })
        .catch(error => {
            console.error('Error running code:', error);
            setOutput(`Error: ${error.message}`);
        });
    };

    return (
        <div className="code-editor-container">
            <div className="editor-section">
                <h3>Input Code</h3>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="language-select">
                    <option value="c">C</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="python">Python</option>
                </select>
                

                <MonacoEditor
                    height="300px"
                    language={language}
                    value={code}
                    onChange={(newCode) => setCode(newCode)}
                />
                <button onClick={runCode}>Run</button>
            </div>

            <div className="output-section">
                <h3>Output</h3>
                <div className="output">{output}</div>
            </div>
        </div>
    );
}

export default CodeEditor;