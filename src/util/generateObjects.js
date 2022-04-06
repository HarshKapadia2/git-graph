import {
	getObjectType,
	getDecompressedFileBuffer,
	readFile
} from "./commonFns";

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

		let commitContent = await getDecompressedFileBuffer(
			FILE_ARR,
			commitFilePath
		);
		if (commitContent === undefined) {
			FILE_ARR = [];
			OBJECT_ARR = [];
			RECURSED_DATA = {};

			throw new Error("File not found.");
		}
		commitContent = commitContent.toString("utf-8").split("\n");

		let commitMsg = getCommitMsg(commitContent);

		const treeArr = commitContent[0].split(" ");
		tree = treeArr[2];

		const blobs = await getBlobs(tree);

		const parentCommitArr = commitContent[1].split(" ");
		if (parentCommitArr[0] === "parent") parentCommit = parentCommitArr[1];
		else parentCommit = "";

		OBJECT_ARR.push({ commit, commitMsg, parentCommit, tree, blobs });

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
	const treeContent = await getDecompressedFileBuffer(FILE_ARR, treeFilePath);
	if (treeContent === undefined) {
		FILE_ARR = [];
		OBJECT_ARR = [];
		RECURSED_DATA = {};

		throw new Error("File not found.");
	}

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

		const objectType = await getObjectType(FILE_ARR, hash);

		blobArr.push({ type: objectType, name, hash });

		if (objectType === "tree") {
			const newData = await getBlobs(hash);
			RECURSED_DATA[hash] = newData;
		}
	}

	return blobArr;
}

async function getHead() {
	let headRef = await readFile(FILE_ARR, ".git/HEAD", "binary");
	headRef = headRef.slice(5, -1);

	let head = await readFile(FILE_ARR, `.git/${headRef}`, "binary");
	if (head === undefined) head = await getHeadFromPackedRefs(headRef);
	else head = head.slice(0, -1);

	return head;
}

function getCommitMsg(commitObjContent = []) {
	let i = 0;
	let firstParent = commitObjContent[1].split(" ");
	let secondParent = commitObjContent[2].split(" ");

	if (firstParent[0] === "parent") {
		i++;
		if (secondParent[0] === "parent") i++;
	}

	i += 3;

	let temp = commitObjContent[i].split(" ");
	if (temp[0] === "gpgsig") {
		let j = 0;
		for (j = i; j < commitObjContent.length; j++) {
			if (commitObjContent[j] === " -----END PGP SIGNATURE-----") {
				break;
			}
		}
		i = j + 2;
	}

	i++;

	return commitObjContent[i];
}

async function getHeadFromPackedRefs(reqdRef = "") {
	let packedRefs = await readFile(FILE_ARR, ".git/packed-refs", "binary");
	packedRefs = packedRefs.split("\n");

	for (let i = 1; i < packedRefs.length; i++) {
		const refEntry = packedRefs[i].split(" ");

		if (refEntry[1] === reqdRef) return refEntry[0];
	}

	return "";
}

// function isCommitInObjArr(commitHash = "") {
// 	return OBJECT_ARR.some((obj) => obj.commit === commitHash);
// }

export default getObjects;
