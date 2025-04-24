import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { registerServiceWorkerAndSubscribe } from "./pushManager.js";
import { Button, TextField } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function App() {
  const [message, setMessage] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    (async () => {
      if ("PushManager" in window) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) return;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          setIsSubscribed(true);
        }
      }
    })();
  }, []);

  const subscribeUser = async () => {
    try {
      const subscription = await registerServiceWorkerAndSubscribe(
        "<YOUR PUBLIC VAPID KEY>"
      );

      // Send subscription to the server
      await fetch("http://localhost:5000/api/save-subscription", {
        method: "POST",
        body: JSON.stringify(subscription),
        headers: {
          "Content-Type": "application/json",
        },
      });
      setIsSubscribed(true);
    } catch (error) {
      console.error("Failed to subscribe the user: ", error);
    }
  };

  const sendNotification = async () => {
    await fetch("http://localhost:5000/api/notify-all", {
      method: "POST",
      body: JSON.stringify({ message }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const unSubscribeUser = async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration.pushManager.getSubscription();
    fetch("http://localhost:5000/api/remove-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
    const unsubscribed = await subscription.unsubscribe();
    if (unsubscribed) {
      setIsSubscribed(false);
      setMessage("");
      console.info("Successfully unsubscribed from push notifications.");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
          <h1>Web Push Notifications</h1>
          {!isSubscribed ? (
            <Button variant="contained" onClick={subscribeUser}>
              Subscribe to Notifications
            </Button>
          ) : (
            <Button variant="contained" onClick={unSubscribeUser}>
              Unsubscribe
            </Button>
          )}
          {isSubscribed && (
            <div>
              <div>
                <TextField
                  sx={{ minWidth: "500px" }}
                  multiline
                  margin="normal"
                  placeholder="Enter nofication message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <Button variant="outlined" onClick={sendNotification}>
                Send Notification
              </Button>
            </div>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
