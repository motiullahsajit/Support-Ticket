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
} from "@shopify/polaris";
import axios from "axios";
import { useAuthStore } from "../../store/authStore";
import UserMenu from "../../components/UserMenu";

export default function UserDashboard() {
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
  });
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
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/tickets`,
        {
          ...newTicket,
          customer_id: user?.id,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setIsModalOpen(false);
      setNewTicket({ subject: "", description: "" });
      fetchTickets();
    } catch (error) {
      console.error("Error creating ticket:", error);
    }
  };

  const rows = tickets.map((ticket: any) => [
    ticket.subject,
    ticket.description,
    ticket.status,
    new Date(ticket.created_at).toLocaleDateString(),
    ticket.executive_id ? "Assigned" : "Pending",
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
                columnContentTypes={["text", "text", "text", "text", "text"]}
                headings={[
                  "Subject",
                  "Description",
                  "Status",
                  "Created At",
                  "Assignment",
                ]}
                rows={rows}
              />
            )}
          </Card>
        </Layout.Section>

        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Support Ticket"
          primaryAction={{
            content: "Submit",
            onAction: handleSubmit,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: () => setIsModalOpen(false),
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
