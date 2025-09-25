import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { PIN_LENGTH } from '../constants';

interface LoginScreenProps {
    users: User[];
    onLoginSuccess: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLoginSuccess }) => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [pin, setPin] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isShaking, setIsShaking] = useState(false);

    useEffect(() => {
        if (pin.length === PIN_LENGTH && selectedUser) {
            if (pin === selectedUser.pin) {
                setError(null);
                onLoginSuccess(selectedUser);
            } else {
                setError('Incorrect PIN. Please try again.');
                setPin('');
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 500); // Duration of the shake animation
            }
        }
    }, [pin, selectedUser, onLoginSuccess]);

    const handlePinButtonClick = (value: string) => {
        if (pin.length < PIN_LENGTH) {
            setPin(pin + value);
        }
    };
    
    const handleDeleteClick = () => {
        setPin(pin.slice(0, -1));
    };

    const handleUserSelect = (user: User) => {
        setSelectedUser(user);
        setPin('');
        setError(null);
    };

    const handleBackClick = () => {
        setSelectedUser(null);
        setPin('');
        setError(null);
    };

    const PinDisplay: React.FC = () => (
        <div className={`flex justify-center gap-4 my-6 ${isShaking ? 'animate-shake' : ''}`}>
            {Array.from({ length: PIN_LENGTH }).map((_, index) => (
                <div key={index} className={`w-4 h-4 rounded-full transition-colors ${index < pin.length ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
            ))}
        </div>
    );
    
    const Keypad: React.FC = () => {
        const buttons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0'];
        return (
            <div className="grid grid-cols-3 gap-4">
                {buttons.map((btn) => (
                    btn ? <button key={btn} onClick={() => handlePinButtonClick(btn)} className="text-3xl font-semibold p-4 rounded-full bg-slate-200/50 dark:bg-slate-700/50 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">{btn}</button> : <div key="placeholder"></div>
                ))}
                <button onClick={handleDeleteClick} className="flex items-center justify-center p-4 rounded-full bg-slate-200/50 dark:bg-slate-700/50 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H16a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                </button>
            </div>
        )
    };
    
    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col justify-center items-center p-4">
            <style>{`.animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; } @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }`}</style>
            <div className="w-full max-w-sm text-center">
                 <div className="flex items-center justify-center gap-3 mb-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 6V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H2v13c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6h-6zm-6-2h4v2h-4V4zM4 8h16v11H4V8zm3 2v6h2V10H7zm4 0v6h2V10h-2zm4 0v6h2V10h-2z"/>
                    </svg>
                    <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">Yazh Shop</h1>
                </div>

                {selectedUser ? (
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl">
                        <button onClick={handleBackClick} className="absolute top-4 left-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-4xl text-indigo-600 dark:text-indigo-400 mx-auto">
                            {selectedUser.name.charAt(0)}
                        </div>
                        <h2 className="text-2xl font-bold mt-4 text-slate-800 dark:text-slate-100">{selectedUser.name}</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-2">Enter your {PIN_LENGTH}-digit PIN</p>
                        
                        <PinDisplay />
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        
                        <Keypad />
                    </div>
                ) : (
                    <div>
                        <h2 className="text-2xl font-semibold mb-6 text-slate-700 dark:text-slate-300">Who's checking in?</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {users.map(user => (
                                <button key={user.id} onClick={() => handleUserSelect(user)} className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all">
                                    <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-3xl text-indigo-600 dark:text-indigo-400">
                                        {user.name.charAt(0)}
                                    </div>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">{user.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginScreen;