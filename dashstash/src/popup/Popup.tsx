import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Alert,
  Spinner,
  Card,
  ListGroup,
  Nav,
} from "react-bootstrap";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { Provider } from "@supabase/supabase-js";

interface Tab {
  id: number;
  url: string;
  title: string;
}

const Popup: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<Tab | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const [allTabs, setAllTabs] = useState<Tab[]>([]);
  const [selectedTabs, setSelectedTabs] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const { user, signIn, signInWithOAuth, signOut } = useAuth();

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        setCurrentTab({
          id: tabs[0].id || 0,
          url: tabs[0].url || "",
          title: tabs[0].title || "",
        });
      }
    });

    chrome.tabs.query({}, (tabs) => {
      const tabData = tabs.map((tab) => ({
        id: tab.id || 0,
        url: tab.url || "",
        title: tab.title || "",
      }));
      setAllTabs(tabData);
      setSelectedTabs(selectAll ? tabData.map((tab) => tab.id) : []);
    });
  }, [selectAll]);

  const handleSaveUrl = async (url: string, title: string = "") => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!user) throw new Error("You must be logged in to save URLs");

      const { data, error } = await supabase
        .from("articles")
        .insert([{ url, title, user_id: user.id }]);

      if (error) throw error;

      setSuccess(`Successfully saved: ${url}`);
      setManualUrl("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSelectedTabs = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!user) throw new Error("You must be logged in to save tabs");

      const tabsToSave = allTabs.filter((tab) => selectedTabs.includes(tab.id));
      const { data, error } = await supabase.from("articles").insert(
        tabsToSave.map((tab) => ({
          url: tab.url,
          title: tab.title,
          user_id: user.id,
        }))
      );

      if (error) throw error;

      setSuccess(`Successfully saved ${tabsToSave.length} tabs`);
      setSelectedTabs([]);
      setSelectAll(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTabSelection = (tabId: number) => {
    setSelectedTabs((prev) =>
      prev.includes(tabId)
        ? prev.filter((id) => id !== tabId)
        : [...prev, tabId]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectAll(e.target.checked);
    setSelectedTabs(e.target.checked ? allTabs.map((tab) => tab.id) : []);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during sign in"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithOAuth("google" as Provider);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during Google sign in"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signOut();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during sign out"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openWebApp = () => {
    chrome.tabs.create({ url: "https://your-web-app-url.com" });
  };

  if (!user) {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <h1 className="h4 mb-4 text-center">DashStash Login</h1>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleEmailSignIn} className="mb-3">
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button
              type="submit"
              variant="primary"
              className="w-100"
              disabled={isLoading}
            >
              {isLoading ? <Spinner animation="border" size="sm" /> : "Sign In"}
            </Button>
          </Form>
          <Button
            onClick={handleGoogleSignIn}
            variant="outline-primary"
            className="w-100 mb-3"
          >
            Sign In with Google
          </Button>
          <Button onClick={openWebApp} variant="link" className="w-100">
            Open Web App to Create Account
          </Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="p-4">
        <h1 className="h4 mb-4 text-center">DashStash</h1>
        <p className="text-center mb-4">Logged in as: {user.email}</p>
        <Button
          onClick={handleSignOut}
          variant="outline-danger"
          className="w-100 mb-4"
        >
          Sign Out
        </Button>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form className="mb-4">
          <Form.Group className="mb-3">
            <Form.Label>Current Tab</Form.Label>
            <Form.Control type="text" value={currentTab?.url || ""} readOnly />
          </Form.Group>
          <Button
            variant="primary"
            onClick={() =>
              currentTab && handleSaveUrl(currentTab.url, currentTab.title)
            }
            disabled={isLoading || !currentTab}
            className="w-100"
          >
            {isLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                <span className="ms-2">Saving...</span>
              </>
            ) : (
              "Save Current Tab"
            )}
          </Button>
        </Form>

        <Form className="mb-4">
          <Form.Group className="mb-3">
            <Form.Label>Manual URL Entry</Form.Label>
            <Form.Control
              type="url"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </Form.Group>
          <Button
            variant="outline-primary"
            onClick={() => handleSaveUrl(manualUrl)}
            disabled={isLoading || !manualUrl}
            className="w-100"
          >
            {isLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                <span className="ms-2">Saving...</span>
              </>
            ) : (
              "Save Manual URL"
            )}
          </Button>
        </Form>

        <Form className="mb-4">
          <Form.Label>Select Tabs to Save</Form.Label>
          <Form.Check
            type="checkbox"
            id="select-all"
            label="Select All Tabs"
            checked={selectAll}
            onChange={handleSelectAll}
            className="mb-2"
          />
          <ListGroup
            className="mb-3"
            style={{ maxHeight: "200px", overflowY: "auto" }}
          >
            {allTabs.map((tab) => (
              <ListGroup.Item
                key={tab.id}
                className="d-flex align-items-center"
              >
                <Form.Check
                  type="checkbox"
                  id={`tab-${tab.id}`}
                  checked={selectedTabs.includes(tab.id)}
                  onChange={() => toggleTabSelection(tab.id)}
                  label={tab.title}
                />
              </ListGroup.Item>
            ))}
          </ListGroup>
          <Button
            variant="success"
            onClick={handleSaveSelectedTabs}
            disabled={isLoading || selectedTabs.length === 0}
            className="w-100"
          >
            {isLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                <span className="ms-2">Saving...</span>
              </>
            ) : (
              `Save Selected Tabs (${selectedTabs.length})`
            )}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default Popup;
