interface DropdownOptions {
    label: string
    options: {
        value: string,
        label: string
    }[],
    active: boolean,
    current: string,
    onSelect: (option: string) => void,
    style: "primary"|"secondary"|"danger"|"success"|"warning"|"info"|"light"|"dark"|"outline-primary"|"outline-secondary"|"outline-danger"|"outline-success"|"outline-warning"|"outline-info"|"outline-light"|"outline-dark",
    large?: boolean
}

export default function Dropdown(options: DropdownOptions) {

    const selectOption = (option: any) => {
        options.onSelect(option);
    };

    return (
        <div className="dropdown hoverable">
            <button className={`btn btn-sm text-uppercase btn-${options.style} border-0 ${options.active ? "active" : ""} ${options.large ? "px-5" : ""}`} type="button" data-bs-toggle="dropdown" aria-expanded="false">
                {options.label}
            </button>
            <ul className="dropdown-menu shadow">
                {options.options.map((option, index) => (
                    <li key={index}>
                        <button className={`dropdown-item text-uppercase small ${options.current == option.value ? "active" : ""}`} type="button" onClick={() => selectOption(option.value)}>
                            {option.label}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
