
interface Props {
    name: string;
    value: string;
    onBlur?: (name: string, value: string) => void;
}

export function DesignEntry(props: Props) {

    const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (!props.onBlur) return;
        props.onBlur(props.name, e.target.value);
    }

    return <div className="w-full px-4 py-2 flex items-center justify-between gap-4">
        <span className="text-base">{props.name}</span>
        <input type="text" defaultValue={props.value} className="px-2 h-full py-1 w-[40%] rounded-md border border-black/35 focus:outline-none focus:border-black/50 transition-colors duration-300" onBlur={onBlur}></input>
    </div>
}