import React from 'react';
import './Home.css'; // Import Home-specific CSS for styling
import side from '../assets/side.png';

function Home() {
    return (
        <div className="home">
            <div className="content">
                <div className="text-side">
                    <h1>Turn Your Scribbles into Solutions!!</h1>
                </div>
                <div className="image-side">
                    <img src={side} alt="Tech Illustration" className="home-image" />
                </div>
            </div>
        </div>
    );
}

export default Home;
