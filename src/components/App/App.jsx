import { useEffect, useState, useRef, useCallback } from "react";
import { directoryOpen } from "browser-fs-access";
import { MemoizedGraphArea } from "../GraphArea/GraphArea";
import ErrorMsg from "../ErrorMsg/ErrorMsg";
import CommitSelector from "../CommitSelector/CommitSelector";
import Loader from "../Loader/Loader";
import RawDataDisplay from "../RawDataDisplay/RawDataDisplay";
import BackToTop from "../BackToTop/BackToTop";
import IntroMsg from "../IntroMsg/IntroMsg";
import BranchSelector from "../BranchSelector/BranchSelector";
import getObjects from "../../util/generateObjects";
import formatObjects from "../../util/formatObjects";
import getConnections from "../../util/generateConnections";
import colorObjectsAndConnections from "../../util/coloring";
import getObjRawData from "../../util/objectRawData";
import getAllBranches from "../../util/generateBranchInfo";
import "./App.css";

function App() {
	const [fileBlobs, setFileBlobs] = useState([]);
	const [objectData, setObjectData] = useState({});
	const [errorType, setErrorType] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [showCommitSelector, setShowCommitSelector] = useState(false);
	const [selectedCommits, setSelectedCommits] = useState([]);
	const [rawDataObjDetails, setRawDataObjDetails] = useState({});
	const [objRawData, setObjRawData] = useState({});
	const [branchInfo, setBranchInfo] = useState({});

	const backToTopBtn = useRef();
	const scrollToTopTriggerDiv = useRef();
	const headerRef = useRef();

	useEffect(() => {
		async function getBranchNames() {
			if (fileBlobs.length !== 0) {
				try {
					const branchInfoTemp = await getAllBranches(fileBlobs);
					setBranchInfo(branchInfoTemp);
				} catch (err) {
					if (err.message === "Branches not found.")
						setErrorType("no-branches");
				}
			}
		}
		getBranchNames();
	}, [fileBlobs]);

	useEffect(() => {
		if (branchInfo.currentBranch !== undefined) {
			setIsLoading(true);
			setShowCommitSelector(false);
			setObjectData({});
			setSelectedCommits([]);
			parseObjects();
		}
	}, [branchInfo]);

	useEffect(() => {
		if (objectData.objects !== undefined && selectedCommits.length !== 0) {
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
		if (errorType) {
			if (isLoading) setIsLoading(false);
			if (showCommitSelector) setShowCommitSelector(false);
			if (Object.keys(objectData).length !== 0) setObjectData({});
			if (Object.keys(rawDataObjDetails).length !== 0)
				setRawDataObjDetails({});
			if (Object.keys(objRawData).length !== 0) setObjRawData({});
			if (fileBlobs.length !== 0) setFileBlobs([]);
			if (selectedCommits.length !== 0) setSelectedCommits([]);
			if (branchInfo.currentBranch !== undefined) setBranchInfo({});
		}
	}, [errorType]);

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

				setIsLoading(true);
				setFileBlobs(blobs);
				setBranchInfo({});
				setObjectData({});

				if (errorType) setErrorType("");
			})
			.catch((err) => console.error("ERROR: ", err));
	};

	const parseObjects = async () => {
		try {
			let rawObjects = await getObjects(fileBlobs, branchInfo);
			let objects = formatObjects(rawObjects);
			let objectConnections = getConnections(rawObjects);

			const headObj = {
				start: "head",
				end: objectConnections[0].start,
				color: true
			};
			objectConnections.unshift(headObj);

			if (showCommitSelector) setShowCommitSelector(false);
			setObjectData({ objects, objectConnections });
			setIsLoading(false);
			if (errorType) setErrorType("");
		} catch (err) {
			if (err.message === "File not found.") setErrorType("packed-repo");
		}
	};

	const handleBranchChange = (chosenBranchName) => {
		let chosenBranchHeadHash = "";
		for (let i = 0; i < branchInfo.allBranches.length; i++) {
			if (branchInfo.allBranches[i].branchName === chosenBranchName) {
				chosenBranchHeadHash = branchInfo.allBranches[i].branchHeadHash;
				break;
			}
		}

		const branchNamesTemp = {
			currentBranch: {
				name: chosenBranchName,
				headHash: chosenBranchHeadHash
			},
			allBranches: branchInfo.allBranches
		};

		setBranchInfo(branchNamesTemp);
	};

	const handleObjRawData = async () => {
		const rawObjData = await getObjRawData(
			fileBlobs,
			rawDataObjDetails.objHash,
			branchInfo
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
						Select a <code>.git</code> Directory to Display
					</button>

					{branchInfo.currentBranch !== undefined ? (
						isLoading ? (
							<>
								<BranchSelector
									branchInfo={branchInfo}
									handleBranchChange={handleBranchChange}
									isDisabled={true}
								/>
								<button disabled={true}>
									Select Commits to Highlight
								</button>
							</>
						) : (
							<>
								<BranchSelector
									branchInfo={branchInfo}
									handleBranchChange={handleBranchChange}
									isDisabled={false}
								/>
								<button
									onClick={() => setShowCommitSelector(true)}
								>
									Select Commits to Highlight
								</button>
							</>
						)
					) : null}
				</div>
			</header>

			<main>
				<div ref={scrollToTopTriggerDiv}></div>

				{errorType !== "" ? (
					<ErrorMsg errorType={errorType} />
				) : objectData.objects !== undefined ? (
					<MemoizedGraphArea
						objectData={objectData}
						sendRawObjDetails={handleRawDataObjDetails}
					/>
				) : isLoading ? null : (
					<IntroMsg />
				)}

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
				<a
					href="https://git.harshkapadia.me/#_git_objects"
					target="_blank"
					rel="noreferrer"
				>
					Git Objects
				</a>
				&nbsp;|&nbsp;
				<a
					href="https://talks.harshkapadia.me/git_internals"
					target="_blank"
					rel="noreferrer"
				>
					Git Internals talks
				</a>
				&nbsp;|&nbsp;
				<a
					href="https://harshkapadia.me"
					target="_blank"
					rel="noreferrer"
				>
					Harsh Kapadia
				</a>
				&nbsp;|&nbsp;
				<a
					href="https://github.com/HarshKapadia2/git-graph"
					target="_blank"
					rel="noreferrer"
				>
					GitHub repository
				</a>
				&nbsp;|&nbsp;
				<a
					href="https://github.com/HarshKapadia2/git-graph/issues"
					target="_blank"
					rel="noreferrer"
				>
					Report bugs
				</a>
			</footer>
		</>
	);
}

export default App;
