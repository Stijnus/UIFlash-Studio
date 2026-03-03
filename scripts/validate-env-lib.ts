export const getMissingKeys = (example: string, actual: string): string[] => {
    const parseKeys = (content: string) => {
        return content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'))
            .map(line => line.split('=')[0].trim());
    };

    const exampleKeys = parseKeys(example);
    const actualKeys = new Set(parseKeys(actual));

    return exampleKeys.filter(key => !actualKeys.has(key));
};
