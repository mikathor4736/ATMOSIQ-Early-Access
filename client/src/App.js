import React, { useState } from "react";
import "./App.css";

function App() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setSubmitted(true);
        setForm({ firstName: "", lastName: "", email: "" });
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container">
        <div className="overlay"></div>
        <div className="success-message">
          <h1 className="title">Thank You!</h1>
          <p className="subtitle">Welcome to the ATMOSIQ Family</p>
          <p className="success-text">
            We're excited to have you on board. Check your email for more details!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="overlay"></div>

      <h1 className="title">ATMOS<span className="teal">IQ</span></h1>
      <p className="subtitle">
        AI Weather Intelligence — Coming Soon
      </p>

      <form onSubmit={handleSubmit} className="form">
        <input
          placeholder="First Name"
          value={form.firstName}
          onChange={(e) =>
            setForm({ ...form, firstName: e.target.value })
          }
          required
        />
        <input
          placeholder="Last Name"
          value={form.lastName}
          onChange={(e) =>
            setForm({ ...form, lastName: e.target.value })
          }
          required
        />
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Get Early Access"}
        </button>
      </form>

      <p className="privacy">
        We collect basic technical data (IP & location) to improve service and understand demand.
      </p>
    </div>
  );
}

export default App;