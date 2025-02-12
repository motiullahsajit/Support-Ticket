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
} from "@shopify/polaris";
import axios from "axios";

export default function AdminDashboard() {
  const [selected, setSelected] = useState(0);
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [executives, setExecutives] = useState([]);
  const [assignModal, setAssignModal] = useState({
    open: false,
    ticketId: null,
  });
  const [selectedExecutive, setSelectedExecutive] = useState("");
  const [loading, setLoading] = useState(true);

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
    ticket.status,
    ticket.customer_id,
    ticket.executive_id || "Unassigned",
    <Button
      onClick={() => setAssignModal({ open: true, ticketId: ticket.id })}
      disabled={!!ticket.executive_id}
    >
      Assign Executive
    </Button>,
  ]);

  const userRows = users.map((user: any) => [
    user.name,
    user.email,
    <Select
      value={user.role}
      onChange={(value) => handleRoleChange(user.id, value)}
      options={[
        { label: "User", value: "user" },
        { label: "Executive", value: "executive" },
        { label: "Admin", value: "admin" },
      ]}
    />,
  ]);

  return (
    <Page title="Admin Dashboard">
      <Layout>
        <Layout.Section>
          <Card>
            <Tabs tabs={tabs} selected={selected} onSelect={setSelected} />
            {selected === 0 ? (
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
                  "Customer ID",
                  "Executive",
                  "Action",
                ]}
                rows={ticketRows}
                loading={loading}
              />
            ) : (
              <DataTable
                columnContentTypes={["text", "text", "text"]}
                headings={["Name", "Email", "Role"]}
                rows={userRows}
                loading={loading}
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
