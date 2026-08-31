// Krishendree: replace this stub with real JWT verification (verify token, load user, check role).
// Keep the same default export so everyone's imports keep working when you swap it.

export default function auth(req, res, next) {
  req.user = null
  next()
}