
interface Props {
    name: string;
    value: string;
    onBlur?: (name: string, value: string) => void;
}

export function ColorEntry(props: Props) {

    const onBlurHandler = (e: React.FocusEvent<HTMLInputElement>) => {
        if (!props.onBlur) return;
        props.onBlur(props.name, e.target.value);
    }

    return <div className="w-full px-4 py-2 flex items-center gap-4 justify-between border-b border-black/10">
        <span className="text-base">{props.name}</span>
        <input type="color" defaultValue={props.value} className="w-6 h-6 rounded-md border border-black/10" onBlur={onBlurHandler}></input>
    </div>
}