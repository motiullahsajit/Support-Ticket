import { useState, useEffect } from "react";
import {
  Page,
  Layout,
  Card,
  Tabs,
  DataTable,
  Button,
  Modal,
  Select,
  Spinner,
  Text,
  Box,
} from "@shopify/polaris";
import axios from "axios";
import UserMenu from "../../components/UserMenu";

interface AssignModalState {
  open: boolean;
  ticketId: number | null;
}

export default function AdminDashboard() {
  const [selected, setSelected] = useState<number>(0);
  const [tickets, setTickets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [executives, setExecutives] = useState<any[]>([]);
  const [assignModal, setAssignModal] = useState<AssignModalState>({
    open: false,
    ticketId: null,
  });
  const [selectedExecutive, setSelectedExecutive] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ticketsRes, usersRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/tickets`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
      ]);

      setTickets(ticketsRes.data);
      setUsers(usersRes.data);
      setExecutives(
        usersRes.data.filter((user: any) => user.role === "executive")
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignExecutive = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/tickets/${
          assignModal.ticketId
        }/assign`,
        { executive_id: selectedExecutive },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setAssignModal({ open: false, ticketId: null });
      fetchData();
    } catch (error) {
      console.error("Error assigning executive:", error);
    }
  };

  const handleUnassignExecutive = async (ticketId: number) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/tickets/${ticketId}/manage`,
        { executive_id: null },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchData();
    } catch (error) {
      console.error("Error unassigning executive:", error);
    }
  };

  const handleStatusChange = async (ticketId: number, newStatus: string) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/tickets/${ticketId}/manage`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/${userId}/role`,
        { role: newRole },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchData();
    } catch (error) {
      console.error("Error changing role:", error);
    }
  };

  const tabs = [
    {
      id: "tickets",
      content: "All Tickets",
      accessibilityLabel: "All Tickets",
      panelID: "tickets-panel",
    },
    {
      id: "users",
      content: "User Management",
      accessibilityLabel: "User Management",
      panelID: "users-panel",
    },
  ];

  const ticketRows = tickets.map((ticket: any) => [
    ticket.subject,
    ticket.description,
    ticket.customer_username.toString(),
    ticket.executive_username
      ? ticket.executive_username.toString()
      : "Unassigned",
    <Select
      label="Status"
      labelHidden
      value={ticket.status}
      onChange={(value) => handleStatusChange(ticket.id, value)}
      options={[
        { label: "Open", value: "open" },
        { label: "Resolved", value: "resolved" },
        { label: "Closed", value: "closed" },
      ]}
    />,
    <div style={{ display: "flex", gap: "8px" }}>
      {!ticket.executive_id ? (
        <Button
          onClick={() => setAssignModal({ open: true, ticketId: ticket.id })}
        >
          Assign Executive
        </Button>
      ) : (
        <Button onClick={() => handleUnassignExecutive(ticket.id)}>
          Unassign Executive
        </Button>
      )}
    </div>,
  ]);

  const userRows = users.map((user: any) => [
    user.name,
    user.email,
    <Select
      key={user.id}
      label="Role"
      labelHidden
      value={user.role}
      onChange={(value: string) => handleRoleChange(user.id, value)}
      options={[
        { label: "User", value: "user" },
        { label: "Executive", value: "executive" },
        { label: "Admin", value: "admin" },
      ]}
    />,
  ]);

  return (
    <Page>
      <div
        style={{
          backgroundColor: "#f4f6f8",
          padding: "16px",
          borderBottom: "1px solid #e5e5e5",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text as="h1" variant="headingXl">
            Admin Dashboard
          </Text>
          <UserMenu />
        </div>
      </div>
      <Layout>
        <Layout.Section>
          <Card>
            <Tabs tabs={tabs} selected={selected} onSelect={setSelected} />
            {loading ? (
              <Box padding="200">
                <Spinner size="large" accessibilityLabel="Loading data..." />
              </Box>
            ) : selected === 0 ? (
              <DataTable
                columnContentTypes={[
                  "text",
                  "text",
                  "text",
                  "text",
                  "text",
                  "text",
                ]}
                headings={[
                  "Subject",
                  "Description",
                  "Status",
                  "Customer",
                  "Executive",
                  "Action",
                ]}
                rows={ticketRows}
              />
            ) : (
              <DataTable
                columnContentTypes={["text", "text", "text"]}
                headings={["Name", "Email", "Role"]}
                rows={userRows}
              />
            )}
          </Card>
        </Layout.Section>

        <Modal
          open={assignModal.open}
          onClose={() => setAssignModal({ open: false, ticketId: null })}
          title="Assign Executive"
          primaryAction={{
            content: "Assign",
            onAction: handleAssignExecutive,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: () => setAssignModal({ open: false, ticketId: null }),
            },
          ]}
        >
          <Modal.Section>
            <Select
              label="Select Executive"
              options={executives.map((exec: any) => ({
                label: exec.name,
                value: exec.id.toString(),
              }))}
              onChange={setSelectedExecutive}
              value={selectedExecutive}
            />
          </Modal.Section>
        </Modal>
      </Layout>
    </Page>
  );
}
