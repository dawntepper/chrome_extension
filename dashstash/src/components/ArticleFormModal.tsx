import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { Article } from "../popup/types/shared-types";

interface ArticleFormModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (article: Partial<Article>) => void;
  title: string;
  article: Partial<Article> | null;
}

const ArticleFormModal: React.FC<ArticleFormModalProps> = ({
  show,
  onHide,
  onSubmit,
  title,
  article,
}) => {
  const [formData, setFormData] = useState<Partial<Article>>({
    url: "",
    title: "",
    description: "",
    tags: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (article) {
      setFormData({
        url: article.url || "",
        title: article.title || "",
        description: article.description || "",
        tags: article.tags || [],
      });
    } else {
      setFormData({
        url: "",
        title: "",
        description: "",
        tags: [],
      });
    }
    setError(null);
  }, [article, show]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onHide();
    } catch (err) {
      setError("Failed to save the article. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>URL</Form.Label>
            <Form.Control
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              required
              isInvalid={!!formData.url && !isValidUrl(formData.url)}
            />
            <Form.Control.Feedback type="invalid">
              Please enter a valid URL.
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Tags (comma-separated)</Form.Label>
            <Form.Control
              type="text"
              name="tags"
              value={formData.tags?.join(", ")}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  tags: e.target.value.split(",").map((tag) => tag.trim()),
                }))
              }
            />
          </Form.Group>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ArticleFormModal;
