import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Badge, Spinner, Alert } from "react-bootstrap";
import { Article } from "../popup/types/shared-types";
interface ArticleFormData {
  title: string;
  description: string;
  url: string;
  tags: string[];
  imageUrl: string;
  site_name: string;
}

interface ArticleFormModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (article: ArticleFormData) => Promise<void>;
  title: string;
  article: Article | null;
}

const ArticleFormModal: React.FC<ArticleFormModalProps> = ({
  show,
  onHide,
  onSubmit,
  title,
  article,
}) => {
  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    description: "",
    url: "",
    tags: [],
    imageUrl: "",
    site_name: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      resetForm();
      if (article) {
        setFormData({
          title: article.title || "",
          description: article.description || "",
          url: article.url || "",
          tags: article.tags || [],
          imageUrl: article.imageUrl ? article.imageUrl : "",
          site_name: article.site_name ? article.site_name : "", // Check if site_name exists
        });
        setTagInput(article.tags.join(", "));
      }
    }
  }, [article, show]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      url: "",
      tags: [],
      imageUrl: "",
      site_name: "",
    });
    setTagInput("");
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!formData.url.trim()) {
      setError("URL is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setSuccessMessage("Article saved successfully!");
      setTimeout(() => {
        onHide();
        resetForm();
      }, 1500);
    } catch (err) {
      setError("Failed to save article. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
    const tags = e.target.value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");
    setFormData((prev) => ({ ...prev, tags }));
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
    setTagInput((prev) =>
      prev
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== tagToRemove)
        .join(", ")
    );
  };

  const handleFetchMetadata = async () => {
    if (!formData.url) {
      setError("Please enter a URL first.");
      return;
    }

    setIsFetchingMetadata(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.microlink.io?url=${encodeURIComponent(formData.url)}`
      );
      const data = await response.json();

      if (data.status === "success") {
        setFormData((prev) => ({
          ...prev,
          title: data.data.title || prev.title,
          description:
            data.data.description === "You've been blocked by network security."
              ? "Add your description here"
              : data.data.description || prev.description,
          imageUrl: data.data.image?.url || prev.imageUrl,
          site_name: data.data.publisher || prev.site_name,
        }));
      } else {
        setError("Failed to fetch metadata. Please enter details manually.");
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
      setError("An error occurred while fetching metadata. Please try again.");
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>URL</Form.Label>
            <div className="d-flex">
              <Form.Control
                type="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                required
              />
              <Button
                variant="outline-secondary"
                onClick={handleFetchMetadata}
                disabled={isFetchingMetadata || !formData.url}
                className="ms-2"
              >
                {isFetchingMetadata ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Fetch"
                )}
              </Button>
            </div>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Website Name</Form.Label>
            <Form.Control
              type="text"
              name="site_name"
              value={formData.site_name}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Image URL</Form.Label>
            <Form.Control
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              placeholder="Enter image URL (optional)"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Tags (comma-separated)</Form.Label>
            <Form.Control
              type="text"
              value={tagInput}
              onChange={handleTagInputChange}
              placeholder="Enter tags, separated by commas"
            />
            <div className="mt-2">
              {formData.tags.map((tag) => (
                <Badge
                  key={tag}
                  bg="secondary"
                  className="me-1 mb-1"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag} &times;
                </Badge>
              ))}
            </div>
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={onHide} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ArticleFormModal;
