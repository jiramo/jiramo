
interface CardProps {
  title: string;
  subtitle: string;
  tags: string[];
  statusLabel?: string; 
  active?: boolean;     
  onClick?: () => void;
  className?: string;   
}

export default function Card({
  title,
  subtitle,
  tags,
  statusLabel = "New Issue",
  onClick,
  className = "",
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        group relative flex flex-col items-center
        w-full 
        p-0.75 pb-1 gap-1
        rounded-[19px]
        
        bg-[#251818]
        border border-[#FF0000]/20
        cursor-pointer 
        
        ${className}
      `}
    >
      <div
        className="
          flex flex-col items-start justify-center
          w-full
          px-5 py-4
          gap-3
          bg-[#0A0A0A]
          rounded-2xl
          shadow-sm shadow-black/40
          border border-white/5
        "
      >
        <div className="flex flex-col items-start gap-0.5 w-full">
          <h3 className="w-full truncate font-medium leading-6 text-[#DEDEDE] group-hover:text-white transition-colors">
            {title}
          </h3>
          <p className="w-full truncate text-[#DEDEDE]/60">
            {subtitle}
          </p>
        </div>


        <div className="flex flex-wrap items-center gap-1.5 w-full">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="
                flex items-center justify-center 
                px-2 py-0.5 
                bg-[#191919] border border-white/5
                rounded-md
              "
            >
              <span className="text-[#DEDEDE]/80 text-xs">
                {tag}
              </span>
            </div>
          ))}
        </div>
      </div>


      {statusLabel && (
        <span 
          className="
            mt-0.5
            font-medium text-[9px] leading-2.75 uppercase tracking-wider
            text-[#BBBBBB] group-hover:text-white transition-colors
          "
        >
          {statusLabel}
        </span>
      )}
    </div>
  );
}