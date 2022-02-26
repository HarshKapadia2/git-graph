import { useEffect, useState } from "react";
import { directoryOpen } from "browser-fs-access";
import GraphArea from "../GraphArea/GraphArea";
import ErrorMsg from "../ErrorMsg/ErrorMsg";
import CommitSelector from "../CommitSelector/CommitSelector";
import getObjects from "../../util/generateObjects";
import formatObjects from "../../util/formatObjects";
import getConnections from "../../util/generateConnections";
import colorObjectsAndConnections from "../../util/coloring";
import "./App.css";

function App() {
	const [objectData, setObjectData] = useState({});
	const [isPackedRepo, setIsPackedRepo] = useState(false);
	const [showCommitSelector, setShowCommitSelector] = useState(false);
	const [selectedCommits, setSelectedCommits] = useState([]);

	useEffect(() => {
		if (objectData.objects !== undefined) {
			const updatedObjectData = colorObjectsAndConnections(
				objectData,
				selectedCommits
			);
			setObjectData(updatedObjectData);
		}
	}, [selectedCommits]);

	useEffect(() => {
		if (isPackedRepo) {
			setShowCommitSelector(false);
			setObjectData({});
		}
	}, [isPackedRepo]);

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

			const headObj = {
				start: "head",
				end: objectConnections[0].start,
				color: true
			};
			objectConnections.unshift(headObj);

			setObjectData({ objects, objectConnections });
			if (isPackedRepo) setIsPackedRepo(false);
			if (showCommitSelector) setShowCommitSelector(false);
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
				<div>
					<button onClick={() => showDirectoryPicker()}>
						Select a '.git' Directory to Display
					</button>

					{objectData.objects !== undefined && (
						<button onClick={() => setShowCommitSelector(true)}>
							Select Commits to Highlight
						</button>
					)}
				</div>

				{showCommitSelector && (
					<CommitSelector
						commits={objectData.objects.commits}
						selectorDisplayState={setShowCommitSelector}
						selectCommits={setSelectedCommits}
						selectedCommits={selectedCommits}
					/>
				)}

				{isPackedRepo ? (
					<ErrorMsg errorType="packed repo" />
				) : (
					<GraphArea objectData={objectData} />
				)}
			</main>

			<footer>
				Learn about&nbsp;
				<a
					href="https://git.harshkapadia.me/#_git_objects"
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
