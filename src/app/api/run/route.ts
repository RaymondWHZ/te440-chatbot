import { unlinkSync, writeFileSync } from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import { randomUUID } from "crypto";

const execPromise = promisify(exec);

export async function POST(req: Request) {
	const { code } = await req.json();

	const id = randomUUID();
	const fileName = `code-${id}.py`;

	try {
		writeFileSync(fileName, code);

		const command = "python " + fileName;
		const { stdout } = await execPromise(command);

		return Response.json({ output: stdout });
	} catch (e) {
		if (e instanceof Error) {
			return Response.json({ output: e.message });
		}
		return Response.json({ output: "Error" });
	} finally {
		unlinkSync(fileName);
	}
}