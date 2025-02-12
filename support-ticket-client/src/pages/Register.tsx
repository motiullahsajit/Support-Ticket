import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Page,
  Card,
  FormLayout,
  TextField,
  Button,
  Text,
  Link,
  Banner,
} from "@shopify/polaris";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (value: string, id: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/auth/register", {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <div className="max-w-md mx-auto mt-20">
        <Card>
          <div>
            <Text variant="headingLg" as="h1">
              Register New Account
            </Text>
          </div>
          <form onSubmit={handleSubmit}>
            <FormLayout>
              {error && <Banner title={error} />}

              <TextField
                label="Name *"
                value={formData.name}
                onChange={(value) => handleChange(value, "name")}
                autoComplete="name"
              />

              <TextField
                label="Username *"
                value={formData.username}
                onChange={(value) => handleChange(value, "username")}
                autoComplete="username"
              />

              <TextField
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(value) => handleChange(value, "email")}
                autoComplete="email"
              />

              <TextField
                label="Password *"
                type="password"
                value={formData.password}
                onChange={(value) => handleChange(value, "password")}
                autoComplete="new-password"
              />

              <TextField
                label="Confirm Password *"
                type="password"
                value={formData.confirmPassword}
                onChange={(value) => handleChange(value, "confirmPassword")}
                autoComplete="new-password"
              />

              <Button submit loading={loading}>
                Register
              </Button>

              <div className="text-center mt-4">
                <Link url="/login">Already have an account? Login</Link>
              </div>
            </FormLayout>
          </form>
        </Card>
      </div>
    </Page>
  );
}
