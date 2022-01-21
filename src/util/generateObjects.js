import { inflateSync } from "browserify-zlib";
import { Buffer } from "buffer";

let FILE_ARR = [];
let OBJECT_ARR = [];
let RECURSED_DATA = {};

async function getObjects(fileObjects) {
	FILE_ARR = fileObjects;
	const head = await getHead();
	let commit = head;
	let parentCommit = "";
	let tree = "";

	// await recurseCommits(head);

	do {
		const commitFilePath =
			".git/objects/" + commit.slice(0, 2) + "/" + commit.slice(2);

		let commitContent = await getDecompressedFileBuffer(commitFilePath);
		commitContent = commitContent.toString("utf-8").split("\n");

		const treeArr = commitContent[0].split(" ");
		tree = treeArr[2];

		const blobs = await getBlobs(tree);

		const parentCommitArr = commitContent[1].split(" ");
		if (parentCommitArr[0] === "parent") parentCommit = parentCommitArr[1];
		else parentCommit = "";

		OBJECT_ARR.push({ commit, commitMsg: "", parentCommit, tree, blobs });

		commit = parentCommit;
	} while (parentCommit !== "");

	const objectData = { objects: OBJECT_ARR, recursiveTrees: RECURSED_DATA };

	FILE_ARR = [];
	OBJECT_ARR = [];
	RECURSED_DATA = {};

	return objectData;
}

// async function recurseCommits(startCommit = "") {
// 	let commit = startCommit;
// 	let parentCommits = [];
// 	let tree = "";

// 	do {
// 		const commitFilePath =
// 			".git/objects/" + commit.slice(0, 2) + "/" + commit.slice(2);

// 		let commitContent = await getDecompressedFileBuffer(commitFilePath);
// 		commitContent = commitContent.toString("utf-8").split("\n");

// 		const treeArr = commitContent[0].split(" ");
// 		tree = treeArr[2];

// 		const blobs = await getBlobs(tree);

// 		parentCommits = [];
// 		let parentCommitArr = commitContent[1].split(" ");
// 		if (parentCommitArr[0] === "parent")
// 			parentCommits.push(parentCommitArr[1]);
// 		else parentCommits[0] = "";

// 		parentCommitArr = commitContent[2].split(" ");
// 		if (parentCommitArr[0] === "parent") {
// 			parentCommits.push(parentCommitArr[1]);
// 			OBJECT_ARR.push({
// 				commit,
// 				commitMsg: "",
// 				parentCommits,
// 				tree,
// 				blobs
// 			});
// 			await recurseCommits(parentCommitArr[1]);
// 		} else
// 			OBJECT_ARR.push({
// 				commit,
// 				commitMsg: "",
// 				parentCommits,
// 				tree,
// 				blobs
// 			});

// 		commit = parentCommits[0];
// 	} while (parentCommits[0] !== "" && !isCommitInObjArr(commit));
// }

async function getBlobs(treeHash = "") {
	if (treeHash === "") throw new Error("Tree hash parameter missing.");

	const treeFilePath =
		".git/objects/" + treeHash.slice(0, 2) + "/" + treeHash.slice(2);
	const treeContent = await getDecompressedFileBuffer(treeFilePath);

	let index = treeContent.indexOf("\0");
	let [type, length] = treeContent.toString("utf-8", 0, index).split(" ");
	length = parseInt(length);
	let blobArr = [];

	for (let nullIndex = index; nullIndex < length; index = nullIndex) {
		nullIndex = treeContent.indexOf("\0", index + 1);

		let [mode, name] = treeContent
			.toString("utf-8", index, nullIndex)
			.split(" ");

		nullIndex++;

		const hash = treeContent.toString("hex", nullIndex, (nullIndex += 20)); // '20' since the SHA1 hash is 20 bytes (40 hexadecimal characters per SHA1 hash)

		const objectType = await getObjectType(hash);

		blobArr.push({ type: objectType, name, hash });

		if (objectType === "tree") {
			const newData = await getBlobs(hash);
			RECURSED_DATA[hash] = newData;
		}
	}

	return blobArr;
}

async function getHead() {
	let headRef = await readFile(".git/HEAD", "binary");
	headRef = headRef.slice(5, -1);

	let head = await readFile(`.git/${headRef}`, "binary");
	head = head.slice(0, -1);

	return head;
}

async function getObjectType(hash = "") {
	if (hash === "")
		throw new Error("Hash parameter for getObjectType() missing.");

	const filePath = ".git/objects/" + hash.slice(0, 2) + "/" + hash.slice(2);
	const fileContent = await getDecompressedFileBuffer(filePath);

	const objectType = fileContent.toString("utf-8").split(" ")[0];
	return objectType;
}

async function getDecompressedFileBuffer(path = "") {
	let fileBuffer = await readFile(path, "buffer");
	fileBuffer = Buffer.from(new Uint8Array(fileBuffer));

	fileBuffer = inflateSync(fileBuffer);

	return fileBuffer;
}

async function readFile(path = "", readType = "") {
	return new Promise((resolve, reject) => {
		const readFile = new FileReader();

		readFile.addEventListener("error", () => reject());
		readFile.addEventListener("load", (event) =>
			resolve(event.target.result)
		);

		const fileArr = FILE_ARR.filter(
			(file) => file.webkitRelativePath === path
		);

		if (readType === "buffer") readFile.readAsArrayBuffer(fileArr[0]);
		else if (readType === "binary") readFile.readAsBinaryString(fileArr[0]);
	});
}

// function isCommitInObjArr(commitHash = "") {
// 	return OBJECT_ARR.some((obj) => obj.commit === commitHash);
// }

export default getObjects;

// To do
// Error handling
// Handle packed repos
// XSS protection
// Commit msgs (beware of the GPG key, commit description, rebased commit msgs and other stuff in the commit msg file)
// Too long commit msg? (Does Git have inbuilt precautions for that? If yes, then I might not need to add protection for that.)
// Handle multiple parents per commit
// Handle image parsing errors
// Handle empty blobs (same hash) with different file names
