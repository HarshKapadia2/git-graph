import "./GitObject.css";

const GitObject = ({
	objectType,
	objId,
	hash,
	name,
	isToBeColored,
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
