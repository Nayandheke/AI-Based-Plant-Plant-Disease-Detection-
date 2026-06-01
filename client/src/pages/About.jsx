import React from 'react';

const About = () => {
    return (
        <div className="max-w-4xl mx-auto py-32 flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-8">
                <h1 className="text-3xl md:text-4xl font-medium text-gray-800 leading-relaxed max-w-3xl mx-auto">
                    <strong>KrishiSathi</strong>, meaning <strong>"Farmer's Friend,"</strong> is an end-to-end AI ecosystem designed 
                    to protect global food security by providing instant, expert-level plant pathology 
                    directly to anyone with a smartphone.
                </h1>
                <div className="w-24 h-1 bg-green-600 mx-auto rounded-full"></div>
            </div>
        </div>
    );
};

export default About;