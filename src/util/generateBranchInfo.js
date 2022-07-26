import { getHeadCommit, readFile } from "./commonFns";

async function getAllBranches(fileObjects = []) {
	let allBranches = [];

	// Get branch names and their hashes from the `.git/refs/heads` directory
	for (let i = 0; i < fileObjects.length; i++) {
		if (fileObjects[i].directoryHandle.name === "heads") {
			let branchName = fileObjects[i].handle.name;

			let branchHeadTemp = await readFile(
				fileObjects,
				`.git/refs/heads/${branchName}`,
				"binary"
			);
			let branchHeadHash = branchHeadTemp.slice(0, -1);

			allBranches.push({ branchName, branchHeadHash });
		}
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
				const branchHeadHash = refEntry[0];

				if (
					!allBranches.some(
						(branchInArr) => branchInArr.branchName === branchName
					)
				)
					allBranches.push({ branchName, branchHeadHash });
			}
		}
	}

	if (allBranches.length === 0) throw new Error("Branches not found.");

	// Get current branch name and hash
	let currentBranchRef = await readFile(fileObjects, ".git/HEAD", "binary");
	let currentBranchName = currentBranchRef.slice(16, -1);
	let currentBranchHeadHash = await getHeadCommit(
		fileObjects,
		currentBranchName
	);

	return {
		currentBranch: {
			name: currentBranchName,
			headHash: currentBranchHeadHash
		},
		allBranches
	};
}

export default getAllBranches;
