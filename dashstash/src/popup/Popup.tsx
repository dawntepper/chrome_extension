import React, { useState, useEffect, useCallback } from "react";
import { Button, Form, ListGroup, Tab, Tabs } from "react-bootstrap";
import ArticleFormModal from "../../src/components/ArticleFormModal";
import { Article } from "../popup/types/shared-types";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

interface TabData {
  id?: number;
  title: string;
  url: string;
}

const Popup: React.FC = () => {
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [selectedTabs, setSelectedTabs] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [articleToAdd, setArticleToAdd] = useState<Partial<Article> | null>(
    null
  );
  const { user } = useAuth();

  const queryTabs = useCallback(async () => {
    try {
      const result = await chrome.tabs.query({ currentWindow: true });
      const tabData: TabData[] = result.map((tab) => ({
        id: tab.id,
        title: tab.title || "",
        url: tab.url || "",
      }));
      setTabs(tabData);
    } catch (error) {
      console.error("Error querying tabs:", error);
    }
  }, []);

  const getCurrentTab = useCallback(async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab && tab.url) {
        setCurrentUrl(tab.url);
      }
    } catch (error) {
      console.error("Error getting current tab:", error);
    }
  }, []);

  useEffect(() => {
    queryTabs();
    getCurrentTab();
  }, [queryTabs, getCurrentTab]);

  const handleTabSelection = (tabId: number | undefined) => {
    if (tabId === undefined) return;
    setSelectedTabs((prev) =>
      prev.includes(tabId)
        ? prev.filter((id) => id !== tabId)
        : [...prev, tabId]
    );
  };

  const handleSaveTabs = async () => {
    setIsLoading(true);
    try {
      const tabsToSave = tabs.filter(
        (tab) => tab.id !== undefined && selectedTabs.includes(tab.id)
      );
      await saveArticles(tabsToSave.map(tabToArticle));
      alert("Tabs saved successfully!");
      setSelectedTabs([]);
    } catch (error) {
      console.error("Error saving tabs:", error);
      alert("Failed to save tabs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCurrentUrl = () => {
    setArticleToAdd({
      url: currentUrl,
      title: "",
      description: "",
      tags: [],
    });
    setShowAddModal(true);
  };

  const handleSaveManualUrl = () => {
    if (!manualUrl) {
      alert("Please enter a URL");
      return;
    }
    setArticleToAdd({
      url: manualUrl,
      title: "",
      description: "",
      tags: [],
    });
    setShowAddModal(true);
  };

  const saveArticles = async (articles: Partial<Article>[]) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("articles")
      .insert(
        articles.map((article) => ({
          ...article,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))
      )
      .select();

    if (error) throw error;
    return data;
  };

  const tabToArticle = (tab: TabData): Partial<Article> => ({
    url: tab.url,
    title: tab.title,
  });

  const handleAddArticle = async (article: Partial<Article>) => {
    setIsLoading(true);
    try {
      await saveArticles([article]);
      alert("Article saved successfully!");
      setShowAddModal(false);
      setManualUrl("");
      await queryTabs(); // Refresh the tab list
    } catch (error) {
      console.error("Error saving article:", error);
      alert("Failed to save article. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const convertToArticle = (
    article: Partial<Article> | null
  ): Article | null => {
    if (!article) return null;
    return {
      id: article.id || "", // Ensure id is always a string
      title: article.title || "",
      description: article.description || "",
      tags: article.tags || [],
      url: article.url || "",
      created_at: article.created_at || new Date().toISOString(),
      updated_at: article.updated_at || new Date().toISOString(),
      user_id: article.user_id || "",
    };
  };

  return (
    <div style={{ width: "300px", padding: "10px" }}>
      <h1 className="h4 mb-3">DashStash</h1>
      <Tabs defaultActiveKey="current" className="mb-3">
        <Tab eventKey="current" title="Current">
          <p className="text-truncate mb-2">Current URL: {currentUrl}</p>
          <Button
            variant="primary"
            className="w-100 mb-3"
            onClick={handleSaveCurrentUrl}
            disabled={isLoading || !currentUrl}
          >
            {isLoading ? "Saving..." : "Save Current URL"}
          </Button>
        </Tab>
        <Tab eventKey="manual" title="Manual">
          <Form.Group className="mb-3">
            <Form.Control
              type="url"
              placeholder="Paste URL here"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
            />
          </Form.Group>
          <Button
            variant="primary"
            className="w-100 mb-3"
            onClick={handleSaveManualUrl}
            disabled={isLoading || !manualUrl}
          >
            {isLoading ? "Saving..." : "Save Manual URL"}
          </Button>
        </Tab>
        <Tab eventKey="tabs" title="Tabs">
          <Form>
            <ListGroup>
              {tabs.map((tab) => (
                <ListGroup.Item key={tab.id}>
                  <Form.Check
                    type="checkbox"
                    id={`tab-${tab.id}`}
                    label={tab.title}
                    checked={
                      tab.id !== undefined && selectedTabs.includes(tab.id)
                    }
                    onChange={() => handleTabSelection(tab.id)}
                  />
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Form>
          <Button
            variant="primary"
            className="mt-3 w-100"
            onClick={handleSaveTabs}
            disabled={selectedTabs.length === 0 || isLoading}
          >
            {isLoading ? "Saving..." : "Save Selected Tabs"}
          </Button>
        </Tab>
      </Tabs>
      <ArticleFormModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onSubmit={handleAddArticle}
        title="Add New Article"
        article={articleToAdd}
      />
    </div>
  );
};

export default Popup;
