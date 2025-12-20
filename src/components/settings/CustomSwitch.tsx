import React, { useContext } from "react";
import { Box, Switch, Typography, FormControlLabel, FormGroup } from "@mui/material";
import { User } from "../../types/user";
import { UserContext } from "../../contexts/UserContext";
import { InfoOutlined } from "@mui/icons-material";
import { updateProfile } from "../../api/auth";
import { showToast } from "../../utils";

interface CustomSwitchProps {
  header: string;
  text?: string;
  disabled?: boolean;
  disabledReason?: string;
  settingKey: keyof {
    [K in keyof User["settings"] as User["settings"][K] extends boolean ? K : never]: never;
  }; // get boolean keys only
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({
  header,
  text,
  settingKey,
  disabled,
  disabledReason,
}) => {
  const { user, setUser } = useContext(UserContext);

  const handleToggle = async () => {
    const updatedSettings = {
      ...user.settings,
      [settingKey]: !user.settings[settingKey],
    };
    const res = await updateProfile({
      settings: updatedSettings,
    }).catch(() => {
      showToast("Failed to update settings", { type: "error" });
    });

    if (res) {
      setUser((prev) => ({ ...prev, settings: res.settings }));
    }
  };

  return (
    <Box
      sx={{ my: 2, mx: 1, display: "flex", flexDirection: "column", opacity: disabled ? 0.6 : 1 }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary", fontSize: "16px" }}>
          {header}
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={user.settings[settingKey]}
                onChange={handleToggle}
                onKeyUp={(e) => {
                  if (e.key === "Enter" && !disabled) {
                    e.preventDefault();
                    handleToggle();
                  }
                }}
                disabled={disabled}
              />
            }
            label=""
          />
        </FormGroup>
      </Box>
      {text && (
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0 }}>
          {text}
        </Typography>
      )}
      {disabled && disabledReason && (
        <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
          <InfoOutlined fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="caption">{disabledReason}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default CustomSwitch;
