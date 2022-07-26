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

async function getHeadCommit(files = [], branchName) {
	let head = await readFile(files, `.git/refs/heads/${branchName}`, "binary");

	if (head === undefined)
		head = await getHeadCommitFromPackedRefs(files, branchName);
	else head = head.slice(0, -1);

	return head;
}

async function getHeadCommitFromPackedRefs(files = [], branchName) {
	let packedRefs = await readFile(files, ".git/packed-refs", "binary");
	packedRefs = packedRefs.split("\n");

	for (let i = 1; i < packedRefs.length; i++) {
		const refEntry = packedRefs[i].split(" ");

		if (refEntry[1] === `refs/heads/${branchName}`) return refEntry[0];
	}

	return "";
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

export {
	getObjectType,
	getHeadCommit,
	getHeadCommitFromPackedRefs,
	getDecompressedFileBuffer,
	readFile
};
