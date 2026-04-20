import React, { useState } from "react";
import "./App.css";

function App() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    alert("You're on the list.");
  };

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
          onChange={(e) =>
            setForm({ ...form, firstName: e.target.value })
          }
        />
        <input
          placeholder="Last Name"
          onChange={(e) =>
            setForm({ ...form, lastName: e.target.value })
          }
        />
        <input
          placeholder="Email"
          type="email"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <button type="submit">Get Early Access</button>
      </form>

      <p className="privacy">
        We collect basic technical data (IP & location) to improve service and understand demand.
      </p>
    </div>
  );
}

export default App;