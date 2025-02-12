import { useState, useEffect } from "react";
import {
  Page,
  Layout,
  Card,
  DataTable,
  Button,
  Modal,
  Select,
} from "@shopify/polaris";
import axios from "axios";
import { useAuthStore } from "../../store/authStore";

export default function ExecutiveDashboard() {
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState([]);
  const [statusModal, setStatusModal] = useState({ open: false, ticket: null });
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedTickets();
  }, []);

  const fetchAssignedTickets = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/tickets/executive/${user?.id}`,
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

  const handleStatusUpdate = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/tickets/${
          statusModal.ticket?.id
        }/status`,
        { status: selectedStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setStatusModal({ open: false, ticket: null });
      fetchAssignedTickets();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const rows = tickets.map((ticket: any) => [
    ticket.subject,
    ticket.description,
    ticket.status,
    new Date(ticket.created_at).toLocaleDateString(),
    <Button
      onClick={() => {
        setSelectedStatus(ticket.status);
        setStatusModal({ open: true, ticket });
      }}
    >
      Update Status
    </Button>,
  ]);

  return (
    <Page title="Executive Dashboard - Assigned Tickets">
      <Layout>
        <Layout.Section>
          <Card>
            <DataTable
              columnContentTypes={["text", "text", "text", "text", "text"]}
              headings={[
                "Subject",
                "Description",
                "Status",
                "Created At",
                "Action",
              ]}
              rows={rows}
              loading={loading}
            />
          </Card>
        </Layout.Section>

        <Modal
          open={statusModal.open}
          onClose={() => setStatusModal({ open: false, ticket: null })}
          title="Update Ticket Status"
          primaryAction={{
            content: "Update",
            onAction: handleStatusUpdate,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: () => setStatusModal({ open: false, ticket: null }),
            },
          ]}
        >
          <Modal.Section>
            <Select
              label="Select Status"
              options={[
                { label: "Open", value: "open" },
                { label: "Resolved", value: "resolved" },
                { label: "Closed", value: "closed" },
              ]}
              onChange={setSelectedStatus}
              value={selectedStatus}
            />
          </Modal.Section>
        </Modal>
      </Layout>
    </Page>
  );
}
