import "./GitObject.css";

const GitObject = ({
	objectType,
	objId,
	hash,
	name,
	isToBeColored,
	branchHead,
	sendRawObjDetails
}) => {
	const objectClass = isToBeColored
		? "git-object " + objectType + "-object"
		: "git-object " + objectType + "-object git-object-no-color";

	const sendObjDetails = () => {
		let hash;

		if (objectType === "blob") hash = objId.split("-")[0];
		else hash = objId;

		sendRawObjDetails({ objHash: hash, objName: name });
	};

	return (
		<div className={objectClass} id={objId}>
			{objectType === "commit" && branchHead !== "" && (
				<div className="branch-head">
					{branchHead.length <= 40
						? branchHead
						: branchHead.slice(0, 40) + "..."}
				</div>
			)}

			{objectType}
			{hash && " " + hash.slice(0, 7)}
			{name && (
				<>
					<br />
					{name.length <= 40 ? name : name.slice(0, 40) + "..."}
				</>
			)}

			{objectType !== "HEAD" && (
				<button className="raw-btn" onClick={() => sendObjDetails()}>
					Raw
				</button>
			)}
		</div>
	);
};

export default GitObject;
