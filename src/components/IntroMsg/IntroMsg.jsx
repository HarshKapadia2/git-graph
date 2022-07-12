import "./IntroMsg.css";

const IntroMsg = () => {
	return (
		<div className="intro-msg">
			<p>
				A visualizer for the Directed Acyclic Graph that Git creates to
				connect{" "}
				<a
					href="https://git.harshkapadia.me/#_git_objects"
					target="_blank"
					rel="noreferrer"
				>
					Commit, Tree and Blob objects
				</a>{" "}
				internally.
			</p>
			<p>
				<a
					href="https://www.youtube.com/watch?v=sLDDaPDXB8s"
					target="_blank"
					rel="noreferrer"
				>
					Learn the internals of Git.
				</a>
			</p>

			<h2>Usage Instructions</h2>
			<ul>
				<li>
					Select the <code>.git</code> directory of a repository for
					the graph to render.
				</li>
				<li>
					Once the graph is rendered, one can
					<ul>
						<li>
							Use the Commit Selector to highlight one or more
							Commits and their corresponding Trees and Blobs.
						</li>
						<li>
							Hover over the objects and click on the 'Raw' button
							to view the contents of that Git Object.
						</li>
					</ul>
				</li>
			</ul>

			<h2>Note</h2>
			<ul>
				<li>
					If the <code>.git</code> directory is not visible in the
					directory picker, please enable hidden file viewing on the
					local machine.
				</li>
				<li>
					Extremely huge repositories might not load due to browser
					memory constraints.
				</li>
				<li>
					Please report errors and bugs by{" "}
					<a
						href="https://github.com/HarshKapadia2/git-graph/issues"
						target="_blank"
						rel="noreferrer"
					>
						raising issues
					</a>
					.
				</li>
			</ul>
		</div>
	);
};

export default IntroMsg;
