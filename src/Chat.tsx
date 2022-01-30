import React, { useState, useEffect, FormEvent } from "react"
import { io } from "socket.io-client"
import SocketIOFileClient from "socket.io-file-client"
import Uploader from "./Uploader"

type Messages = {
	id: string
	content: string
	send_at: string
}
export const socket = io("http://localhost:4000")
export const uploader = new SocketIOFileClient(socket)

export const Chat = () => {
	const [sendMessage, setSendMessage] = useState<string>("")
	const [messages, setMessages] = useState<Messages[]>([])
	const [socketId, setSocketId] = useState<string>("")
	const [openModal, setOpenModal] = useState<boolean>(false)

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

	const handleMsgSubmit = (e: FormEvent): void => {
		e.preventDefault()
		if (!sendMessage.trim()) return

		socket.emit("send.message", {
			id: socketId,
			content: sendMessage,
			send_at: Date(),
		})

		setSendMessage("")
	}

	return (
		<main className="container">
			<div className="msg">
				<ul className="ul-list">
					{messages.map((value, i) => (
						<li key={i} className={`li li-${value.id === socketId ? "mine" : "other"}`}>
							<span
								className={`message message--${
									value.id === socketId ? "mine" : "other"
								}`}>
								{`${value.content}  - ${value.send_at.slice(16, 21)} `}
							</span>
						</li>
					))}
				</ul>

				<form className="sendMsgForm" onSubmit={handleMsgSubmit}>
					<input
						type="text"
						value={sendMessage}
						placeholder="Entry your message"
						className="form-input"
						onChange={(e) => setSendMessage(e.target.value)}
					/>
					<button type="submit">Send message</button>
				</form>
				<button onClick={() => setOpenModal(!openModal)}>Upload files </button>

				{openModal && <Uploader />}
			</div>
		</main>
	)
}
