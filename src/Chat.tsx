import React, { useState, useEffect, FormEvent } from "react"
import { io, Socket } from "socket.io-client"

type Messages = {
	id: string
	content: string
	send_at: string
}
const socket = io("http://localhost:4000")
const socket_id: string[] = []

socket.on("connect", (): void => {
	socket_id.push(socket.id)
	console.log(`Running with socket: ${socket_id[0]} `)
})

export const Chat = () => {
	const [sendMessage, setsendMessage] = useState<string>("")
	const [messages, setMessages] = useState<Messages[]>([])

	useEffect((): any => {
		const listenMessage = (msgData: Messages) => setMessages([...messages, msgData])
		socket.on("send.message", listenMessage)
		console.log(messages[0])
		return () => socket.off("send.message", listenMessage)
	}, [messages])

	const handleMsgSubimit = (e: FormEvent): void => {
		e.preventDefault()
		if (!sendMessage.trim()) return

		socket.emit("send.message", {
			id: socket_id[0],
			content: sendMessage,
			send_at: Date(),
		})

		setsendMessage("")
	}

	return (
		<main>
			<ul>
				{messages.map((value, i) => {
					;<li
						key={i}
						className={`list__item list__item--${
							value.id === socket_id[0] ? "mine" : "other"
						}`}></li>
				})}
			</ul>
			<div>
				<form className="sendMsgForm" onSubmit={handleMsgSubimit}>
					<input
						type="text"
						value={sendMessage}
						placeholder="Entry your message"
						className="form.input"
						onChange={(e) => setsendMessage(e.target.value)}
					/>
					<button type="submit">Send message</button>
				</form>
			</div>
		</main>
	)
}
