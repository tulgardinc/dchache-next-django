"use client";

import { Inter } from "next/font/google";
import { ChangeEvent, useEffect, useState } from "react";
import { saveAs } from "file-saver";
import DirContent from "./components/ui/DirContent";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
});

type FileRep = {
    name: string;
    is_dir: boolean;
};

export default function Home() {
    const [workingDir, setWorkingDir] = useState("");
    const [dirContent, setDirContent] = useState<FileRep[]>();
    const [documentToUpload, setDocumentToUpload] = useState<File>();
    const [dirName, setDirName] = useState("");

    const requestDirContent = async () => {
        const resp = await fetch("http://localhost:8000/api/dir/" + workingDir);
        if (resp.body === null) {
            setDirContent(undefined);
        } else {
            const json = await resp.json();
            console.log(json);
            setDirContent(json.files);
        }
    };

    const onDirClick = (dir: FileRep) => {
        if (workingDir == "") {
            setWorkingDir(dir.name);
        } else {
            setWorkingDir(workingDir + "/" + dir.name);
        }
        setDirContent(undefined);
    };

    const dirUpClick = (_: FileRep) => {
        const last_slash_index = workingDir.lastIndexOf("/");
        if (last_slash_index === -1) {
            if (workingDir != "") setWorkingDir("");
            return;
        }
        const substring = workingDir.substring(0, last_slash_index);
        setWorkingDir(substring);
        setDirContent(undefined);
    };

    const requestFile = async (file: FileRep) => {
        const url = "http://localhost:8000/api/file/";
        const path =
            workingDir === ""
                ? url + file.name
                : url + workingDir + "/" + file.name;
        const resp = await fetch(path);
        const blob = await resp.blob();
        console.log(blob);
        saveAs(blob, file.name);
    };

    const deleteFile = async (file: FileRep) => {
        const url = "http://localhost:8000/api/file/";
        const path =
            workingDir === ""
                ? url + file.name
                : url + workingDir + "/" + file.name;
        const resp = await fetch(path, { method: "DELETE" });
        requestDirContent();
    };

    const submitFile = async () => {
        if (!documentToUpload) return;
        const url = "http://localhost:8000/api/file/";
        const formData = new FormData();
        formData.append("file", documentToUpload);
        const path =
            workingDir === ""
                ? url + documentToUpload.name
                : url + workingDir + "/" + documentToUpload.name;
        const resp = await fetch(path, { method: "PUT", body: formData });
        requestDirContent();
    };

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const file = e.target.files[0];
        setDocumentToUpload(file);
    };

    const createDir = async () => {
        if (dirName == "") return;
        const resp = await fetch(
            "http://localhost:8000/api/dir/" + workingDir + "/" + dirName,
            { method: "PUT" }
        );
        requestDirContent();
    };

    useEffect(() => {
        requestDirContent();
    }, [workingDir]);

    return (
        <main className={inter.className + " mx-5"}>
            <h1 className=" text-3xl font-bold my-5">
                Working Directory: {"/" + workingDir}
            </h1>
            <div className="bg-white relative box-border px-2 py-3 rounded-lg shadow-xl z-0">
                {!dirContent ? (
                    <h3>Loading...</h3>
                ) : (
                    <div>
                        {dirContent.map((f, i) => {
                            if (i == 0) {
                                return (
                                    <DirContent
                                        key={i}
                                        click={dirUpClick}
                                        file={f}
                                        is_up={true}
                                        delete={() => {}}
                                    />
                                );
                            } else {
                                return (
                                    <DirContent
                                        key={i}
                                        click={
                                            f.is_dir ? onDirClick : requestFile
                                        }
                                        file={f}
                                        is_up={false}
                                        delete={deleteFile}
                                    />
                                );
                            }
                        })}
                    </div>
                )}
            </div>
            <div className="mt-5 bg-white relative box-border px-5 py-3 rounded-lg shadow-xl z-10 flex justify-between">
                <div>
                    <input
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            onFileChange(e)
                        }
                        type="file"
                    />
                    <button
                        onClick={submitFile}
                        className="text-white bg-green-400 px-4 py-1 rounded font-bold hover:bg-green-500"
                    >
                        Submit
                    </button>
                </div>
                <div>
                    <input
                        type="text"
                        className="border-b-4 mr-5 outline-none p-1 box-border"
                        value={dirName}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setDirName(e.target.value)
                        }
                    />
                    <button
                        onClick={createDir}
                        className="text-white bg-blue-400 px-4 py-1 rounded font-bold hover:bg-blue-500"
                    >
                        Make Dir
                    </button>
                </div>
            </div>
        </main>
    );
}
