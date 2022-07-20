import { useEffect, useState } from "react";
import classNames from "classnames";
import { Icon, Text, Button, Spinner } from "@blueprintjs/core";
import { AppToaster } from "../App";
import { useNavigate } from "react-router-dom";

function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const navigate = useNavigate();
  const invalidFile = () => {
    AppToaster.show({
      message: "Invalid file type.  More supported types are coming soon!",
      intent: "warning",
    });
  };
  const dropFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      setIsUploading(true);
      const chosenFile = [...e.dataTransfer.files][0];
      console.log(chosenFile);
      window.electron.uploadedFile(chosenFile.path);
    } else {
      invalidFile();
    }
  };
  const chooseFile = () => {
    setIsPicking(true);
    window.electron.chooseFile();
  };
  useEffect(() => {
    window.electron.onCancelChooseFile(() => {
      setIsPicking(false);
    });
    window.electron.onFileChosen(() => {
      setIsPicking(false);
      navigate("/convert");
    });
    window.electron.onInvalidFile(invalidFile);
  }, [navigate]);
  return (
    <>
      <div
        className={classNames("dropzone", { hovering: isDragging })}
        onDragOver={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDragExit={() => setIsDragging(false)}
        onDragEnd={() => setIsDragging(false)}
        onDrop={(e) => dropFile(e)}
      >
        {!isUploading ? (
          <Icon
            icon={isDragging ? "hand-down" : "upload"}
            size={40}
            color={isDragging ? "#5f6b7c" : "#2f343c"}
            className="bigIcon"
          />
        ) : (
          <Spinner className="bigIcon" />
        )}
        <Text className="uploadText">
          {isDragging ? "Drop it like it's hot" : "Drop any file to convert"}
        </Text>
        <Button
          text="Choose a file"
          icon="folder-open"
          loading={isPicking}
          onClick={chooseFile}
        />
      </div>
      <Text className="appName">Transforma</Text>
    </>
  );
}

export default Home;
