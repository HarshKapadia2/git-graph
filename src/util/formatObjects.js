let OBJECT_DATA = {};
let COMMITS = [];
let TREES = [];
let BLOBS = [];

function formatObjects(objectData = {}) {
	OBJECT_DATA = objectData;
	const gitObjects = OBJECT_DATA.objects;

	for (let objKey in gitObjects) {
		COMMITS.push({
			hash: gitObjects[objKey].commit,
			name: "",
			color: true
		});

		if (!TREES.some((obj) => obj.hash === gitObjects[objKey].tree))
			TREES.push({
				hash: gitObjects[objKey].tree,
				name: "",
				color: true
			});

		const gitBlobs = gitObjects[objKey].blobs;
		for (let blobKey in gitBlobs) {
			if (gitBlobs[blobKey].type === "tree") {
				if (
					!TREES.some(
						(treeObject) =>
							treeObject.hash === gitBlobs[blobKey].hash
					)
				) {
					TREES.push({
						hash: gitBlobs[blobKey].hash,
						name: gitBlobs[blobKey].name,
						color: true
					});
					addRecursiveTrees(gitBlobs[blobKey].hash);
				}
			} else {
				if (
					!BLOBS.some(
						(blobObject) =>
							blobObject.hash === gitBlobs[blobKey].hash &&
							blobObject.name === gitBlobs[blobKey].name
					)
				)
					BLOBS.push({
						hash: gitBlobs[blobKey].hash,
						name: gitBlobs[blobKey].name,
						color: true
					});
			}
		}
	}

	// OBJECT_DATA.objects.forEach((gitObject) => {
	// 	COMMITS.push({ hash: gitObject.commit, name: "" });

	// 	if (!TREES.some((obj) => obj.hash === gitObject.tree))
	// 		TREES.push({ hash: gitObject.tree, name: "" });

	// 	gitObject.blobs.forEach((obj) => {
	// 		if (obj.type === "tree") {
	// 			if (!TREES.some((treeObject) => treeObject.hash === obj.hash)) {
	// 				TREES.push({ hash: obj.hash, name: obj.name });
	// 				addRecursiveTrees(obj.hash);
	// 			}
	// 		} else {
	// 			if (!BLOBS.some((blobObject) => blobObject.hash === obj.hash))
	// 				BLOBS.push({ hash: obj.hash, name: obj.name });
	// 		}
	// 	});
	// });

	const formattedObjectData = {
		commits: COMMITS,
		trees: TREES,
		blobs: BLOBS
	};

	OBJECT_DATA = [];
	COMMITS = [];
	TREES = [];
	BLOBS = [];

	return formattedObjectData;
}

function addRecursiveTrees(treeHash = "") {
	const obj = OBJECT_DATA.recursiveTrees[treeHash];

	for (let objKey in obj) {
		if (obj[objKey].type === "tree") {
			if (
				!TREES.some(
					(treeObject) => treeObject.hash === obj[objKey].hash
				)
			) {
				TREES.push({
					hash: obj[objKey].hash,
					name: obj[objKey].name,
					color: true
				});
				addRecursiveTrees(obj[objKey].hash);
			}
		} else {
			if (
				!BLOBS.some(
					(blobObject) =>
						blobObject.hash === obj[objKey].hash &&
						blobObject.name === obj[objKey].name
				)
			)
				BLOBS.push({
					hash: obj[objKey].hash,
					name: obj[objKey].name,
					color: true
				});
		}
	}

	// objArr.forEach((object) => {
	// 	if (object.type === "tree") {
	// 		if (!TREES.some((treeObject) => treeObject.hash === object.hash)) {
	// 			TREES.push({ hash: object.hash, name: object.name });
	// 			addRecursiveTrees(object.hash);
	// 		}
	// 	} else {
	// 		if (!BLOBS.some((blobObject) => blobObject.hash === object.hash))
	// 			BLOBS.push({ hash: object.hash, name: object.name });
	// 	}
	// });
}

export default formatObjects;
