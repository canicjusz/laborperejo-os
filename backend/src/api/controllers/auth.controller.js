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
    html: `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          .ExternalClass {width: 100%;}
      </style>
      </head>
      <body style="font-family: Arial, Helvetica, sans-serif">
        <table cellpadding="0" cellspacing="0" border="0" style="max-width: 600px">
          <tbody>
            <td>
              <table cellpadding="0" cellspacing="0" border="0" style="width: 100%">
                  <tbody>
                      <td style="text-align: center">
                          <img src="https://laborperejo.herokuapp.com/logo.png" />
                      </td>
                  </tbody>
              </table>
              <h1>Bonvenon al Laborperejo!</h1>

              <p>Vi povas konfirmi vian registri??on per la suba butono.</p>
              <table cellpadding="0" cellspacing="0" border="0" style="width: 100%">
                  <tbody>
                      <td style="text-align: center">
                        <a href="${url}" style="height: 50px; width: 200px; background: #1b75bc; color: white; display: inline-block; line-height: 50px; text-decoration: none; border-radius: 30px;">Finregistri??i</a>
                      </td>
                  </tbody>
              </table>
            </td>
          </tbody>
        </table>
      </body>
    </html>`,
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
        .json({ error: "Uzanto kun ??i tiu identigilo ne ekzistas." });
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
      return res.send("Via pasvorto ??isdati??is");
    } else {
      return res.status(400).json({ error: "Mal??usta pasvorto." });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error:
        "Ni ial ne povis ??an??i vian pasvorton. Bonvolu reprovi poste, a?? kontaktu nin retpo??te.",
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
    if (!credentials) {
      return res.status(400).json({
        error: "Uzanto kun ??i tiu retpo??tadreso ne ekzistas.",
      });
    }
    if (credentials.confirmed) {
      return res.status(400).json({
        error: "Uzanto kun ??i tiu retpo??tadreso jam registri??is.",
      });
    }
    const [, sendingError] = await handler(sendConfirmationEmail, null, email);
    if (sendingError) {
      throw sendingError;
    }
    res.send("Ni sendis al vi mesa??on kun ligilo por fini vian registri??on.");
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error:
        "Ni ial ne povis sendi la repo??tmesa??on. Bonvolu reprovi poste, a?? kontaktu nin retpo??te.",
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
            error: "La konfirmi????etono senvalidi??is.",
          });
        } else if (err.name === "JsonWebTokenError") {
          return res.status(400).json({
            error:
              "La konfirmi????etono estas nevalida. Bonvolu kontroli, ??u vi uzas la ??ustan ligilon.",
          });
        }
        throw err;
      }
      const email = decoded.email;
      const [, verificationError] = await handler(
        makeVerifiedByEmail,
        null,
        email
      );
      if (verificationError) {
        console.error(verificationError);
        return res.status(500).json({
          error:
            "Ni ial ne povis konfirmi la registri??on. Bonvolu reprovi poste, a?? kontaktu nin retpo??te.",
        });
      }
      res.send("Via profilo ??isdati??is");
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error:
        "Ni ial ne povis konfirmi la registri??on. Bonvolu reprovi poste, a?? kontaktu nin retpo??te.",
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
          error: "Uzanto kun ??i tiu retpo??tadreso jam ekzistas.",
        });
      }
      throw creationError;
    }
    const [, emailError] = await handler(sendConfirmationEmail, null, email);
    if (emailError) {
      console.error(emailError);
      return res.status(500).json({
        error:
          "Ni ial ne povis sendi la repo??tmesa??on. Bonvolu reprovi poste, a?? kontaktu nin retpo??te.",
      });
    }
    res.send("Vi registri??is");
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error:
        "Ni ial ne povis krei la profilon. Bonvolu reprovi poste, a?? kontaktu nin retpo??te.",
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
        error: "Uzanto kun ??i tiu retpo??tadreso ne ekzistas.",
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
          error: "Mal??usta pasvorto.",
        });
      }
    } else {
      return res.status(403).json({
        error:
          "Unue finu registri??on per la ligilo sendita al via retpo??tadreso.",
      });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error:
        "Ni ial ne povis vin ensalutigi. Bonvolu reprovi poste, a?? kontaktu nin retpo??te.",
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
        (error.code === "P2025" || error.code === "P2003")
      ) {
        if (error.code === "P2025") {
          return res.status(400).json({
            error: "Uzanto kun ??i tiu retpo??tadreso ne ekzistas.",
          });
        }
        if (error.code === "P2003") {
          return res.status(422).json({
            error: "La retpo??tmesa??o jam estis al vi sendita anta??e.",
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
      html: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html>
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
          <style type="text/css">
            .ExternalClass {width: 100%;}
        </style>
        </head>
        <body style="font-family: Arial, Helvetica, sans-serif">
          <table cellpadding="0" cellspacing="0" border="0" style="max-width: 600px">
            <tbody>
              <td>
                <table cellpadding="0" cellspacing="0" border="0" style="width: 100%">
                    <tbody>
                        <td style="text-align: center">
                            <img src="https://laborperejo.herokuapp.com/logo.png" />
                        </td>
                    </tbody>
                </table>
                <p>Saluton,</p>
      
                <p>Vi petis restarigi la pasvorton de via konto. Vi povas fari ??i tion per la suba butono.</p>
                <table cellpadding="0" cellspacing="0" border="0" style="width: 100%">
                    <tbody>
                        <td style="text-align: center">
                          <a href="${url}" style="height: 50px; width: 200px; background: #1b75bc; color: white; display: inline-block; line-height: 50px; text-decoration: none; border-radius: 30px;">Restarigi</a>
                        </td>
                    </tbody>
                </table>
                <p>Se vi ne volas restarigi la pasvorton, simple ignoru la mesa??on kaj ne alklaku la butonon. ??i senvalidi??os post 2 horoj.</p>
              </td>
            </tbody>
          </table>
        </body>
      </html>`,
    });
    res.send("Ni sendis la mesa??on kun restarig-ligilon al vi.");
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error:
        "Ni ial ne povis sendi al vi retpo??tmesa??on. Bonvolu reprovi poste, a?? kontaktu nin retpo??te.",
    });
  }
};

const deleteSession = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        error:
          "Ni ial ne povis vin elsalutigi. Bonvolu reprovi poste, a?? kontaktu nin retpo??te.",
      });
    }
    res.send("Vi elsalutis.");
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

    jwt.verify(
      token,
      process.env.PASSWORD_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            return res.status(403).json({
              error: "La ??etono senvalidi??is.",
            });
          } else if (err.name === "JsonWebTokenError") {
            return res.status(400).json({
              error:
                "La ??etono estas nevalida. Bonvolu kontroli, ??u vi uzas la ??ustan ligilon.",
            });
          }
          throw err;
        }
        const [tokenDB, deletingError] = await handler(
          deletePasswordTokenByID,
          null,
          id
        );
        if (deletingError) {
          if (
            deletingError instanceof Prisma.PrismaClientKnownRequestError &&
            deletingError.code === "P2025"
          ) {
            return res.status(404).json({
              error: "??i tiu ??etono ne ekzistas.",
            });
          }
          throw deletingError;
        }

        const isValid = await bcrypt.compare(decoded.token, tokenDB.token);
        if (isValid) {
          const hashedPassword = await bcrypt.hash(password, 10);
          await updatePassword(id, hashedPassword);
          destroySessions(id);
          res.send("Via pasvorto sukcese ??an??i??is.");
        } else {
          return res.status(400).json({
            error:
              "La ??etono estas nevalida. Bonvolu kontroli, ??u vi uzas la ??ustan ligilon.",
          });
        }
      }
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error:
        "Ni ial ne povis restarigi vian pasvorton. Bonvolu reprovi poste, a?? kontaktu nin retpo??te.",
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
