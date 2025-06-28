import { useNavigate } from 'react-router-dom';

const Cancel = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-100">
            <h1 className="text-3xl font-bold text-red-700">Payment Canceled ❌</h1>
            <p className="mt-2 text-lg">Your payment was not completed. You can try again.</p>
            <button
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                onClick={() => navigate('/')}
            >
                Go to Home
            </button>
        </div>
    );
};

export default Cancel;
