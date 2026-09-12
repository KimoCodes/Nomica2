Implement a **comprehensive, reliable, and professional email notification system** for the platform.

### Core Requirement

Whenever a **coach/admin or client performs an action that requires the attention, awareness, confirmation, response, or follow-up of the other party**, automatically send an email notification to the relevant parties.

The system should intelligently determine:

* Who performed the action.
* Who needs to be notified.
* Whether one or both parties need to receive the notification.
* What information each recipient needs to know.
* Whether the action requires a response, confirmation, approval, or follow-up.

### Email Design & Branding

Every email must look **beautiful, modern, professional, and consistent with the website's visual identity**.

Each email should:

* Include the site's official **logo** prominently but appropriately.
* Use the site's existing colors, typography, and branding where possible.
* Have a clean, responsive layout that works well on both desktop and mobile.
* Have a clear subject line and visual hierarchy.
* Clearly explain what happened and why the recipient is receiving the email.
* Include relevant details about the action.
* Provide an obvious **call-to-action button** when the recipient needs to take action.
* Include useful links back to the relevant page/dashboard on the platform.
* Include appropriate timestamps and contextual information where useful.
* Have a professional footer with platform branding and relevant account/support information.
* Avoid looking like a generic automated/system email.

### Notification Coverage

Audit the entire application and identify **all important interactions between clients, coaches, and administrators** that should trigger notifications.

Examples may include, but are not limited to:

* Appointment/session bookings.
* Booking confirmations, cancellations, or rescheduling.
* New coaching requests.
* Coach accepting or rejecting a request.
* Client accepting or rejecting an action.
* New messages or important communications.
* Program enrollment or assignment.
* Program updates.
* Payment-related events.
* Subscription changes.
* Account or profile-related actions requiring attention.
* Admin approvals or decisions.
* Coach availability changes.
* Session reminders.
* Missed or completed sessions.
* Important status changes.
* Requests requiring approval or confirmation.
* Any other workflow where one party reasonably needs to know about an action taken by the other.

Do **not** blindly send emails for every database event. Use good judgment and focus on meaningful user-facing actions that require awareness or action.

### Email Templates

Create a reusable email template/component system rather than designing each email independently.

The system should support different notification types while maintaining a consistent branded structure.

For example:

**Header**

* Site logo
* Platform name

**Content**

* Clear notification title
* Short explanation of what happened
* Relevant details
* Status or important information

**Action**

* Primary CTA button when applicable
* Link to the relevant platform page

**Footer**

* Platform branding
* Support/contact information
* Appropriate notification/preferences information

Each notification type should have its own appropriately written content while following the same overall design system.

### Reliability & Architecture

Build this as a **centralized notification system** so future notification types can easily be added without duplicating email logic throughout the application.

Ensure:

* Emails are sent asynchronously where appropriate so they do not unnecessarily slow down user actions.
* Failed email delivery is handled gracefully.
* Email failures are logged for administrators/developers.
* Duplicate emails are prevented where possible.
* Notifications are triggered only after the underlying action succeeds.
* Sensitive information is never unnecessarily exposed in emails.
* Email templates are reusable and maintainable.
* The system works correctly in both development and production environments.

### Important

Before implementing anything:

1. **Scan and understand the existing project architecture.**
2. Identify the current authentication, users, coach/client relationships, actions/workflows, database models, and existing email infrastructure.
3. Identify whether the project already has an email service, SMTP configuration, email templates, or notification system.
4. Reuse existing infrastructure where appropriate instead of creating unnecessary duplicates.
5. Map the important coach ↔ client ↔ admin workflows and determine where notifications are required.
6. Then implement the notification system in **small, logical phases**, testing each phase before moving to the next.

### Final Goal

The end result should feel like a **mature production platform**, where users are reliably informed about important actions affecting them, while every email feels intentionally designed, branded, polished, and consistent with the website.

Do not use generic placeholder emails. Use the site's **actual logo and existing brand identity** wherever those assets already exist in the project.
