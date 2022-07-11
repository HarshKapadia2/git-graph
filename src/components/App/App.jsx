import { useEffect, useState, useRef, useCallback } from "react";
import { directoryOpen } from "browser-fs-access";
import { MemoizedGraphArea } from "../GraphArea/GraphArea";
import ErrorMsg from "../ErrorMsg/ErrorMsg";
import CommitSelector from "../CommitSelector/CommitSelector";
import Loader from "../Loader/Loader";
import RawDataDisplay from "../RawDataDisplay/RawDataDisplay";
import BackToTop from "../BackToTop/BackToTop";
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

	const backToTopBtn = useRef();
	const scrollToTopTriggerDiv = useRef();
	const headerRef = useRef();

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
		if (Object.keys(rawDataObjDetails).length !== 0) handleObjRawData();
	}, [rawDataObjDetails]);

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
		const observer = new IntersectionObserver(scrollToTop, {
			rootMargin: "-12%"
		});
		observer.observe(scrollToTopTriggerDiv.current);
	}, []);

	useEffect(() => {
		if (Object.keys(objectData).length !== 0) {
			window.addEventListener("wheel", (event) => handleScroll(event), {
				passive: true
			});
		}

		return () =>
			window.removeEventListener(
				"wheel",
				(event) => handleScroll(event),
				{
					passive: true
				}
			);
	}, [objectData]);

	const showDirectoryPicker = async () => {
		const skippedDirectories = [
			"gitweb",
			"hooks",
			"lfs",
			"logs",
			"rebase-merge",
			"remotes",
			"info",
			"pack",
			"modules",
			"worktrees"
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

	const handleRawDataObjDetails = useCallback((objDetails) => {
		if (objDetails.objHash !== rawDataObjDetails.objHash)
			setRawDataObjDetails(objDetails);
	}, []);

	const dismissRawDataDisplay = () => {
		setRawDataObjDetails({});
		setObjRawData({});
	};

	const scrollToTop = (entries, observer) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				backToTopBtn.current.classList.add("hidden");
				headerRef.current.classList.remove("header-border-bottom");
				headerRef.current.classList.remove("header-dismiss");
			} else {
				backToTopBtn.current.classList.remove("hidden");
				headerRef.current.classList.add("header-border-bottom");
			}
		});
	};

	const handleScroll = (event) => {
		if (event.deltaY > 0) headerRef.current.classList.add("header-dismiss");
		else if (event.deltaY < 0)
			headerRef.current.classList.remove("header-dismiss");
	};

	return (
		<>
			<header ref={headerRef}>
				<h1>Git Graph</h1>

				<div id="header-cta-wrapper">
					<button onClick={() => showDirectoryPicker()}>
						Select a '.git' Directory to Display
					</button>

					{objectData.objects !== undefined && (
						<button onClick={() => setShowCommitSelector(true)}>
							Select Commits to Highlight
						</button>
					)}
				</div>
			</header>

			<main>
				<div ref={scrollToTopTriggerDiv}></div>

				{isPackedRepo ? (
					<ErrorMsg errorType="packed repo" />
				) : objectData.objects !== undefined ? (
					<MemoizedGraphArea
						objectData={objectData}
						sendRawObjDetails={handleRawDataObjDetails}
					/>
				) : null}

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

				<BackToTop
					backToTopBtn={backToTopBtn}
					scrollToTopTriggerDiv={scrollToTopTriggerDiv}
				/>
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
