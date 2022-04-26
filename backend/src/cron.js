import cron from "node-cron";
import prisma from "./prisma.js";

const closeOffers = async () => {
  const now = new Date();
  await prisma.offer.updateMany({
    where: {
      closed: false,
      close_at: {
        lte: now,
      },
    },
    data: {
      closed: true,
      close_at: null,
    },
  });
};

const removePasswordTokens = async () => {
  const now = new Date();
  await prisma.passwordToken.deleteMany({
    where: {
      expiresAt: {
        lte: now,
      },
    },
  });
};

cron.schedule("0 * * * *", closeOffers);
cron.schedule("0 * * * *", removePasswordTokens);
