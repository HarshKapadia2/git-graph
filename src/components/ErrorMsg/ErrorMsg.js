import "./ErrorMsg.css";

const ErrorMsg = ({ errorType }) => {
	return (
		<div className="error-msg">
			<h2>Oh no!</h2>

			{errorType === "packed repo" && (
				<div>
					Looks like the repository is{" "}
					<a
						href="https://harshkapadia2.github.io/git_basics/#_the_pack_directory"
						target="_blank"
						rel="noreferrer"
					>
						packed
					</a>
					. Please{" "}
					<a
						href="https://www.youtube.com/watch?v=cauIy20JhFs"
						target="_blank"
						rel="noreferrer"
					>
						unpack ALL the Packfiles
					</a>{" "}
					and try again.
				</div>
			)}
		</div>
	);
};

export default ErrorMsg;
