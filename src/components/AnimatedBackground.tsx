export const AnimatedBackground = () => {
  return (
    <>
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#0F0F0F] to-[#1A1A1A]"></div>
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-cyan-500/20 to-teal-500/20 animate-pulse"></div>
      </div>
      
      {/* Sophisticated animated orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large floating orb */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse float-animation"></div>
        
        {/* Medium floating orb */}
        <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-full blur-2xl animate-pulse float-animation delay-1000"></div>
        
        {/* Small accent orb */}
        <div className="absolute bottom-1/4 left-2/3 w-32 h-32 bg-gradient-to-r from-teal-500/30 to-blue-500/30 rounded-full blur-xl animate-pulse float-animation delay-2000"></div>
        
        {/* Micro accent dots */}
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-cyan-400 rounded-full glow-animation"></div>
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-blue-400 rounded-full glow-animation delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-teal-400 rounded-full glow-animation delay-500"></div>
      </div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      {/* Edge glow effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-500/10 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyan-500/10 to-transparent"></div>
        <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-teal-500/10 to-transparent"></div>
        <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-blue-500/10 to-transparent"></div>
      </div>
    </>
  );
};