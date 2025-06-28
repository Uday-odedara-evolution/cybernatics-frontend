import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Success = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // You can add logic to fetch order details if needed
        console.log('Payment successful!');
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-green-100">
            <h1 className="text-3xl font-bold text-green-700">Payment Successful! ✅</h1>
            <p className="mt-2 text-lg">Thank you for your purchase.</p>
            <button
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                onClick={() => navigate('/')}
            >
                Go to Home
            </button>
        </div>
    );
};

export default Success;
