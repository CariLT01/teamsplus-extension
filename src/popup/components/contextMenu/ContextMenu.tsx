import clsx from "clsx";
import { useContextMenuStore } from "../../store/ContextMenuStore";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export function ContextMenu() {
  const positionX = useContextMenuStore((s) => s.positionX);
  const positionY = useContextMenuStore((s) => s.positionY);
  const options = useContextMenuStore((s) => s.options);
  const visible = useContextMenuStore((s) => s.visible);
  const setVisible = useContextMenuStore((s) => s.setVisible);
  const containerRef = useRef<HTMLDivElement>(null);

  const [clampedPos, setClampedPos] = useState({ x: positionX, y: positionY });

  // Hide menu on click outside
  useEffect(() => {
    if (!visible) return;

    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (!containerRef.current || !containerRef.current.contains(target)) {
        setVisible(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [visible, setVisible]);

  // Clamp menu position to viewport
  useLayoutEffect(() => {
    if (!visible || !containerRef.current) return;

    const menu = containerRef.current;
    const { innerWidth, innerHeight } = window;

    const menuRect = menu.getBoundingClientRect();
    let x = positionX;
    let y = positionY;

    if (x + menuRect.width > innerWidth) {
      x = innerWidth - menuRect.width - 16; // 8px margin
    }
    if (y + menuRect.height > innerHeight) {
      y = innerHeight - menuRect.height - 16; // 8px margin
    }

    setClampedPos({ x: Math.max(0, x), y: Math.max(0, y) });
  }, [positionX, positionY, visible, options]);

  if (!visible) return null;

  const contextmenuClasses = clsx(
    "fixed",
    "bg-white rounded-md shadow-lg border border-black/35 flex flex-col animate-fadeIn"
  );

  return (
    <div
      className={contextmenuClasses}
      ref={containerRef}
      style={{ top: clampedPos.y, left: clampedPos.x }}
    >
      {options.map((option, index) => (
        <button
          key={index}
          className="flex gap-4 border-b border-black/10 py-2 px-2 bg-transparent hover:bg-black/10 transition-colors duration-300 cursor-pointer"
          onClick={() => {
            setVisible(false);
            option.callback();
          }}
        >
          <div>{option.icon}</div>
          <span className="text-base">{option.text}</span>
        </button>
      ))}
    </div>
  );
}