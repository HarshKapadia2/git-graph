import { useEffect, useState } from "react";
import { directoryOpen } from "browser-fs-access";
import GraphArea from "../GraphArea/GraphArea";
import ErrorMsg from "../ErrorMsg/ErrorMsg";
import CommitSelector from "../CommitSelector/CommitSelector";
import Loader from "../Loader/Loader";
import RawDataDisplay from "../RawDataDisplay/RawDataDisplay";
import getObjects from "../../util/generateObjects";
import formatObjects from "../../util/formatObjects";
import getConnections from "../../util/generateConnections";
import colorObjectsAndConnections from "../../util/coloring";
import getObjRawData from "../../util/objectRawData";
import "./App.css";

function App() {
	const [fileBlobs, setFileBlobs] = useState([]);
	const [objectData, setObjectData] = useState({});
	const [isPackedRepo, setIsPackedRepo] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [showCommitSelector, setShowCommitSelector] = useState(false);
	const [selectedCommits, setSelectedCommits] = useState([]);
	const [rawDataObjDetails, setRawDataObjDetails] = useState({});
	const [objRawData, setObjRawData] = useState({});

	useEffect(() => {
		if (fileBlobs.length !== 0) getObjectData();
	}, [fileBlobs]);

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
			if (isLoading) setIsLoading(false);
			if (showCommitSelector) setShowCommitSelector(false);
			if (Object.keys(objectData).length !== 0) setObjectData({});
			if (Object.keys(rawDataObjDetails).length !== 0)
				setRawDataObjDetails({});
			if (Object.keys(objRawData).length !== 0) setObjRawData({});
			if (fileBlobs.length !== 0) setFileBlobs([]);
			if (selectedCommits.length !== 0) setSelectedCommits([]);
		}
	}, [isPackedRepo]);

	useEffect(() => {
		if (Object.keys(rawDataObjDetails).length !== 0) handleObjRawData();
	}, [rawDataObjDetails]);

	const showDirectoryPicker = async () => {
		const skippedDirectories = [
			"gitweb",
			"hooks",
			"lfs",
			"logs",
			"rebase-merge",
			"remotes"
		];

		await directoryOpen({
			recursive: true,
			skipDirectory: (dir) => {
				return skippedDirectories.some(
					(skippedDir) => skippedDir === dir.name
				);
			}
		})
			.then((blobs) => {
				if (showCommitSelector) setShowCommitSelector(false);

				setFileBlobs(blobs);
				setIsLoading(true);
				setObjectData({});

				if (isPackedRepo) setIsPackedRepo(false);
				if (selectedCommits.length !== 0) setSelectedCommits([]);
				if (Object.keys(rawDataObjDetails).length !== 0)
					setRawDataObjDetails({});
				if (Object.keys(objRawData).length !== 0) setObjRawData({});
			})
			.catch((err) => console.error("ERROR: ", err));
	};

	const getObjectData = async () => {
		try {
			let rawObjects = await getObjects(fileBlobs);
			let objects = formatObjects(rawObjects);
			let objectConnections = getConnections(rawObjects);

			const headObj = {
				start: "head",
				end: objectConnections[0].start,
				color: true
			};
			objectConnections.unshift(headObj);

			setIsLoading(false);
			if (showCommitSelector) setShowCommitSelector(false);
			setObjectData({ objects, objectConnections });
			if (isPackedRepo) setIsPackedRepo(false);
			if (Object.keys(rawDataObjDetails).length !== 0)
				setRawDataObjDetails({});
			if (Object.keys(objRawData).length !== 0) setObjRawData({});
			if (selectedCommits.length !== 0) setSelectedCommits([]);
		} catch (err) {
			if (err.message === "File not found.") setIsPackedRepo(true);
		}
	};

	const handleObjRawData = async () => {
		const rawObjData = await getObjRawData(
			fileBlobs,
			rawDataObjDetails.objHash
		);
		setObjRawData(rawObjData);
	};

	const handleRawDataObjDetails = (objDetails) => {
		if (objDetails.objHash !== rawDataObjDetails.objHash)
			setRawDataObjDetails(objDetails);
	};

	const dismissRawDataDisplay = () => {
		setRawDataObjDetails({});
		setObjRawData({});
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

				{Object.keys(rawDataObjDetails).length !== 0 && (
					<RawDataDisplay
						objDetails={rawDataObjDetails}
						rawData={objRawData}
						dismissRawDataDisplay={dismissRawDataDisplay}
					/>
				)}

				{isLoading && <Loader />}

				{isPackedRepo ? (
					<ErrorMsg errorType="packed repo" />
				) : objectData.objects !== undefined ? (
					<GraphArea
						objectData={objectData}
						sendRawObjDetails={handleRawDataObjDetails}
					/>
				) : null}
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
