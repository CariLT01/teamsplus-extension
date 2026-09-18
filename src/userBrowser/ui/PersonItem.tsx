
interface Props {
    name: string;
    email: string;
}

export function PersonItem(props: Props) {
    return <div className="flex gap-2 items-center px-4 py-2 w-full border-b border-black/15 hover:bg-black/5">
        <div className="flex flex-col gap-1">
            <h3 className="text-3xl font-bold text-black">{props.name}</h3>
            <span className="text-black/50">{props.email}</span>
        </div>
    </div>
}