let CONNECTIONS = [];
let OBJECT_DATA = {};

function getConnections(objectData = {}) {
	OBJECT_DATA = objectData;
	const gitObjects = OBJECT_DATA.objects;

	for (let objKey in gitObjects) {
		CONNECTIONS.push({
			start: gitObjects[objKey].commit,
			end: gitObjects[objKey].parentCommit
		});

		CONNECTIONS.push({
			start: gitObjects[objKey].commit,
			end: gitObjects[objKey].tree
		});

		const gitBlobs = gitObjects[objKey].blobs;
		for (let blobKey in gitBlobs) {
			if (gitBlobs[blobKey].type === "tree") {
				CONNECTIONS.push({
					start: gitObjects[objKey].tree,
					end: gitBlobs[blobKey].hash
				});
				addRecursiveTrees(gitBlobs[blobKey].hash);
			} else {
				CONNECTIONS.push({
					start: gitObjects[objKey].tree,
					end: gitBlobs[blobKey].hash
				});
			}
		}
	}

	const objectConnections = CONNECTIONS;

	CONNECTIONS = [];
	OBJECT_DATA = {};

	return objectConnections;
}

function addRecursiveTrees(treeHash = "") {
	const obj = OBJECT_DATA.recursiveTrees[treeHash];

	for (let objKey in obj) {
		if (obj[objKey].type === "tree") {
			CONNECTIONS.push({
				start: treeHash,
				end: obj[objKey].hash
			});
			addRecursiveTrees(obj[objKey].hash);
		} else
			CONNECTIONS.push({
				start: treeHash,
				end: obj[objKey].hash
			});
	}
}

export default getConnections;
