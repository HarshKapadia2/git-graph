import { useEffect, useState } from "react";
import Xarrow from "react-xarrows";
import ObjectArea from "../ObjectArea/ObjectArea";
import "./GraphArea.css";

const GraphArea = ({ objectData }) => {
	const [gitObjectData, setGitObjectData] = useState({});

	useEffect(() => {
		if (objectData.objectConnections !== undefined) {
			const headObj = {
				start: "head",
				end: objectData.objectConnections[0].start
			};
			objectData.objectConnections.unshift(headObj);
			setGitObjectData(objectData);
		}
	}, [objectData]);

	const randomColor = () => {
		const colors = ["yellow", "red", "blue", "lawngreen"];
		const index = Math.floor(Math.random() * colors.length);
		return colors[index];
	};

	return (
		<section id="graph-area">
			<ObjectArea
				objectType="commit"
				objects={
					gitObjectData.objects !== undefined
						? gitObjectData.objects.commits
						: []
				}
				key="commit"
			/>
			<ObjectArea
				objectType="tree"
				objects={
					gitObjectData.objects !== undefined
						? gitObjectData.objects.trees
						: []
				}
				key="tree"
			/>
			<ObjectArea
				objectType="blob"
				objects={
					gitObjectData.objects !== undefined
						? gitObjectData.objects.blobs
						: []
				}
				key="blob"
			/>

			{gitObjectData.objectConnections !== undefined &&
				gitObjectData.objectConnections.map((connection, index) => {
					if (connection.end !== "")
						return (
							<Xarrow
								start={connection.start}
								end={connection.end}
								color={randomColor()}
								key={index}
								zIndex={-1}
							/>
						);
					else return "";
				})}
		</section>
	);
};

export default GraphArea;
