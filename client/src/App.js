import React, { useState } from "react";
import "./App.css";

function App() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const validationErrors = {};
    const nameRegex = /^[A-Za-z]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nameRegex.test(form.firstName)) {
      validationErrors.firstName = "Please enter letters only, no special characters.";
    }
    if (!nameRegex.test(form.lastName)) {
      validationErrors.lastName = "Please enter letters only, no special characters.";
    }
    if (!emailRegex.test(form.email)) {
      validationErrors.email = "Please check the email format is correct. Example: test@test.com";
    }

    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setAlert({
        type: "danger",
        message: "Please fix the form errors before submitting.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setAlert({
          type: "success",
          message:
            "Success! You have been registered to be alerted when AtmosIQ becomes available! Thank you!",
        });
        setForm({ firstName: "", lastName: "", email: "" });
        setErrors({});
      } else {
        const errorMessage = result.error || "Unable to submit your information.";
        console.error("Signup error:", errorMessage);
        setAlert({
          type: "danger",
          message: `Error: ${errorMessage}`,
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      setAlert({
        type: "danger",
        message: `Error: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="overlay"></div>

      <h1 className="title">ATMOS<span className="teal">IQ</span></h1>
      <p className="subtitle">AI Weather Intelligence — Coming Soon</p>

      <div className="form-wrapper">
        {alert && (
          <div className={`alert alert-${alert.type} w-100`} role="alert">
            {alert.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form needs-validation" noValidate>
          <div className="mb-3">
            <input
              className={`form-control ${errors.firstName ? "is-invalid" : ""}`}
              placeholder="First Name"
              value={form.firstName}
              onChange={(e) =>
                setForm({ ...form, firstName: e.target.value })
              }
              required
            />
            {errors.firstName && (
              <div className="invalid-feedback">{errors.firstName}</div>
            )}
          </div>

          <div className="mb-3">
            <input
              className={`form-control ${errors.lastName ? "is-invalid" : ""}`}
              placeholder="Last Name"
              value={form.lastName}
              onChange={(e) =>
                setForm({ ...form, lastName: e.target.value })
              }
              required
            />
            {errors.lastName && (
              <div className="invalid-feedback">{errors.lastName}</div>
            )}
          </div>

          <div className="mb-3">
            <input
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Processing..." : "Get Early Access"}
          </button>
        </form>
      </div>

      <p className="privacy">
        We collect basic technical data (IP & location) to improve service and understand demand.
      </p>
    </div>
  );
}

export default App;