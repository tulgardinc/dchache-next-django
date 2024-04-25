type File = {
    name: string;
    is_dir: boolean;
};

function DirContent(props: {
    file: File;
    click: Function;
    is_up: boolean;
    delete: Function;
}) {
    const getClassNames = () => {
        const c = "hover:cursor-pointer text-blue-500 ";
        const addition = props.file.is_dir ? "font-bold" : "";
        return c + addition;
    };

    const getText = () => {
        if (props.is_up) {
            return "../";
        } else if (props.file.is_dir) {
            return props.file.name + "/";
        } else {
            return props.file.name;
        }
    };

    return (
        <div className="flex justify-between rounded hover:bg-slate-100 px-2 box-border">
            <div
                className={getClassNames()}
                onClick={() => props.click(props.file)}
            >
                {getText()}
            </div>
            {!props.is_up && (
                <button
                    onClick={() => props.delete(props.file)}
                    className="text-red-500"
                >
                    Delete
                </button>
            )}
        </div>
    );
}

export default DirContent;
