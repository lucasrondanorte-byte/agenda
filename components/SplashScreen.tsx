import React from 'react';

export const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-stone-100/90 backdrop-blur-sm flex justify-center items-center z-[200]">
      <style>{`
        @keyframes pulse-fade-in {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-pulse-fade-in {
          animation: pulse-fade-in 1.5s ease-in-out forwards;
        }
      `}</style>
      <img
        src="https://i.postimg.cc/YhvKDdRc/Logo-for-Conecta-Mente-Clean-Sans-Serif-Abstract-Design.png"
        alt="ConectaMente Logo"
        className="h-32 w-auto animate-pulse-fade-in rounded-full shadow-2xl"
      />
    </div>
  );
};