import React, { useState, useEffect, FormEvent, useRef } from "react"
import { io } from "socket.io-client"
import SocketIOFileClient from "socket.io-file-client"

type Messages = {
	id: string
	content: string
	send_at: string
}
const socket = io("http://localhost:4000")
const uploader = new SocketIOFileClient(socket)

uploader.on("start", (fileInfo: any) => {
	console.log("Start uploading", fileInfo)
})
uploader.on("stream", (fileInfo: any) => {
	console.log("Streaming... sent " + fileInfo.sent + " bytes.")
})
uploader.on("complete", (fileInfo: any) => {
	console.log("Upload Complete", fileInfo)
})
uploader.on("error", (err: string) => {
	console.log("Error!", err)
})
uploader.on("abort", (fileInfo: any) => {
	console.log("Aborted: ", fileInfo)
})

export const Chat = () => {
	const [sendMessage, setsendMessage] = useState<string>("")
	const [messages, setMessages] = useState<Messages[]>([])
	const [socketId, setSocketId] = useState<string>("")
	const [file, setFile] = useState<any>("")

	useEffect((): any => {
		const connection = (): void => {
			console.log(`Running with socket: ${socket.id} `)
			return setSocketId(socket.id)
		}
		socket.on("connect", connection)
		return () => socket.off("connect", connection)
	}, [])

	useEffect((): any => {
		const listenMessage = (msgData: Messages) => setMessages([...messages, msgData])
		socket.on("send.message", listenMessage)
		return () => socket.off("send.message", listenMessage)
	}, [messages])

	const handleMsgSubimit = (e: FormEvent): void => {
		e.preventDefault()
		if (!sendMessage.trim()) return

		socket.emit("send.message", {
			id: socketId,
			content: sendMessage,
			send_at: Date(),
		})

		setsendMessage("")
	}
	const handleFileSubmit = (e: FormEvent): void => {
		e.preventDefault()
		if (file) {
			uploader.upload(file)
			setFile("")
		}
	}

	return (
		<main className="container">
			<div className="msg">
				<ul className="ul-list">
					{messages.map((value, i) => (
						<li key={i} className={`li li-${value.id === socketId ? "mine" : "other"}`}>
							<span className={`message message--${value.id === socketId ? "mine" : "other"}`}>
								{`${value.content}  - ${value.send_at.slice(16, 21)} `}
							</span>
						</li>
					))}
				</ul>

				<form className="sendMsgForm" onSubmit={handleMsgSubimit}>
					<input
						type="text"
						value={sendMessage}
						placeholder="Entry your message"
						className="form-input"
						onChange={(e) => setsendMessage(e.target.value)}
					/>
					<button type="submit">Send message</button>
				</form>
				<form id="form" onSubmit={handleFileSubmit}>
					<input type="file" id="file" onChange={(e) => setFile(e.target.files)} />
					<input type="submit" value="Upload" />
				</form>
			</div>
		</main>
	)
}
