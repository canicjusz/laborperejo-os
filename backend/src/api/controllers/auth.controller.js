import nodemailer from "nodemailer";
import "../../env.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  getPasswordByID,
  updatePassword,
  makeVerifiedByEmail,
  getCredentialsByEmail,
  createPasswordToken,
  deletePasswordTokenByID,
  getPasswordByEmail,
} from "../services/user.service.js";
import { getUserAndProfileByID } from "../services/profile.service.js";
import { createTemplate } from "../services/user.service.js";
import { destroySessions } from "../services/session.service.js";
import handler from "../utils/handler.js";
import prismaPkg from "@prisma/client";
const { Prisma } = prismaPkg;
const ourEmail = '"Jan Michalak" <laborperejo@zohomail.eu>';
const host = process.env.HEROKU
  ? "laborperejo.herokuapp.com"
  : "localhost:5000";

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.eu",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendConfirmationEmail = async (email) => {
  const token = jwt.sign(
    {
      email,
    },
    process.env.EMAIL_TOKEN_SECRET,
    {
      expiresIn: "2h",
    }
  );
  const url = `http://${host}/konfirmi-registrigxon/${token}`;
  await transporter.sendMail({
    from: ourEmail,
    to: email,
    subject: "Bonvenon al Laborperejo!",
    html: `Bonvenon al Laborperejo!
        Vi povas konfirmi vian registriĝon per <a href="${url}">ĉi tiu ligilo</a>.`,
  });
  return "Farite";
};

const editPassword = async (req, res) => {
  try {
    const { ID: paramsID } = req.params;
    const { curr: currPassword, new: newPassword } = req.body;
    const [user, error] = await handler(getPasswordByID, null, paramsID);
    if (error) {
      throw error;
    }
    if (!user) {
      return res
        .status(400)
        .json({ error: "Uzanto kun ĉi tiu identigilo ne ekzistas." });
    }
    const isPasswordCorrect = await bcrypt.compare(currPassword, user.password);
    if (isPasswordCorrect) {
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await updatePassword(paramsID, hashedNewPassword);
      const sessionID = req.session.id;
      const [, sessionError] = await handler(
        destroySessions,
        null,
        paramsID,
        sessionID
      );
      if (sessionError) {
        console.error(sessionError);
        return res.status(500).json({
          error: "Ni ne povis elsaluti vin el aliaj klientoj.",
        });
      }
      res.send("Farite");
    } else {
      res.status(400).json({ error: "Malĝusta pasvorto." });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error:
        "Ni ial ne povis ŝanĝi vian pasvorton. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
};

const resendConfirmationEmail = async (req, res) => {
  try {
    const email = req.body.email;
    const [credentials, searchError] = await handler(
      getCredentialsByEmail,
      null,
      email
    );
    if (searchError) {
      throw searchError;
    }
    if (!credentials.password) {
      return res.status(400).json({
        error: "Uzanto kun ĉi tiu retpoŝtadreso ne ekzistas.",
      });
    }
    if (credentials.confirmed) {
      return res.status(400).json({
        error: "Uzanto kun ĉi tiu retpoŝtadreso jam registriĝis.",
      });
    }
    const [, sendingError] = await handler(sendConfirmationEmail, null, email);
    if (sendingError) {
      throw sendingError;
    }
    res.send("Ni sendis al vi mesaĝon kun ligilo por fini vian registriĝon.");
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error:
        "Ni ial ne povis sendi la repoŝtmesaĝon. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
};

const confirmEmail = async (req, res) => {
  try {
    const token = req.body.token;
    jwt.verify(token, process.env.EMAIL_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(400).json({
            error: "La konfirmiĝĵetono senvalidiĝis.",
          });
        } else if (err.name === "JsonWebTokenError") {
          return res.status(400).json({
            error:
              "La konfirmiĝĵetono estas nevalida. Bonvolu kontroli, ĉu vi uzas la ĝustan ligilon.",
          });
        }
        throw err;
      }
      const email = decoded.email;
      await makeVerifiedByEmail(email);
      res.send("Farite");
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error:
        "Ni ial ne povis konfirmi la registriĝon. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
};

const register = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const email = req.body.email;
    req.body.password = hashedPassword;
    const [, creationError] = await handler(createTemplate, null, req.body);
    if (creationError) {
      if (
        creationError instanceof Prisma.PrismaClientKnownRequestError &&
        creationError.code === "P2002"
      ) {
        return res.status(400).json({
          error: "Uzanto kun ĉi tiu retpoŝtadreso jam ekzistas.",
        });
      }
      throw creationError;
    }
    const [x, emailError] = await handler(sendConfirmationEmail, null, email);
    //
    if (emailError) {
      console.error(emailError);
      return res.status(500).json({
        error:
          "Ni ial ne povis sendi la repoŝtmesaĝon. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
      });
    }
    res.send("Farite :)");
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error:
        "Ni ial ne povis krei la profilon. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, saveSession } = req.body;
    const [credentials, error] = await handler(
      getCredentialsByEmail,
      null,
      email
    );
    if (error) throw error;
    if (!credentials) {
      return res.status(400).json({
        error: "Uzanto kun ĉi tiu retpoŝtadreso ne ekzistas.",
      });
    }
    req.session.cookie.maxAge = saveSession ? 1000 * 60 * 60 * 24 * 90 : null;
    if (credentials.confirmed) {
      const isPasswordCorrect = await bcrypt.compare(
        password,
        credentials.password
      );
      if (isPasswordCorrect) {
        const ID = credentials.ID;
        req.session.ID = ID;
        const user = await getUserAndProfileByID(ID);
        res.json(user);
      } else {
        return res.status(400).json({
          error: "Malĝusta pasvorto.",
        });
      }
    } else {
      return res.status(403).json({
        error:
          "Unue finu registriĝon per la ligilo sendita al via retpoŝtadreso.",
      });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error:
        "Ni ial ne povis vin ensalutigi. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
};

const sendPasswordReset = async (req, res) => {
  try {
    const email = req.body.email;
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    const [token, error] = await handler(
      createPasswordToken,
      null,
      resetTokenHash,
      email
    );
    if (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === "P2025" || error.code === "P2011")
      ) {
        if (error.code === "P2025") {
          return res.status(400).json({
            error: "Uzanto kun ĉi tiu retpoŝtadreso ne ekzistas.",
          });
        }
        if (error.code === "P2011") {
          return res.status(422).json({
            error: "La retpoŝtmesaĝo jam estis al vi sendita antaŭe.",
          });
        }
      }
      throw error;
    }
    const user = token.user;
    const urlToken = jwt.sign(
      { token: resetToken },
      process.env.PASSWORD_TOKEN_SECRET,
      {
        expiresIn: "2h",
      }
    );
    const url = `http://${host}/restarigi-pasvorton/${user.ID}/${urlToken}`;
    await transporter.sendMail({
      from: ourEmail,
      to: email,
      subject: "Restarigi pasvorton",
      html: `Saluton!
    Vi petis restarigon de la pasvorto de via konto. Vi povas fari ĉi tion per <a href="${url}">ĉi tiu ligilo</a>.`,
    });
    res.send("Ni sendis la mesaĝon kun restarig-ligilon al vi.");
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error:
        "Ni ial ne povis sendi al vi retpoŝtmesaĝon. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
};

const deleteSession = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        error:
          "Ni ial ne povis vin elsalutigi. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
      });
    }
    res.send("Farite");
  });
};

const getSession = (req, res) => {
  const sessionExists = typeof req.session?.ID === "number";
  const response = sessionExists ? { ID: req.session.ID } : null;
  res.send(response);
};

const passwordReset = async (req, res) => {
  try {
    const { id, token, password } = req.body;
    const [tokenDB, error] = await handler(deletePasswordTokenByID, null, id);
    if (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({
          error: "Ĉi tiu ĵetono ne ekzistas.",
        });
      }
      throw error;
    }

    jwt.verify(
      token,
      process.env.PASSWORD_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            return res.status(403).json({
              error: "La ĵetono senvalidiĝis.",
            });
          } else if (err.name === "JsonWebTokenError") {
            return res.status(400).json({
              error:
                "La ĵetono estas nevalida. Bonvolu kontroli, ĉu vi uzas la ĝustan ligilon.",
            });
          }
          throw err;
        }

        const isValid = await bcrypt.compare(decoded.token, tokenDB.token);
        if (isValid) {
          const hashedPassword = await bcrypt.hash(password, 10);
          await updatePassword(id, hashedPassword);
          destroySessions(id);
          res.send("Via pasvorto sukcese ŝanĝiĝis.");
        } else {
          return res.status(400).json({
            error:
              "La ĵetono estas nevalida. Bonvolu kontroli, ĉu vi uzas la ĝustan ligilon.",
          });
        }
      }
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error:
        "Ni ial ne povis restarigi vian pasvorton. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
};

export {
  confirmEmail,
  passwordReset,
  deleteSession,
  sendPasswordReset,
  login,
  register,
  editPassword,
  getSession,
  resendConfirmationEmail,
};
