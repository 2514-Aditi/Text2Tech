import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing
import Tesseract from 'tesseract.js';
import './ImageUpload.css';

function CSnap() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Hook to navigate programmatically

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setLoading(true);
            setError(null);

            // Run OCR on the uploaded image
            Tesseract.recognize(
                file,
                'eng',
                {
                    logger: (m) => console.log(m),
                }
            ).then(({ data: { text } }) => {
                setLoading(false);
                // Navigate to the Editor page and pass the extracted text
                navigate('/Editor', { state: { extractedText: text } });
            }).catch((err) => {
                setLoading(false);
                setError("Failed to extract text. Please try again.");
                console.error(err);
            });
        }
    };

    return (
        <div className="image-upload">
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {loading && <p>Extracting text...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default CSnap;