import getId from "../../util/generateId";
import GitObject from "../GitObject/GitObject";
import "./ObjectArea.css";

const ObjectArea = ({ objectType, objects, sendRawObjDetails }) => {
	return (
		<div className="object-area">
			{objectType === "commit" && (
				<GitObject objectType="HEAD" objId="head" hash="" name="" />
			)}

			{objects !== [] &&
				objects.map((obj, index) => (
					<GitObject
						objectType={objectType}
						objId={
							objectType === "blob"
								? getId(obj.hash, obj.name)
								: obj.hash
						}
						hash={obj.hash}
						name={obj.name}
						isToBeColored={obj.color}
						branchHead={obj.branchHead}
						sendRawObjDetails={sendRawObjDetails}
						key={index}
					/>
				))}
		</div>
	);
};

export default ObjectArea;
