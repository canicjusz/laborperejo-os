import cron from "node-cron";
import prisma from "./prisma.js";

const closeOffers = async () => {
  const now = new Date();
  const offers = await prisma.offer.updateMany({
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

cron.schedule("0 * * * *", closeOffers);
