import { useContext, useMemo, lazy, Suspense, useEffect, useState } from "react";
import {
  AddButton,
  GreetingHeader,
  Offline,
  ProgressPercentageContainer,
  StyledInput,
  StyledProgress,
  TaskCompletionText,
  TaskCountClose,
  TaskCountHeader,
  TaskCountTextContainer,
  TasksCount,
  TasksCountContainer,
} from "../styles";

import { Emoji } from "emoji-picker-react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Tooltip,
  Typography,
} from "@mui/material";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import {
  AddRounded,
  CloseRounded,
  TodayRounded,
  UndoRounded,
  WifiOff,
  AddComment,
  CommentBank,
} from "@mui/icons-material";
import { UserContext } from "../contexts/UserContext";
import { useResponsiveDisplay } from "../hooks/useResponsiveDisplay";
import { useNavigate } from "react-router-dom";
import { AnimatedGreeting } from "../components/AnimatedGreeting";
import { showToast } from "../utils";
import { VoiceButton } from "../components/VoiceButton";
import { useVoiceAssistant } from "../voice/useVoiceAssistant";
import { CustomDialogTitle } from "../components";
import InputThemeProvider from "../contexts/InputThemeProvider";

const TasksList = lazy(() =>
  import("../components/tasks/TasksList").then((module) => ({ default: module.TasksList })),
);

const Home = () => {
  const { user, setUser } = useContext(UserContext);
  const [showTestDialog, setShowTestDialog] = useState<boolean>(false);
  const [testText, setTestText] = useState<string>("");
  const { tasks, emojisStyle, settings, name } = user;
  const { sendTestText, transcript } = useVoiceAssistant();

  const isOnline = useOnlineStatus();
  const n = useNavigate();
  const isMobile = useResponsiveDisplay();

  useEffect(() => {
    document.title = "Todo App";
  }, []);

  // Calculate these values only when tasks change
  const taskStats = useMemo(() => {
    const completedCount = tasks?.filter((task) => task.done).length;
    const completedPercentage = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

    const today = new Date().setHours(0, 0, 0, 0);
    const dueTodayTasks = tasks?.filter((task) => {
      if (task.deadline) {
        const taskDeadline = new Date(task.deadline).setHours(0, 0, 0, 0);
        return taskDeadline === today && !task.done;
      }
      return false;
    });

    const taskNamesDueToday = dueTodayTasks.map((task) => task.name);

    return {
      completedTasksCount: completedCount,
      completedTaskPercentage: completedPercentage,
      tasksWithDeadlineTodayCount: dueTodayTasks.length,
      tasksDueTodayNames: taskNamesDueToday,
    };
  }, [tasks]);

  // Memoize time-based greeting
  const timeGreeting = useMemo(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12 && currentHour >= 5) {
      return "Good morning";
    } else if (currentHour < 18 && currentHour > 12) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  }, []);

  // Memoize task completion text
  const taskCompletionText = useMemo(() => {
    const percentage = taskStats.completedTaskPercentage;
    switch (true) {
      case percentage === 0:
        return "No tasks completed yet. Keep going!";
      case percentage === 100:
        return "Congratulations! All tasks completed!";
      case percentage >= 75:
        return "Almost there!";
      case percentage >= 50:
        return "You're halfway there! Keep it up!";
      case percentage >= 25:
        return "You're making good progress.";
      default:
        return "You're just getting started.";
    }
  }, [taskStats.completedTaskPercentage]);

  const updateShowProgressBar = (value: boolean) => {
    setUser((prevUser) => ({
      ...prevUser,
      settings: {
        ...prevUser.settings,
        showProgressBar: value,
      },
    }));
  };

  return (
    <>
      <Dialog
        open={showTestDialog}
        onClose={() => setShowTestDialog(false)}
        slotProps={{
          paper: {
            style: {
              padding: "12px",
              borderRadius: "24px",
              minWidth: "400px",
            },
          },
        }}
      >
        <CustomDialogTitle
          title="Send Test text"
          subTitle={`Send test text to your voice assistant`}
          onClose={() => setShowTestDialog(false)}
          icon={<CommentBank />}
        />
        <DialogContent sx={{ p: 0, m: 0 }}>
          <Alert severity="info">{transcript}</Alert>
          <InputThemeProvider>
            <StyledInput
              placeholder="text"
              onChange={(e) => setTestText(e.target.value)}
              type="text"
            />
          </InputThemeProvider>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="info"
            fullWidth
            sx={{ mt: "14px" }}
            onClick={() => {
              sendTestText(testText);
              setTestText("");
            }}
          >
            Send Text
          </Button>
        </DialogActions>
      </Dialog>

      <GreetingHeader>
        <Emoji unified="1f44b" emojiStyle={emojisStyle} /> &nbsp; {timeGreeting}
        {name && (
          <span translate="no">
            , <span>{name}</span>
          </span>
        )}
      </GreetingHeader>

      <AnimatedGreeting />

      {!isOnline && (
        <Offline>
          <WifiOff /> You're offline but you can use the app!
        </Offline>
      )}
      {tasks.length > 0 && settings.showProgressBar && (
        <TasksCountContainer>
          <TasksCount glow={settings.enableGlow}>
            <TaskCountClose
              size="small"
              onClick={() => {
                updateShowProgressBar(false);
                showToast(
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    Progress bar hidden. You can enable it in settings.
                    <Button
                      variant="contained"
                      sx={{ p: "12px 32px" }}
                      onClick={() => updateShowProgressBar(true)}
                      startIcon={<UndoRounded />}
                    >
                      Undo
                    </Button>
                  </span>,
                );
              }}
            >
              <CloseRounded />
            </TaskCountClose>
            <Box sx={{ position: "relative", display: "inline-flex" }}>
              <StyledProgress
                variant="determinate"
                value={taskStats.completedTaskPercentage}
                size={64}
                thickness={5}
                aria-label="Progress"
                glow={settings.enableGlow}
              />

              <ProgressPercentageContainer
                glow={settings.enableGlow && taskStats.completedTaskPercentage > 0}
              >
                <Typography
                  variant="caption"
                  component="div"
                  color="white"
                  sx={{ fontSize: "16px", fontWeight: 600 }}
                >{`${Math.round(taskStats.completedTaskPercentage)}%`}</Typography>
              </ProgressPercentageContainer>
            </Box>
            <TaskCountTextContainer>
              <TaskCountHeader>
                {taskStats.completedTasksCount === 0
                  ? `You have ${tasks.length} task${tasks.length > 1 ? "s" : ""} to complete.`
                  : `You've completed ${taskStats.completedTasksCount} out of ${tasks.length} tasks.`}
              </TaskCountHeader>
              <TaskCompletionText>{taskCompletionText}</TaskCompletionText>
              {taskStats.tasksWithDeadlineTodayCount > 0 && (
                <span
                  style={{
                    opacity: 0.8,
                    display: "inline-block",
                  }}
                >
                  <TodayRounded sx={{ fontSize: "20px", verticalAlign: "middle" }} />
                  &nbsp;Tasks due today:&nbsp;
                  <span translate="no">
                    {new Intl.ListFormat("en", { style: "long" }).format(
                      taskStats.tasksDueTodayNames,
                    )}
                  </span>
                </span>
              )}
            </TaskCountTextContainer>
          </TasksCount>
        </TasksCountContainer>
      )}
      <Suspense
        fallback={
          <Box display="flex" justifyContent="center" alignItems="center">
            <CircularProgress />
          </Box>
        }
      >
        <TasksList />
      </Suspense>
      {!isMobile && (
        <Tooltip title={tasks.length > 0 ? "Add New Task" : "Add Task"} placement="left">
          <AddButton
            animate={tasks.length === 0}
            glow={settings.enableGlow}
            onClick={() => n("add")}
            aria-label="Add Task"
          >
            <AddRounded style={{ fontSize: "44px" }} />
          </AddButton>
        </Tooltip>
      )}
      {!isMobile && (
        <Tooltip title={tasks.length > 0 ? "Add New test Task" : "Add test Task"} placement="left">
          <AddButton
            animate={tasks.length === 0}
            glow={settings.enableGlow}
            onClick={() => setShowTestDialog(true)}
            aria-label="Add Task"
            style={{ bottom: "200px" }}
          >
            <AddComment style={{ fontSize: "44px" }} />
          </AddButton>
        </Tooltip>
      )}

      {!isMobile && <VoiceButton glow />}
    </>
  );
};

export default Home;
