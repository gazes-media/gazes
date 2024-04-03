import { app } from "@/app";

const { ADDRESS = "0.0.0.0", PORT = "3000" } = Bun.env;

app.listen({ port: Number.parseInt(PORT, 10), host: ADDRESS }, (error) => {
	if (error) {
		console.error(error);
		process.exit(1);
	}
});
