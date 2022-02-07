import "./GitObject.css";

const GitObject = ({ objectType, objId, hash, name, isToBeColored }) => {
	const objectClass = isToBeColored
		? "git-object " + objectType + "-object"
		: "git-object " + objectType + "-object git-object-no-color";

	return (
		<div className={objectClass} id={objId}>
			{objectType}
			{hash && " " + hash.slice(0, 7)}
			{name && (
				<>
					<br />
					{name}
				</>
			)}
		</div>
	);
};

export default GitObject;
