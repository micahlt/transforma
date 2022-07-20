import {
  Card,
  Button,
  Text,
  HTMLSelect,
  InputGroup,
  ButtonGroup,
} from "@blueprintjs/core";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import formats from "../utils/formats";
function Convert() {
  const nav = useNavigate();
  const [format, setFormat] = useState(formats.items[0]);
  const [folder, setFolder] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState(false);
  const term = useRef();
  useEffect(() => {
    window.electron.onStdOut((e, val) => {
      const el = document.createElement("p");
      el.innerText = val;
      term.current.appendChild(el);
      term.current.scrollTo({
        top: term.current.scrollHeight,
        behavior: "smooth",
      });
    });
    window.electron.onStdErr((e, val) => {
      const el = document.createElement("p");
      el.innerText = val;
      term.current.appendChild(el);
      term.current.scrollTo({
        top: term.current.scrollHeight,
        behavior: "smooth",
      });
    });
    window.electron.onFinish((e, code) => {
      if (code == 0) {
        setIsFinished(true);
      } else {
        setError("ERROR: " + code);
        const el = document.createElement("p");
        el.innerText = "ERROR: code " + code;
        term.current.appendChild(el);
      }
      setIsConverting(false);
    });
    window.electron.onFolderChosen((e, path) => {
      setFolder(path);
    });
  }, []);
  const startConversion = () => {
    setIsFinished(false);
    setIsConverting(true);
    term.current.innerText = "";
    window.electron.convert(format, folder);
  };
  const ChooseButton = () => {
    return <Button icon="folder-open" onClick={window.electron.chooseFolder} />;
  };
  return (
    <div className="centerAll">
      <div>
        <Button
          icon="key-backspace"
          minimal={true}
          className="backButton"
          onClick={() => nav(-1)}
        >
          Go back
        </Button>
        <Card interactive={false} className="bigCard" elevation={2}>
          <h3 className="bp4-large cardHeader">File conversion options</h3>
          <div className="cardContent">
            <div className="setting">
              <Text className="settingLabel">Format</Text>
              <HTMLSelect
                options={formats.items}
                onChange={(e) => {
                  setFormat(e.currentTarget.value);
                }}
                value={format}
              ></HTMLSelect>
            </div>
            <div className="setting">
              <Text className="settingLabel">Location</Text>
              <InputGroup
                rightElement={<ChooseButton />}
                value={folder || "(original)"}
              ></InputGroup>
            </div>
            <ButtonGroup>
              {!isFinished && (
                <Button
                  intent="primary"
                  icon="document"
                  onClick={startConversion}
                  loading={isConverting}
                >
                  Begin conversion
                </Button>
              )}
              {!isFinished && isConverting && (
                <Button
                  icon="stop"
                  onClick={window.electron.killChild}
                  intent="none"
                >
                  Cancel
                </Button>
              )}
              {isFinished && !error && (
                <Button icon="refresh" onClick={() => nav(-1)} intent="primary">
                  Convert new
                </Button>
              )}
              {isFinished && !error && (
                <Button icon="folder-new" onClick={window.electron.openResult}>
                  Show result
                </Button>
              )}
            </ButtonGroup>
            <pre className="terminal bp4-code-block" ref={term}></pre>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Convert;
