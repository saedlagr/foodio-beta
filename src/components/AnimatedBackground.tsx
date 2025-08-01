export const AnimatedBackground = () => {
  return (
    <>
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] via-[#1A1A1A] to-[#333333]"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-[#00CFCF] rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-[#7ED321] rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-[#00CFCF] rounded-full blur-md animate-bounce delay-500"></div>
      </div>
    </>
  );
};