
import React, { useState } from 'react';

interface SubscriptionManagerProps {
    generationLimit: number;
    setGenerationLimit: (limit: number) => void;
    generationCount: number;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ generationLimit, setGenerationLimit, generationCount }) => {
    const [coupon, setCoupon] = useState('');
    const [error, setError] = useState('');

    const handleActivate = () => {
        const upperCaseCoupon = coupon.trim().toUpperCase();
        switch (upperCaseCoupon) {
            case 'PAID30':
                setGenerationLimit(30);
                setError('');
                setCoupon('');
                break;
            case 'PAID80':
                setGenerationLimit(80);
                setError('');
                setCoupon('');
                break;
            case 'PAID99':
                setGenerationLimit(Infinity);
                setError('');
                setCoupon('');
                break;
            default:
                setError('Invalid coupon code. Please try again.');
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleActivate();
        }
    }

    if (generationLimit === Infinity) {
        return (
            <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-xl text-center mb-8 shadow-lg">
                <p><strong className="font-bold">Premium Plan:</strong> You have unlimited image generations!</p>
            </div>
        );
    }

    const remaining = generationLimit - generationCount;
    const isLimitReached = remaining <= 0;
    
    const planName = generationLimit > 5 
        ? `Paid Plan (${generationLimit})` 
        : 'Free Plan';

    return (
        <div className="bg-gray-800/60 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-700 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                    <h3 className="font-semibold text-lg text-white">{planName} Status</h3>
                    <p className={`text-sm ${isLimitReached ? 'text-red-400 font-semibold' : 'text-gray-400'}`}>
                        You have {Math.max(0, remaining)} / {generationLimit} generations remaining.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full sm:w-auto">
                     <input
                        type="text"
                        value={coupon}
                        onChange={(e) => {
                            setCoupon(e.target.value);
                            if(error) setError('');
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter Coupon Code"
                        className="bg-gray-900 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-auto transition-colors"
                        aria-label="Coupon Code Input"
                    />
                    <button
                        onClick={handleActivate}
                        className="w-full sm:w-auto bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                        disabled={!coupon.trim()}
                    >
                        Activate
                    </button>
                </div>
            </div>
            {error && <p className="text-red-400 text-sm w-full text-center mt-2">{error}</p>}
        </div>
    );
};

export default SubscriptionManager;