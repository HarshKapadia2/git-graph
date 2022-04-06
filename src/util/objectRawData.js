import { getObjectType, getDecompressedFileBuffer } from "./commonFns";

async function getObjRawData(files = [], hash = "") {
	let objRawData = {};
	const objType = await getObjectType(files, hash);

	const objFilePath =
		".git/objects/" + hash.slice(0, 2) + "/" + hash.slice(2);

	const objFileBuffer = await getDecompressedFileBuffer(files, objFilePath);

	if (objType === "tree") objRawData = await getTreeRawData(files, hash);
	else {
		const rawData = objFileBuffer.toString("utf-8");
		const firstNullIndex = rawData.indexOf("\0");
		const [objectType, objectLength] = rawData
			.slice(0, firstNullIndex)
			.split(" ");
		const rawContent = rawData.slice(firstNullIndex + 1);

		objRawData = {
			objType: objectType,
			objLength: objectLength,
			objContent: rawContent
		};
	}

	return objRawData;
}

async function getTreeRawData(files = [], treeHash = "") {
	if (treeHash === "" || files.length === 0)
		throw new Error("Parameters missing.");

	const treeFilePath =
		".git/objects/" + treeHash.slice(0, 2) + "/" + treeHash.slice(2);

	const treeContent = await getDecompressedFileBuffer(files, treeFilePath);

	let treeRawData = {};

	let index = treeContent.indexOf("\0");
	let [objType, objLength] = treeContent
		.toString("utf-8", 0, index)
		.split(" ");
	const length = parseInt(objLength);

	treeRawData = { objType, objLength };

	let rawContent = "";
	for (let nullIndex = index; nullIndex < length; index = nullIndex) {
		nullIndex = treeContent.indexOf("\0", index + 1);

		let [fileMode, fileName] = treeContent
			.toString("utf-8", index, nullIndex)
			.split(" ");

		nullIndex++;

		const objHash = treeContent.toString(
			"hex",
			nullIndex,
			(nullIndex += 20)
		); // '20' since the SHA1 hash is 20 bytes (40 hexadecimal characters per SHA1 hash)

		const tempObjType = await getObjectType(files, objHash);

		rawContent += `${fileMode}\t${tempObjType}\t\t${objHash}\t\t${fileName}\n`;
	}

	rawContent = rawContent.slice(1);
	treeRawData["objContent"] = rawContent;

	return treeRawData;
}

export default getObjRawData;
