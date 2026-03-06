import React, { useState } from 'react';

export default function TestCreateStore() {
    const [showModal, setShowModal] = useState(false);
    const [clicked, setClicked] = useState(false);

    const handleButtonClick = () => {
        console.log('Test button clicked!');
        setClicked(true);
        setShowModal(true);
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Test Create Store</h1>
            
            <button
                onClick={handleButtonClick}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
                Create New Store (Test)
            </button>

            {clicked && (
                <p className="mt-4 text-green-600">Button was clicked! Modal should show.</p>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg max-w-md">
                        <h2 className="text-xl font-bold mb-4">Test Modal</h2>
                        <p>This is a test modal to verify the create store functionality works.</p>
                        <button
                            onClick={() => setShowModal(false)}
                            className="mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
