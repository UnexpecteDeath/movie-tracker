export const classNames = (
    cls: string,
    mods: Record<string, boolean> = {},
    additional: string[] = [],
) => {
    return [
        cls,
        ...additional.filter(Boolean),
        ...Object.entries(mods)
            .filter((entry) => Boolean(entry[1]))
            .map(([className]) => className),
    ].join(" ");
};
