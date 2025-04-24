const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const webpush = require("web-push");

dotenv.config();

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

webpush.setVapidDetails(
  "mailto:test@test.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Store subscriptions in memory or DB
const subscriptions = [];

app.post("/api/save-subscription", (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription); // ideally, store with user info
  res.status(201).json({ message: "Subscribed" });

  const payload = JSON.stringify({
    title: "test",
    body: "New notification from backend",
  });

  console.log(subscription);
  webpush
    .sendNotification(
      { endpoint: subscription?.endpoint, keys: subscription?.keys },
      payload
    )
    .then((res) => console.log("Notification send00000000", res))
    .catch((error) => {
      console.error(error.stack);
    });
});

app.post("/api/notify-all", async (req, res) => {
  const payload = JSON.stringify({
    title: "System Notification",
    body: `${req.body.message}`,
  });

  const results = await Promise.allSettled(
    subscriptions.map((sub) => webpush.sendNotification(sub, payload))
  );

  res.json({ results });
});

app.post("/api/remove-subscription", (req, res) => {
  console.log("/remove-subscription");
  console.log(req.body);
  console.log(`Unsubscribing ${req.body.endpoint}`);
  const index = subscriptions.findIndex(
    (item) => item.endpoint === req.body.endpoint
  );
  if (index != -1) {
    subscriptions.splice(index, 1);
  }
  res.status(200).json({ message: "Unsubscribed" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
