import "./ErrorMsg.css";

const ErrorMsg = ({ errorType }) => {
	let errorMsg = "";

	if (errorType === "packed-repo")
		errorMsg = (
			<div>
				<p>
					Looks like the repository is{" "}
					<a
						href="https://git.harshkapadia.me/#_the_pack_directory"
						target="_blank"
						rel="noreferrer"
					>
						packed
					</a>
					.
				</p>
				<p>
					Please{" "}
					<a
						href="https://www.youtube.com/watch?v=cauIy20JhFs"
						target="_blank"
						rel="noreferrer"
					>
						unpack ALL the Packfiles
					</a>{" "}
					and then re-select the <code>.git</code> directory.
				</p>
			</div>
		);
	else if (errorType === "no-branches")
		errorMsg = (
			<div>
				<p>No branches were found.</p>
				<p>
					Please upload the correct directory (a <code>.git</code>{" "}
					directory) or make commits and then re-select the{" "}
					<code>.git</code> directory.
				</p>
				<p>
					If the <code>.git</code> directory is not visible in the
					directory picker, please enable hidden file viewing on the
					local machine.
				</p>
			</div>
		);

	return (
		<div className="error-msg">
			<h2>Oh no!</h2>

			{errorMsg}
		</div>
	);
};

export default ErrorMsg;
