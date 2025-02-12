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
  Banner, // Used for error display
} from "@shopify/polaris";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);

      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <div className="max-w-md mx-auto mt-20">
        {/* Use the "sectioned" prop on Card instead of Card.Section */}
        <Card>
          <div>
            <Text variant="headingLg" as="h1">
              Login to Support System
            </Text>
          </div>

          <form onSubmit={handleSubmit}>
            <FormLayout>
              {/* Replace error text with a Banner or remove the color prop */}
              {error && <Banner title={error} />}

              <TextField
                label="Email *"
                type="email"
                value={email}
                onChange={setEmail}
                autoComplete="email"
              />

              <TextField
                label="Password *"
                type="password"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
              />

              {/* Remove the primary prop as it's not supported */}
              <Button submit loading={loading}>
                Login
              </Button>

              <div className="text-center mt-4">
                <Link url="/register">Don't have an account? Register</Link>
              </div>
            </FormLayout>
          </form>
        </Card>
      </div>
    </Page>
  );
}
