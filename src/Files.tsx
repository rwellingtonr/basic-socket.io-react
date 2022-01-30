import React from "react"
interface IFiles extends Blob {
	name: string
}

const Files = ({ files }: any) => {
	return (
		<ul>
			{files.map((file: IFiles, i: number) => (
				<li key={i}>
					<img
						src={URL.createObjectURL(file)}
						alt={file.name}
						style={{ width: "20vh" }}
					/>
				</li>
			))}
		</ul>
	)
}
export default Files
