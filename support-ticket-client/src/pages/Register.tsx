import { useState, ChangeEvent, FormEvent } from "react";
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
  Spinner,
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
    image_url: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoPrev, setPhotoPrev] = useState<string>("");
  const [photo, setPhoto] = useState<File | undefined>(undefined);

  const handleChange = (value: string, id: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const changeImageHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const file: File | undefined = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setPhotoPrev(reader.result);
          setPhoto(file);
        }
      };
    }
  };

  const uploadImageToImgBB = async (imageFile: File): Promise<string> => {
    const formDataUpload = new FormData();
    formDataUpload.append("image", imageFile);
    try {
      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${
          import.meta.env.VITE_IMGBB_API_KEY
        }`,
        formDataUpload
      );
      return response.data.data.url;
    } catch (error) {
      console.error("Error uploading to ImgBB", error);
      throw error;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      let imageUrl = "";
      if (photo) {
        setUploading(true);
        imageUrl = await uploadImageToImgBB(photo);
        setUploading(false);
      }
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        image_url: imageUrl,
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
              {error && (
                <Banner title={error} {...({ status: "critical" } as any)} />
              )}
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

              <div>
                <label
                  htmlFor="image-upload"
                  style={{ marginBottom: "0.5rem", display: "block" }}
                >
                  Upload Profile Image
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={changeImageHandler}
                />
                {uploading && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: "8px",
                    }}
                  >
                    <Spinner
                      size="small"
                      accessibilityLabel="Uploading image..."
                    />
                    <div style={{ marginLeft: "8px" }}>
                      <Text variant="bodyMd" as="p">
                        Uploading image...
                      </Text>
                    </div>
                  </div>
                )}
                {photoPrev && (
                  <img
                    src={photoPrev}
                    alt="Uploaded Preview"
                    style={{ width: "100px", marginTop: "10px" }}
                  />
                )}
              </div>

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
