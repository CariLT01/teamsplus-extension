<<<<<<< HEAD
import { TeamsPlusInput } from "../../basic/TPInput";

interface Props {
    name: string;
    value: string;
    onBlur?: (name: string, value: string) => void;
}

export function formatTokenName(token: string): string {
    // remove leading dashes
    let stripped = token.replace(/^--/, "");

    // remove leading "color"
    stripped = stripped.replace(/^color/, "");

    // uppercase first letter
    const capitalized = stripped.charAt(0).toUpperCase() + stripped.slice(1);

    // split into words: uppercase boundaries + numbers
    const parts = capitalized.match(/[A-Z][a-z]*|[0-9]+/g);

    if (!parts) return capitalized;

    return parts.join(" ");
}

export function DesignEntry(props: Props) {

    const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (!props.onBlur) return;
        props.onBlur(props.name, e.target.value);
    }

    return <div className="w-full px-4 py-2 flex items-center justify-between gap-4 border-b border-black/10">
        <span className="text-base">{formatTokenName(props.name)}</span>
        <div className="w-[40%]">
            <TeamsPlusInput type="text" defaultValue={props.value} onBlur={onBlur}></TeamsPlusInput>
        </div>
        
    </div>
=======
import { TeamsPlusInput } from "../../basic/TPInput";

interface Props {
    name: string;
    value: string;
    onBlur?: (name: string, value: string) => void;
}

export function formatTokenName(token: string): string {
    // remove leading dashes
    let stripped = token.replace(/^--/, "");

    // remove leading "color"
    stripped = stripped.replace(/^color/, "");

    // uppercase first letter
    const capitalized = stripped.charAt(0).toUpperCase() + stripped.slice(1);

    // split into words: uppercase boundaries + numbers
    const parts = capitalized.match(/[A-Z][a-z]*|[0-9]+/g);

    if (!parts) return capitalized;

    return parts.join(" ");
}

export function DesignEntry(props: Props) {

    const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (!props.onBlur) return;
        props.onBlur(props.name, e.target.value);
    }

    return <div className="w-full px-4 py-2 flex items-center justify-between gap-4 border-b border-black/10">
        <span className="text-base">{formatTokenName(props.name)}</span>
        <div className="w-[40%]">
            <TeamsPlusInput type="text" defaultValue={props.value} onBlur={onBlur}></TeamsPlusInput>
        </div>
        
    </div>
>>>>>>> origin/main
}