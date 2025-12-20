import { Alert, AlertTitle, Dialog, DialogActions, DialogContent } from "@mui/material";
import { DialogBtn } from "../styles";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import type { Task } from "../types/user";
import { generateUUID, isHexColor, showToast } from "../utils";
import { UserContext } from "../contexts/UserContext";
import { AddTaskRounded, DoNotDisturbAltRounded, ErrorRounded } from "@mui/icons-material";
import { URL_REGEX, USER_NAME_MAX_LENGTH } from "../constants";
import { CustomDialogTitle } from "../components";
import { TaskItem } from "../components/tasks/TaskItem";
import Home from "./Home";
import LZString from "lz-string";
import { createTask } from "../api/tasks";
//FIXME: make everything type-safe
const SharePage = () => {
  const { setUser, isAuthenticated } = useContext(UserContext);
  const n = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const taskParam = queryParams.get("task");
  const userNameParam = queryParams.get("userName");

  const [taskData, setTaskData] = useState<Task | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [errorDetails, setErrorDetails] = useState<string | undefined>();

  useEffect(() => {
    document.title = `Todo App - Recieved Task ${taskData ? "(" + taskData.name + ")" : ""}`;
  }, [taskData]);

  useEffect(() => {
    const handleTaskData = (decodedTask: string) => {
      const task: Task = { ...(JSON.parse(decodedTask) as Task), id: generateUUID() };

      if (
        !isHexColor(task.color) ||
        (task.category && task.category.some((cat) => !isHexColor(cat.color)))
      ) {
        setError(true);
        setErrorDetails("Invalid task or category color format.");
        return;
      }

      setTaskData(task);
    };

    if (taskParam) {
      try {
        let decodedTask = decodeURIComponent(taskParam);

        if (decodedTask.startsWith("{") || decodedTask.startsWith("[")) {
          // old JSON format
          handleTaskData(decodedTask);
        } else {
          // new compressed format
          decodedTask = LZString.decompressFromEncodedURIComponent(decodedTask);
          if (!decodedTask) throw new Error("Decompression failed.");
          handleTaskData(decodedTask);
        }
      } catch (error) {
        console.error("Error decoding task data:", error);
        setError(true);
        setErrorDetails("Failed to decode task data. The link may be corrupted. " + error);
      }
    } else {
      setError(true);
      setErrorDetails("No task data found in the link.");
    }

    if (userNameParam) {
      const decodedUserName = decodeURIComponent(userNameParam);
      if (decodedUserName.length > USER_NAME_MAX_LENGTH) {
        setError(true);
        setErrorDetails("User name is too long.");
      }
      setUserName(decodedUserName);
    }
  }, [taskParam, userNameParam]);

  const handleAddTask = async () => {
    if (!taskData) return;

    if (!isAuthenticated) {
      showToast("Please log in to add this task", { type: "error" });
      return;
    }

    try {
      const createdTask = await createTask({
        ...taskData,
        sharedBy: userName,
      });

      setUser((prevUser) => ({
        ...prevUser,
        tasks: [...prevUser.tasks, createdTask.data],
      }));

      n("/");
      showToast(
        <div>
          Added shared task – <b translate="no">{createdTask.data.name}</b>
        </div>,
        { icon: <AddTaskRounded /> },
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      showToast("Failed to add shared task", { type: "error" });
    }
  };

  return (
    <>
      <Home />
      <Dialog
        open
        fullWidth
        slotProps={{
          paper: {
            style: {
              borderRadius: "24px",
              padding: " 10px 6px",
              width: "100% !important",
            },
          },
        }}
      >
        {!error && taskData ? (
          <>
            <CustomDialogTitle
              title="Recieved Task"
              subTitle="You can now include it in your list."
              icon={<AddTaskRounded />}
            />
            <DialogContent>
              <p style={{ fontSize: "16px", marginLeft: "6px" }}>
                <b translate={userName === "User" ? "yes" : "no"}>{userName}</b> shared you a task.
              </p>
              <TaskItem
                task={taskData}
                features={{
                  enableLinks: false,
                  enableGlow: false,
                }}
              />
              {!isAuthenticated && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Please log in to add this task to your account.
                </Alert>
              )}

              {taskData && taskData.description && taskData.description.match(URL_REGEX) && (
                <Alert sx={{ mt: "20px" }} severity="warning">
                  <AlertTitle>This task contains the following links:</AlertTitle>{" "}
                  {(() => {
                    const links = taskData.description.match(URL_REGEX)?.map((link) => link);
                    if (links) {
                      const listFormatter = new Intl.ListFormat("en-US", {
                        style: "long",
                        type: "conjunction",
                      });
                      return (
                        <span style={{ wordBreak: "break-all" }}>
                          {listFormatter.format(links)}
                        </span>
                      );
                    }
                    return null;
                  })()}
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <DialogBtn color="error" onClick={() => n("/")}>
                <DoNotDisturbAltRounded /> &nbsp; Decline
              </DialogBtn>
              <DialogBtn disabled={!isAuthenticated} onClick={handleAddTask}>
                <AddTaskRounded /> &nbsp;
                {isAuthenticated ? "Add Task" : "Login required"}
              </DialogBtn>
            </DialogActions>
          </>
        ) : (
          <>
            <CustomDialogTitle
              title="Failed to recieve Task"
              subTitle="This Task could not be processed."
              onClose={() => n("/")}
              icon={<ErrorRounded />}
            />
            <DialogContent>
              <Alert severity="error">
                <AlertTitle>Error: failed to process the task</AlertTitle>
                {errorDetails}
              </Alert>
            </DialogContent>
            <DialogActions>
              <DialogBtn onClick={() => n("/")}>Close</DialogBtn>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default SharePage;
