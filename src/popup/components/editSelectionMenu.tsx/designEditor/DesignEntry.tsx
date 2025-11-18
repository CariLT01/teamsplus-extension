
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
        <input type="text" defaultValue={props.value} className="px-2 h-full py-1 w-[40%] rounded-md border border-black/35 focus:outline-none focus:border-black/50 transition-colors duration-300" onBlur={onBlur}></input>
    </div>
}