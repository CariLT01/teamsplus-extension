
interface Props {
    text: string;
    showTooltip: boolean
}

export function Tooltip(props: Props) {

    if (props.showTooltip == false) return null;

    return <div className="absolute px-2 py-1 bg-black border border-black/35 shadow-lg rounded-md z-99">
        <span className="text-xs text-white">{props.text}</span>
    </div>

}