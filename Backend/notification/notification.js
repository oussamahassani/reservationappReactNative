const cron = require('node-cron');
const nodemailer = require('nodemailer');
const User = require('../models/userModel')
const PromationCode = require('../models/promotionModel')
const Evente = require('../models/eventModel')

// Configurez votre transporteur mail
/*const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    // Do not fail on invalid certificates
    rejectUnauthorized: false,
  },
});
*/
var transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "a1632d046d7b6c",
    pass: "a3a35905556a11"
  }
});
// Cron : tous les jours à 8h du matin
var send_notification =  cron.schedule('0 8 * * *', async () => {
  try {
    const now = new Date();
console.log("notification started")
    // 1. Récupère les utilisateurs avec le rôle "user"
    const users = await User.findByRole('user');
    const fourDaysAgo = new Date(now);
    fourDaysAgo.setDate(now.getDate() - 4);

    const createdAtFrom = fourDaysAgo.toISOString().slice(0, 10);
   const createdAtNow = now.toISOString().slice(0, 10);

    // 2. Promotions valides et non expirées
    const promotions = await PromationCode.getAll({
isactive : true,
  created_at_from: createdAtFrom,
  created_at_to: createdAtNow
});

    // 3. Nouveaux lieux ajoutés dans les dernières 24h
    const yesterday = new Date(now.getTime() - 48 * 60 * 60 * 1000);

   const yesterdayAtNow = yesterday.toISOString().slice(0, 10);
    const newvent = await Evente.getAll({
     "status": "completed",

  created_at_from: yesterdayAtNow,
  created_at_to: createdAtNow
    });
    console.log(yesterdayAtNow)
        console.log(createdAtNow)
    if (promotions.length === 0 && newvent.length === 0) {
      console.log('Aucune nouvelle promotion ou lieu.');
      return;
    }
console.log(promotions)
console.log(newvent)
    const emailContent = `
      <h3>Nouveautés sur notre plateforme</h3>
      ${promotions.length > 0 ? '<p><strong>Promotions disponibles :</strong></p>' : ''}
      <ul>
        ${promotions.map(p => `<li>${p.title} - jusqu'au ${p.end_date.toLocaleDateString()}</li>`).join('')}
      </ul>
      ${newvent.length > 0 ? '<p><strong>Nouveaux lieux :</strong></p>' : ''}
      <ul>
        ${newvent.map(pl => `<div><li><em>titel:${pl.title }</em><p> location : ${pl.location } organizer : ${pl.organizer }</p></li> </div>`).join('')}
      </ul>
    `;

    // 4. Envoie le mail à chaque utilisateur
    if(promotions.length > 0 || newvent.length > 0 ){
    for (const user of users) {
    const result =   await transporter.sendMail({
        from: 'votre.email@gmail.com',
        to: user.email,
        subject: '🎉 Nouveaux événements et promotions disponibles',
        html: emailContent,
      });
          console.log('Emails envoyés avec succès.',result);
    }


          console.log('Emails envoyés avec succès.');
}
console.log("notification end")

  } catch (err) {
    console.error('Erreur lors de l’envoi des emails :', err);
  }
});

var start = () => {
    console.log("appel cron")
    send_notification.start();
}
var stop = () => {
        send_notification.stop();

}
module.exports = {
  start,
  stop,
};
