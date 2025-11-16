import { useEffect, useRef, useState } from "react";
import { RgbaColor, RgbaColorPicker, RgbColorPicker } from "react-colorful";
import tinycolor from "tinycolor2";

interface Props {
    name: string;
    value: string;
    onBlur?: (name: string, value: string) => void;
}

export function ColorEntry(props: Props) {
    const [pickerVisible, setPickerVisible] = useState(false);
    const [color, setColor] = useState<RgbaColor>({
        r: 255,
        g: 255,
        b: 255,
        a: 1,
    });
    const colorRef = useRef<RgbaColor>(color);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        colorRef.current = color;
    }, [color]);

    useEffect(() => {
        const tc = tinycolor(props.value);
        const rgba = tc.toRgb();
        setColor({ r: rgba.r, g: rgba.g, b: rgba.b, a: rgba.a });
    }, [props.value]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setPickerVisible(false);

                if (!props.onBlur) return;
                console.log("Set: ", color);
                props.onBlur(
                    props.name,
                    `rgba(${colorRef.current.r}, ${colorRef.current.g}, ${colorRef.current.b}, ${colorRef.current.a})`
                );
            }
        }

        if (pickerVisible) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [pickerVisible]);

    const buttonOnClick = () => {
        setPickerVisible(true);
    };

    return (
        <div
            className="w-full px-4 py-2 flex items-center gap-4 justify-between border-b border-black/10"
            ref={containerRef}
        >
            <span className="text-base">{props.name}</span>
            {!pickerVisible && (
                <button
                    className="w-6 h-6 rounded-md border border-black/10"
                    style={{ backgroundColor: props.value }}
                    onClick={buttonOnClick}
                ></button>
            )}
            {pickerVisible && (
                <RgbaColorPicker
                    color={color}
                    onChange={setColor}
                ></RgbaColorPicker>
            )}
        </div>
    );
}
