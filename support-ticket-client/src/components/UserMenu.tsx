import { useState } from "react";
import { Popover, Box, Avatar, Text, Button } from "@shopify/polaris";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function UserMenu() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [active, setActive] = useState(false);

  const togglePopover = () => setActive(!active);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Popover
      active={active}
      activator={
        <div onClick={togglePopover} style={{ cursor: "pointer" }}>
          <Avatar
            customer
            name={user?.name || ""}
            source={user?.image_url || ""}
          />
        </div>
      }
      onClose={togglePopover}
    >
      <Box padding="200">
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Text as="p" variant="bodyMd">
            username: <strong>{user?.username}</strong>
          </Text>
          <Text as="p" variant="bodyMd">
            email: {user?.email}
          </Text>
          <Text as="p" variant="bodyMd">
            role: {user?.role}
          </Text>
        </div>
        <Box paddingBlockStart="200">
          <Button onClick={handleLogout} {...({ destructive: true } as any)}>
            Logout
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}
