import GitObject from "../GitObject/GitObject";
import "./ObjectArea.css";

const ObjectArea = ({ objectType, objects }) => {
	return (
		<div className="object-area">
			{objectType === "commit" ? (
				<GitObject objectType="HEAD" objId="head" hash="" name="" />
			) : (
				""
			)}

			{objects !== []
				? objects.map((obj, index) => (
						<GitObject
							objectType={objectType}
							objId={obj.hash}
							hash={obj.hash}
							name={obj.name}
							key={index}
						/>
				  ))
				: ""}
		</div>
	);
};

export default ObjectArea;
