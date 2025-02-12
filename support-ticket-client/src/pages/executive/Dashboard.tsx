import { useState, useEffect } from "react";
import {
  Page,
  Layout,
  Card,
  DataTable,
  Button,
  Modal,
  Select,
  Spinner,
  Text,
  TextField,
} from "@shopify/polaris";
import axios from "axios";
import { useAuthStore } from "../../store/authStore";
import UserMenu from "../../components/UserMenu";

export default function ExecutiveDashboard() {
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<any[]>([]);
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    ticket: any | null;
  }>({
    open: false,
    ticket: null,
  });
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

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
    <Button
      key={ticket.id}
      onClick={() => {
        setSelectedStatus(ticket.status);
        setStatusModal({ open: true, ticket });
      }}
    >
      Update Status
    </Button>,
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
            Executive Dashboard
          </Text>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <TextField
              label="Search"
              labelHidden
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(value: string) => setSearchTerm(value)}
              autoComplete="off"
            />

            <Select
              label="filter"
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
                  "Action",
                ]}
                rows={rows}
              />
            )}
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
