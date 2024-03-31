import express from "express";
import session from "express-session";

declare module "express-session" {
  interface SessionData {
    firstAccessTime: string;
    counter: number;
    message: string;
  }
}

const app = express();
let port: number;

const args = process.argv.slice(2);

if (args.length == 0) {
  port = 3000;
} else {
  port = parseInt(args[0], 10);
}

app.set("trust proxy", 1);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "session-secret",
    name: "session-example-session",
    resave: false,
    saveUninitialized: true,
    cookie: {
      path: "/", // default
      httpOnly: true, // default
      maxAge: 10 * 1000, // 10sec
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (!req.session.firstAccessTime) {
    const now = new Date();
    req.session.firstAccessTime = now.toISOString();
  }

  req.session.counter = req.session.counter ? req.session.counter + 1 : 1;

  next();
});

app.post("/message", (req, res) => {
  const message = req.body["message"];

  req.session.message = message;

  res.send({
    firstAccessTime: req.session.firstAccessTime,
    counter: req.session.counter,
    message: req.session.message,
  });
});

app.get("/message", (req, res) => {
  res.send({
    firstAccessTime: req.session.firstAccessTime,
    counter: req.session.counter,
    message: req.session.message ? req.session.message : "Hello World",
  });
});

app.listen(port, () => {
  console.log(`[${new Date().toISOString()}] start server[${port}]`);
});
