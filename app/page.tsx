'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'mr-IN';

        recognitionRef.current.onresult = async (event: any) => {
          const speechToText = event.results[0][0].transcript;
          setTranscript(speechToText);
          await sendMessage(speechToText);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript('');
        setResponse('');
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const sendMessage = async (text: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      if (data.reply) {
        setResponse(data.reply);
        speak(data.reply);
      }
    } catch (error) {
      console.error('Error:', error);
      setResponse('काहीतरी चूक झाली.');
    } finally {
      setIsProcessing(false);
    }
  };

  const speak = (text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'mr-IN';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-orange-600 mb-3">श्री</h1>
          <p className="text-gray-600 text-lg">तुझा वैयक्तिक मराठी व्हॉइस असिस्टंट</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
          {/* Voice Button */}
          <div className="flex justify-center">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing || isSpeaking}
              className={`w-32 h-32 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : isProcessing || isSpeaking
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              <div className="flex flex-col items-center justify-center text-white">
                {isListening ? (
                  <>
                    <svg className="w-12 h-12 mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-semibold">ऐकतोय</span>
                  </>
                ) : (
                  <>
                    <svg className="w-12 h-12 mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-semibold">बोला</span>
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Stop Speaking Button */}
          {isSpeaking && (
            <div className="flex justify-center">
              <button
                onClick={stopSpeaking}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors"
              >
                बोलणे थांबवा
              </button>
            </div>
          )}

          {/* Status */}
          <div className="text-center">
            {isProcessing && (
              <p className="text-orange-600 font-medium animate-pulse">प्रक्रिया सुरू आहे...</p>
            )}
            {isSpeaking && (
              <p className="text-green-600 font-medium">बोलतोय...</p>
            )}
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="bg-orange-50 rounded-2xl p-6 border-2 border-orange-200">
              <p className="text-sm text-orange-700 font-semibold mb-2">तू:</p>
              <p className="text-gray-800 text-lg">{transcript}</p>
            </div>
          )}

          {/* Response */}
          {response && (
            <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
              <p className="text-sm text-blue-700 font-semibold mb-2">श्री:</p>
              <p className="text-gray-800 text-lg">{response}</p>
            </div>
          )}

          {/* Instructions */}
          {!transcript && !response && (
            <div className="text-center text-gray-500 py-8">
              <p className="text-lg mb-4">🎤 माईक बटण दाबा आणि मराठीत बोला</p>
              <div className="space-y-2 text-sm">
                <p>✨ प्रेरणा आणि मार्गदर्शनासाठी विचारा</p>
                <p>💰 संपत्ती निर्माणाबद्दल शिका</p>
                <p>🎯 चांगल्या सवयी निर्माण करा</p>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Chrome किंवा Edge browser वापरा
        </p>
      </div>
    </main>
  );
}
