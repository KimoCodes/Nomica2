(function () {
  var form = document.getElementById("signup-form");
  var emailInput = document.getElementById("email");
  var button = document.getElementById("submit-button");
  var message = document.getElementById("form-message");
  var successCard = document.getElementById("success-card");
  var isSubmitting = false;
  var hasSucceeded = false;

  if (!form || !emailInput || !button || !message || !successCard) {
    return;
  }

  function setMessage(text, type) {
    message.textContent = text;
    message.className = "form-message" + (type ? " is-" + type : "");
  }

  function setLoading(loading) {
    isSubmitting = loading;
    button.disabled = loading || hasSucceeded;
    emailInput.disabled = loading || hasSucceeded;
    button.textContent = loading ? "Joining..." : hasSucceeded ? "You're on the list" : "Join Early Access";
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (isSubmitting || hasSucceeded) {
      return;
    }

    var email = emailInput.value.trim().toLowerCase();
    if (!isValidEmail(email)) {
      setMessage("Please enter a valid email address.", "error");
      emailInput.focus();
      return;
    }

    setLoading(true);
    setMessage("Securing your early access spot...", "");

    var body = new URLSearchParams();
    body.set("email", email);
    body.set("company", form.elements.company ? form.elements.company.value : "");

    fetch(form.action, {
      method: "POST",
      body: body.toString(),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then(function (response) {
        return response.json().catch(function () {
          throw new Error("Unexpected server response.");
        }).then(function (payload) {
          if (!response.ok || !payload.success) {
            throw new Error(payload.error || "We could not complete your subscription. Please try again.");
          }
          return payload;
        });
      })
      .then(function () {
        hasSucceeded = true;
        form.hidden = true;
        successCard.hidden = false;
        setMessage("You're on the list. Please check your inbox for confirmation.", "success");
      })
      .catch(function (error) {
        setMessage(error.message || "Something went wrong. Please try again.", "error");
      })
      .finally(function () {
        setLoading(false);
      });
  });
})();
