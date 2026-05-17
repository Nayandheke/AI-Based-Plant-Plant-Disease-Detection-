import React from 'react';
import { Leaf, ShieldCheck, Zap, Users } from 'lucide-react';

const About = () => {
    const features = [
        {
            icon: <Leaf className="w-10 h-10 text-green-600" />,
            title: "Our Mission",
            description: "To reduce crop loss and promote sustainable farming practices through accessible AI tools."
        },
        {
            icon: <ShieldCheck className="w-10 h-10 text-green-600" />,
            title: "Reliable Diagnosis",
            description: "Trained on thousands of leaf images, our model provides high-accuracy disease identification."
        },
        {
            icon: <Zap className="w-10 h-10 text-green-600" />,
            title: "Instant Results",
            description: "Get identification and professional remedies in seconds, directly from your browser."
        },
        {
            icon: <Users className="w-10 h-10 text-green-600" />,
            title: "Community First",
            description: "Built for everyone—from home gardeners to commercial farmers—without any registration required."
        }
    ];

    return (
        <div className="max-w-5xl mx-auto py-12 space-y-20">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold text-green-900 tracking-tight">About KrishiSathi</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Empowering farmers and gardeners with cutting-edge AI technology to detect plant diseases early and effectively.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                    <div key={index} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
                        <div className="bg-green-50 p-4 rounded-2xl">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                        <p className="text-gray-600 leading-relaxed">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>

            <div className="bg-green-700 rounded-[3rem] p-12 md:p-16 text-center text-white space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-green-600 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-green-800 rounded-full blur-3xl opacity-50"></div>
                
                <h2 className="text-3xl font-bold relative z-10">Support the Project</h2>
                <p className="text-green-50 text-lg max-w-2xl mx-auto leading-relaxed relative z-10">
                    KrishiSathi is a public initiative to help agriculture. Spread the word or suggest improvements to help us grow better!
                </p>
                <div className="pt-4 relative z-10">
                    <button className="bg-white text-green-700 font-bold py-4 px-10 rounded-2xl hover:bg-green-50 transition-colors shadow-lg">
                        Get Involved
                    </button>
                </div>
            </div>
        </div>
    );
};

export default About;
