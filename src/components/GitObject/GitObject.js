import "./GitObject.css";

const GitObject = ({ objectType, objId, hash, name }) => {
	const objectClass = "git-object " + objectType + "-object";

	return (
		<div className={objectClass} id={objId}>
			{objectType}
			{hash ? " " + hash.slice(0, 7) : ""}
			{name ? (
				<>
					<br />
					{name}
				</>
			) : (
				""
			)}
		</div>
	);
};

export default GitObject;
