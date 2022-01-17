import { useState } from "react";
import { directoryOpen } from "browser-fs-access";
import GraphArea from "../GraphArea/GraphArea";
import getObjects from "../../util/generateObjects";
import formatObjects from "../../util/formatObjects";
import getConnections from "../../util/generateConnections";
import "./App.css";

function App() {
	const [objectData, setObjectData] = useState({});

	const showDirectoryPicker = async () => {
		const skippedDirectories = [
			"gitweb",
			"hooks",
			"lfs",
			"logs",
			"rebase-merge",
			"remotes"
		];

		const blobsInDirectory = await directoryOpen({
			recursive: true,
			skipDirectory: (dir) => {
				return skippedDirectories.some(
					(skippedDir) => skippedDir === dir.name
				);
			}
		});

		getObjectData(blobsInDirectory);
	};

	const getObjectData = async (fileBlobArr) => {
		let rawObjects = await getObjects(fileBlobArr);
		let objects = formatObjects(rawObjects);
		let objectConnections = getConnections(rawObjects);
		setObjectData({ objects, objectConnections });
	};

	return (
		<>
			<header>
				<h1>Git Graph</h1>
			</header>

			<main>
				<button onClick={() => showDirectoryPicker()}>
					Click to Choose Directory
				</button>

				<GraphArea objectData={objectData} />
			</main>

			<footer>
				Made by&nbsp;
				<a
					href="https://harshkapadia.me"
					target="_blank"
					rel="noreferrer"
				>
					Harsh Kapadia
				</a>
				. (
				<a
					href="https://github.com/HarshKapadia2/git-graph"
					target="_blank"
					rel="noreferrer"
				>
					GitHub Repo
				</a>
				)
			</footer>
		</>
	);
}

export default App;
