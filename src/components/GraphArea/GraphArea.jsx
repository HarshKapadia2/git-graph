import { useEffect, useState } from "react";
import Xarrow from "react-xarrows";
import ObjectArea from "../ObjectArea/ObjectArea";
import "./GraphArea.css";

const GraphArea = ({ objectData, sendRawObjDetails }) => {
	const [gitObjectData, setGitObjectData] = useState(objectData);

	useEffect(() => {
		setGitObjectData(objectData);
	}, [objectData]);

	const randomColor = () => {
		const colors = [
			"yellow",
			"red",
			"lawngreen",
			"aqua",
			"white",
			"violet",
			"coral"
		];
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
				sendRawObjDetails={sendRawObjDetails}
			/>
			<ObjectArea
				objectType="tree"
				objects={
					gitObjectData.objects !== undefined
						? gitObjectData.objects.trees
						: []
				}
				key="tree"
				sendRawObjDetails={sendRawObjDetails}
			/>
			<ObjectArea
				objectType="blob"
				objects={
					gitObjectData.objects !== undefined
						? gitObjectData.objects.blobs
						: []
				}
				key="blob"
				sendRawObjDetails={sendRawObjDetails}
			/>

			{gitObjectData.objectConnections !== undefined &&
				gitObjectData.objectConnections.map((connection, index) => {
					if (connection.end !== "")
						return (
							<Xarrow
								start={connection.start}
								end={connection.end}
								color={
									connection.color === true
										? randomColor()
										: "#242424"
								}
								key={index}
								zIndex={connection.color === true ? -1 : -2}
							/>
						);
					else return "";
				})}
		</section>
	);
};

export default GraphArea;
