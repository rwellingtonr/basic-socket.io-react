import React, { FormEvent, useEffect, useState } from "react"
import { socket, uploader } from "./Chat"
import Files from "./Files"

const Uploader = () => {
	const [files, setFiles] = useState<FileList | any[] | null>(null)
	const [fileName, setFileName] = useState<string>("")

	useEffect(() => {
		const starting = (fileInfo: any) => console.log("Start uploading", fileInfo)
		uploader.on("start", starting)
		return () => uploader.off("start", starting)
	})

	useEffect(() => {
		const streaming = (fileInfo: any) =>
			console.log("Streaming... sent " + fileInfo.sent + " bytes.")

		uploader.on("stream", streaming)
		return () => uploader.off("stream", streaming)
	})
	useEffect(() => {
		const completed = (fileInfo: any) => {
			if (!fileName) setFileName(fileInfo.name)

			console.log("Upload Complete", fileInfo)
		}
		uploader.on("complete", completed)
		return () => uploader.on("complete", completed)
	})
	useEffect(() => {
		const uploadError = (err: string) => console.log("Error!", err)
		uploader.on("error", uploadError)
		return () => uploader.off("error", uploadError)
	})

	const handleFileSubmit = (e: FormEvent): void => {
		e.preventDefault()
		if (files) {
			uploader.upload(files)
			setFiles(null)
		}
	}
	const handleUpload = (attachment: any) => {
		const file = [...attachment]
		setFiles(file)
		console.log(file)
	}

	const handleDelete = (e: FormEvent) => {
		e.preventDefault()
		socket.emit("delete-file", fileName)
	}

	return (
		<div className="modal" role="dialog">
			<div className="modal-dialog" role="document">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">Título do modal</h5>
						<button
							type="button"
							className="close"
							data-dismiss="modal"
							aria-label="Fechar">
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div className="modal-body">{files && <Files files={files} />}</div>
					<div className="modal-footer">
						<form id="form" onSubmit={handleFileSubmit}>
							<input
								type="file"
								id="file"
								multiple
								onChange={(e) => handleUpload(e.target.files)}
							/>
							<input type="submit" value="Upload" />
							<input
								type="button"
								value="Delete file"
								onClick={(e) => handleDelete(e)}
							/>
						</form>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Uploader
