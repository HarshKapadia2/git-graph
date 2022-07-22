import { inflateSync } from "browserify-zlib";
import { Buffer } from "buffer";

async function getObjectType(files = [], hash = "") {
	if (hash === "")
		throw new Error("Hash parameter for getObjectType() missing.");

	const filePath = ".git/objects/" + hash.slice(0, 2) + "/" + hash.slice(2);
	const fileContent = await getDecompressedFileBuffer(files, filePath);

	const objectType = fileContent.toString("utf-8").split(" ")[0];
	return objectType;
}

async function getAllBranches(fileObjects = []) {
	let allBranches = [];

	// Get branch names from the `.git/refs/heads` directory
	for (let i = 0; i < fileObjects.length; i++) {
		if (fileObjects[i].directoryHandle.name === "heads")
			allBranches.push(fileObjects[i].handle.name);
	}

	// Get branch names from packed refs if the `packed-refs` file exists
	let packedRefs = await readFile(fileObjects, ".git/packed-refs", "binary");
	if (packedRefs !== undefined) {
		packedRefs = packedRefs.split("\n");

		for (let i = 1; i < packedRefs.length; i++) {
			const refEntry = packedRefs[i].split(" ");

			if (refEntry[1]?.indexOf("refs/heads/") >= 0) {
				const index = refEntry[1].lastIndexOf("/");
				const branchName = refEntry[1].slice(index + 1);

				if (
					!allBranches.some(
						(branchInArr) => branchInArr === branchName
					)
				)
					allBranches.push(branchName);
			}
		}
	}

	if (allBranches.length === 0) throw new Error("Branches not found.");

	// Get current branch
	let currentBranch = await readFile(fileObjects, ".git/HEAD", "binary");
	currentBranch = currentBranch.slice(16, -1);

	return { currentBranch, allBranches };
}

async function getDecompressedFileBuffer(files = [], path = "") {
	let fileBuffer = await readFile(files, path, "buffer");

	if (fileBuffer === undefined) return undefined;

	fileBuffer = Buffer.from(new Uint8Array(fileBuffer));
	fileBuffer = inflateSync(fileBuffer);

	return fileBuffer;
}

async function readFile(files = [], path = "", readType = "") {
	return new Promise((resolve, reject) => {
		const readFile = new FileReader();

		readFile.addEventListener("error", () => reject());
		readFile.addEventListener("load", (event) =>
			resolve(event.target.result)
		);

		const fileArr = files.filter(
			(file) => file.webkitRelativePath === path
		);

		if (fileArr[0] === undefined) resolve(undefined);

		if (readType === "buffer") readFile.readAsArrayBuffer(fileArr[0]);
		else if (readType === "binary") readFile.readAsBinaryString(fileArr[0]);
	});
}

export { getObjectType, getAllBranches, getDecompressedFileBuffer, readFile };
