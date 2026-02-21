import React, { useState, useRef, useEffect } from 'react';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ 
  onSearch, 
  placeholder = "Cerca...", 
  className = "" 
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); 
        inputRef.current?.focus();
      }
      
      if (e.key === 'Escape') {
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setQuery(newVal);
    if (onSearch) onSearch(newVal);
  };

  const handleClear = () => {
    setQuery("");
    if (onSearch) onSearch("");
    inputRef.current?.focus();
  };

  return (
    <div 
      className={`
        group relative flex items-center w-full max-w-md
        transition-all duration-300 ease-out
        ${isFocused ? 'scale-[1.01]' : 'scale-100'}
        ${className}
      `}
    >
      <div className="absolute left-3 flex items-center pointer-events-none z-10">
        <svg 
          className={`
            h-4 w-4 transition-colors duration-300
            ${isFocused ? 'text-[#FF6900]' : 'text-white/30 group-hover:text-white/50'}
          `} 
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>


      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          block w-full py-2.5 pl-10 pr-10
          bg-[#1A1A1A] hover:bg-[#252525]
          border border-transparent
          rounded-xl
          text-sm text-white placeholder-white/30 font-medium
          transition-all duration-200
          

          focus:outline-none 
          focus:bg-[#0A0A0A]
          focus:ring-1 focus:ring-white/10
          focus:border-white/10
          focus:placeholder-white/20
          

          ${isFocused ? 'shadow-lg shadow-black/20' : ''}
        `}
        placeholder={placeholder}
      />


      <div className="absolute right-3 flex items-center">
        {query.length > 0 ? (
          
          <button
            onClick={handleClear}
            className="
              p-0.5 rounded-full 
              text-white/30 hover:text-white hover:bg-white/10 
              transition-all duration-200
              animate-in fade-in zoom-in
            "
            aria-label="Cancella ricerca"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : (
          
          <div 
            className={`
              flex items-center gap-1 pointer-events-none transition-opacity duration-200
              ${isFocused ? 'opacity-0' : 'opacity-100'}
            `}
          >
            <kbd className="
              hidden sm:inline-flex items-center h-5 px-1.5 
              rounded-sm border border-white/10 bg-white/5 
              font-sans text-[10px] font-bold text-white/30
            ">
              <span className="text-[10px]">⌘</span> K
            </kbd>
          </div>
        )}
      </div>
    </div>
  );
}