import { useState } from "react";
import { directoryOpen } from "browser-fs-access";
import GraphArea from "../GraphArea/GraphArea";
import getObjects from "../../util/generateObjects";
import formatObjects from "../../util/formatObjects";
import getConnections from "../../util/generateConnections";
import "./App.css";
import ErrorMsg from "../ErrorMsg/ErrorMsg";

function App() {
	const [objectData, setObjectData] = useState({});
	const [isPackedRepo, setIsPackedRepo] = useState(false);

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
		try {
			let rawObjects = await getObjects(fileBlobArr);
			let objects = formatObjects(rawObjects);
			let objectConnections = getConnections(rawObjects);
			setObjectData({ objects, objectConnections });
			setIsPackedRepo(false);
		} catch (err) {
			if (err.message === "File not found.") setIsPackedRepo(true);
		}
	};

	return (
		<>
			<header>
				<h1>Git Graph</h1>
			</header>

			<main>
				<button onClick={() => showDirectoryPicker()}>
					Click to Choose a '.git' Directory
				</button>

				{isPackedRepo ? (
					<ErrorMsg errorType="packed repo" />
				) : (
					<GraphArea objectData={objectData} />
				)}
			</main>

			<footer>
				Learn about&nbsp;
				<a
					href="https://harshkapadia2.github.io/git_basics/#_git_objects"
					target="_blank"
					rel="noreferrer"
				>
					Git Objects
				</a>
				.&nbsp;Made by&nbsp;
				<a
					href="https://harshkapadia.me"
					target="_blank"
					rel="noreferrer"
				>
					Harsh Kapadia
				</a>
				.&nbsp;Visit the&nbsp;
				<a
					href="https://github.com/HarshKapadia2/git-graph"
					target="_blank"
					rel="noreferrer"
				>
					GitHub Repo
				</a>
				.
			</footer>
		</>
	);
}

export default App;
