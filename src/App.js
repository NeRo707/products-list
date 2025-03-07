import "./App.css";
import React, { useEffect, useState } from "react";
import { marked } from "marked";

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};

const App = () => {
  const [code, setCode] = useLocalStorage("markdown-content", "## Hello");
  const [compiled, setCompiled] = useState('<h2 id="hello">Hello</h2>');
  const [activeTab, setActiveTab] = useState("markdown"); // 'markdown', 'preview', or 'docs'
  const [docs, setDocs] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocs = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          "https://www.markdownguide.org/api/v1/basic-syntax.json"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setDocs(data);
      } catch (error) {
        console.error("Error fetching docs:", error);
        setError("Failed to load documentation. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === "docs" && !docs && !isLoading) {
      fetchDocs();
    }
  }, [activeTab, docs, isLoading]);

  useEffect(() => {
    setCompiled(marked.parse(code));
  }, [code]);

  const handleChange = (e) => {
    setCode(e.target.value);
  };

  return (
    <>
      <h1>MarkDown Previewer React App</h1>
      <div className="container">
        <div className="btns">
          <button
            onClick={() => setActiveTab("markdown")}
            className={activeTab === "markdown" ? "btn active" : "btn"}
          >
            MarkDown
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={activeTab === "preview" ? "btn active" : "btn"}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={activeTab === "docs" ? "btn active" : "btn"}
          >
            Docs
          </button>
        </div>

        {activeTab === "markdown" && (
          <div>
            <textarea onChange={handleChange} value={code} />
          </div>
        )}

        {activeTab === "preview" && <textarea value={compiled} readOnly />}

        {activeTab === "docs" && (
          <div className="docs-container">
            {isLoading && <p>Loading documentation...</p>}
            {error && <p className="error">{error}</p>}
            {docs && (
              <div className="docs">
                <h2>{docs.title}</h2>
                <p>{docs.intro}</p>
                <ul>
                  {docs.basic_syntax.map((item, index) => (
                    <li key={index}>
                      <h3>{item.element}</h3>
                      <p>{item.description}</p>
                      {item.examples &&
                        item.examples.map((example, idx) => (
                          <div key={idx} className="example">
                            <h4>Example:</h4>
                            <pre>{example.markdown}</pre>
                            <p>Renders as:</p>
                            <div
                              dangerouslySetInnerHTML={{ __html: example.html }}
                            />
                          </div>
                        ))}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default App;
