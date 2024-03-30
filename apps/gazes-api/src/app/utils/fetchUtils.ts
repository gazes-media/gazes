export async function fetchType<T>(url: string, type: 'json' | 'text'): Promise<T> {
    try {
        const res = await fetch(url);
        if (!res.ok) throw Error('Error fetching the url');
        return await res[type]();
    } catch (err) {
        console.error(err);
        return undefined;
    }
}
