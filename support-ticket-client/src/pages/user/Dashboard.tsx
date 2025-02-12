import { useState, useEffect } from "react";
import {
  Page,
  Layout,
  Card,
  Button,
  DataTable,
  Modal,
  FormLayout,
  TextField,
  Spinner,
  Text,
  Select,
} from "@shopify/polaris";
import axios from "axios";
import { useAuthStore } from "../../store/authStore";
import UserMenu from "../../components/UserMenu";

export default function UserDashboard() {
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<any>(null);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/tickets/user/${user?.id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTickets(response.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (isEditMode && currentTicket) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/tickets/${currentTicket.id}`,
          {
            subject: newTicket.subject,
            description: newTicket.description,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/tickets`,
          {
            ...newTicket,
            customer_id: user?.id,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }

      setIsModalOpen(false);
      setNewTicket({ subject: "", description: "" });
      setIsEditMode(false);
      setCurrentTicket(null);
      fetchTickets();
    } catch (error) {
      console.error("Error processing ticket:", error);
    }
  };

  const handleEdit = (ticket: any) => {
    setIsEditMode(true);
    setCurrentTicket(ticket);
    setNewTicket({ subject: ticket.subject, description: ticket.description });
    setIsModalOpen(true);
  };

  const handleDelete = async (ticketId: number) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/tickets/${ticketId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchTickets();
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? ticket.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const rows = filteredTickets.map((ticket: any) => [
    ticket.subject,
    ticket.description,
    ticket.status,
    new Date(ticket.created_at).toLocaleDateString(),
    ticket.executive_id ? "Assigned" : "Pending",
    <div style={{ display: "flex", gap: "8px" }}>
      <Button onClick={() => handleEdit(ticket)}>Edit</Button>
      <Button onClick={() => handleDelete(ticket.id)}>Delete</Button>
    </div>,
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
            My Support Tickets
          </Text>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <Select
              label=""
              labelHidden
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              options={[
                { label: "All Status", value: "" },
                { label: "Open", value: "open" },
                { label: "Resolved", value: "resolved" },
                { label: "Closed", value: "closed" },
              ]}
            />
            <TextField
              label="Search"
              labelHidden
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(value) => setSearchTerm(value)}
              autoComplete="off"
            />

            <Button onClick={() => setIsModalOpen(true)}>
              Create New Ticket
            </Button>
            <UserMenu />
          </div>
        </div>
      </div>

      <Layout>
        <Layout.Section>
          <Card>
            {loading ? (
              <Spinner size="large" accessibilityLabel="Loading tickets..." />
            ) : (
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
                  "Created At",
                  "Assignment",
                  "Actions",
                ]}
                rows={rows}
              />
            )}
          </Card>
        </Layout.Section>

        <Modal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setIsEditMode(false);
            setCurrentTicket(null);
            setNewTicket({ subject: "", description: "" });
          }}
          title={isEditMode ? "Edit Ticket" : "Create New Support Ticket"}
          primaryAction={{
            content: isEditMode ? "Update" : "Submit",
            onAction: handleSubmit,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: () => {
                setIsModalOpen(false);
                setIsEditMode(false);
                setCurrentTicket(null);
                setNewTicket({ subject: "", description: "" });
              },
            },
          ]}
        >
          <Modal.Section>
            <FormLayout>
              <TextField
                label="Subject"
                value={newTicket.subject}
                onChange={(value) =>
                  setNewTicket((prev) => ({ ...prev, subject: value }))
                }
                autoComplete="off"
              />
              <TextField
                label="Description"
                value={newTicket.description}
                onChange={(value) =>
                  setNewTicket((prev) => ({ ...prev, description: value }))
                }
                multiline={4}
                autoComplete="off"
              />
            </FormLayout>
          </Modal.Section>
        </Modal>
      </Layout>
    </Page>
  );
}
