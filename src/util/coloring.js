import getId from "./generateId";

let COMMIT_OBJECTS = [];
let TREE_OBJECTS = [];
let BLOB_OBJECTS = [];
let CONNECTIONS = [];

let COLORED_TREES = [];
let COLORED_BLOBS = [];

function colorObjectsAndConnections(objectData, selectedCommits) {
	COMMIT_OBJECTS = objectData.objects.commits;
	TREE_OBJECTS = objectData.objects.trees;
	BLOB_OBJECTS = objectData.objects.blobs;
	CONNECTIONS = objectData.objectConnections;

	if (selectedCommits.length === 0) return removeAllColors();
	if (selectedCommits.length === COMMIT_OBJECTS.length) return addAllColors();

	removeAllColors();

	for (let i = 0; i < COMMIT_OBJECTS.length; i++) {
		if (isPresentInArr(COMMIT_OBJECTS[i].hash, selectedCommits)) {
			COMMIT_OBJECTS[i].color = true;
			handleCommitConnections(COMMIT_OBJECTS[i].hash);
		}
	}

	for (let i = 0; i < COLORED_TREES.length; i++) {
		for (let j = 0; j < TREE_OBJECTS.length; j++) {
			if (TREE_OBJECTS[j].hash === COLORED_TREES[i]) {
				TREE_OBJECTS[j].color = true;
				handleTreeConnections(TREE_OBJECTS[j].hash);
				break;
			}
		}
	}

	if (COLORED_BLOBS.length > 0) {
		for (let i = 0; i < BLOB_OBJECTS.length; i++) {
			let id = getId(BLOB_OBJECTS[i].hash, BLOB_OBJECTS[i].name);

			if (isPresentInArr(id, COLORED_BLOBS)) BLOB_OBJECTS[i].color = true;
		}
	}

	COLORED_TREES = [];
	COLORED_BLOBS = [];

	return {
		objects: {
			commits: COMMIT_OBJECTS,
			trees: TREE_OBJECTS,
			blobs: BLOB_OBJECTS
		},
		objectConnections: CONNECTIONS
	};
}

function handleCommitConnections(commitHash) {
	for (let i = 0; i < CONNECTIONS.length; i++) {
		if (CONNECTIONS[i].start === commitHash) {
			CONNECTIONS[i].color = true;
			if (!isPresentInArr(CONNECTIONS[i].end, COLORED_TREES))
				COLORED_TREES.push(CONNECTIONS[i].end);
		}
	}
}

function handleTreeConnections(treeHash) {
	for (let i = 0; i < CONNECTIONS.length; i++) {
		if (CONNECTIONS[i].start === treeHash) {
			CONNECTIONS[i].color = true;

			if (CONNECTIONS[i].end.length === 40) {
				if (!isPresentInArr(CONNECTIONS[i].end, COLORED_TREES))
					// Implies a Tree Object not present in the tree array
					COLORED_TREES.push(CONNECTIONS[i].end);
			} else if (!isPresentInArr(CONNECTIONS[i].end, COLORED_BLOBS))
				COLORED_BLOBS.push(CONNECTIONS[i].end);
		}
	}
}

function removeAllColors() {
	for (let i = 0; i < COMMIT_OBJECTS.length; i++)
		COMMIT_OBJECTS[i].color = false;
	for (let i = 0; i < TREE_OBJECTS.length; i++) TREE_OBJECTS[i].color = false;
	for (let i = 0; i < BLOB_OBJECTS.length; i++) BLOB_OBJECTS[i].color = false;
	for (let i = 0; i < CONNECTIONS.length; i++) CONNECTIONS[i].color = false;

	COLORED_TREES = [];
	COLORED_BLOBS = [];

	return {
		objects: {
			commits: COMMIT_OBJECTS,
			trees: TREE_OBJECTS,
			blobs: BLOB_OBJECTS
		},
		objectConnections: CONNECTIONS
	};
}

function addAllColors() {
	for (let i = 0; i < COMMIT_OBJECTS.length; i++)
		COMMIT_OBJECTS[i].color = true;
	for (let i = 0; i < TREE_OBJECTS.length; i++) TREE_OBJECTS[i].color = true;
	for (let i = 0; i < BLOB_OBJECTS.length; i++) BLOB_OBJECTS[i].color = true;
	for (let i = 0; i < CONNECTIONS.length; i++) CONNECTIONS[i].color = true;

	COLORED_TREES = [];
	COLORED_BLOBS = [];

	return {
		objects: {
			commits: COMMIT_OBJECTS,
			trees: TREE_OBJECTS,
			blobs: BLOB_OBJECTS
		},
		objectConnections: CONNECTIONS
	};
}

function isPresentInArr(target, arr) {
	return arr.some((element) => element === target);
}

export default colorObjectsAndConnections;
