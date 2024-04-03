export async function fetchType<T>(
	url: string,
	type: "json" | "text",
): Promise<T> {
	const response = await fetch(url);
	if (!response.ok) throw Error("Error fetching the URL");
	return await response[type]();
}
