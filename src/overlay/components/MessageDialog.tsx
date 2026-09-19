import clsx from 'clsx';
import Markdown from 'react-markdown';
import { ButtonWithText } from './ButtonWithText';

type DialogButton = {
    text: string;
    primary: boolean;
}

interface Props {
    title: string;
    content: string;
    imageSource: string;

    buttons: DialogButton[];

    onClick: (button: string) => void;
}

export function MessageDialog(props: Props) {
    return (
        <div className="pointer-events-auto w-full h-full bg-black/50 relative">
            {/* min-w-[20rem] keeps a nice baseline width, max-w-[90vw] prevents screen overflow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md border border-white/15 bg-gray-950 flex flex-col items-center gap-8 p-8 text-white w-max min-w-[20rem] max-w-[90vw]">
                
                {/* Image scales up to the container's width without expanding it */}
                <img 
                    src={props.imageSource} 
                    alt="Dialog Image" 
                    className="max-h-48 w-full object-contain rounded-md" 
                />

                {/* HEADING DRIVES THE WIDTH: whitespace-nowrap forces the parent to fit it */}
                <h3 className="font-bold text-4xl tracking-tight text-center px-2 whitespace-nowrap">
                    {props.title}
                </h3>

                {/* PARAGRAPH ADAPTS: w-0 min-w-full forces text wrapping within the parent's width */}
                <div className="text-gray-200 leading-relaxed text-center w-0 min-w-full">
                    <Markdown>{props.content}</Markdown>
                </div>

                <div className="w-full flex gap-2 justify-center items-center">
                    {props.buttons.map(btn => (
                        <ButtonWithText 
                            key={btn.text} 
                            text={btn.text} 
                            onClick={() => props.onClick(btn.text)} 
                            primary={btn.primary} 
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}